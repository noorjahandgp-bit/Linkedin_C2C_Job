import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List, Dict, Any
from jobpilot.config import DB_PATH

class Database:
    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = db_path or DB_PATH
        self.init_db()

    def get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        return conn

    def init_db(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS applications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    candidate_name TEXT NOT NULL,
                    recruiter_name TEXT,
                    recruiter_email TEXT NOT NULL,
                    company TEXT,
                    job_title TEXT NOT NULL,
                    job_location TEXT,
                    post_url TEXT,
                    job_description TEXT,
                    submission_date TEXT NOT NULL,
                    email_status TEXT NOT NULL,
                    resume_filename TEXT,
                    email_subject TEXT,
                    email_body TEXT,
                    created_at TEXT NOT NULL
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS processed_posts (
                    post_url TEXT PRIMARY KEY,
                    recruiter_email TEXT,
                    job_title TEXT,
                    company TEXT,
                    scraped_at TEXT NOT NULL,
                    status TEXT NOT NULL,
                    reason TEXT
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS recruiters (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    email TEXT UNIQUE NOT NULL,
                    company TEXT,
                    hiring_team TEXT,
                    first_seen TEXT NOT NULL,
                    last_contacted TEXT
                )
            """)
            conn.commit()

    def is_post_processed(self, post_url: str) -> bool:
        if not post_url:
            return False
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1 FROM processed_posts WHERE post_url = ?", (post_url.strip(),))
            if cursor.fetchone():
                return True
            cursor.execute("SELECT 1 FROM applications WHERE post_url = ?", (post_url.strip(),))
            return cursor.fetchone() is not None

    def is_recruiter_contacted(self, recruiter_email: str, within_days: int = 30) -> bool:
        if not recruiter_email:
            return False
        cutoff_date = (datetime.now() - timedelta(days=within_days)).isoformat()
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 1 FROM applications 
                WHERE LOWER(recruiter_email) = LOWER(?) 
                  AND email_status IN ('Sent', 'Draft Prepared / Simulated') 
                  AND submission_date >= ?
            """, (recruiter_email.strip(), cutoff_date))
            return cursor.fetchone() is not None

    def record_processed_post(self, post_url: str, recruiter_email: str, job_title: str, company: str, status: str, reason: str = ""):
        if not post_url:
            return
        now_str = datetime.now().isoformat()
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO processed_posts (post_url, recruiter_email, job_title, company, scraped_at, status, reason)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(post_url) DO UPDATE SET 
                    status = excluded.status,
                    reason = excluded.reason,
                    scraped_at = excluded.scraped_at
            """, (post_url.strip(), recruiter_email.strip() if recruiter_email else None, job_title, company, now_str, status, reason))
            conn.commit()

    def record_submission(self, app_data: Dict[str, Any]) -> int:
        now_str = datetime.now().isoformat()
        post_url = (app_data.get("post_url") or "").strip()
        recruiter_email = (app_data.get("recruiter_email") or "").strip()

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO applications (
                    candidate_name, recruiter_name, recruiter_email, company,
                    job_title, job_location, post_url, job_description,
                    submission_date, email_status, resume_filename,
                    email_subject, email_body, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                app_data.get("candidate_name", ""),
                app_data.get("recruiter_name", ""),
                recruiter_email,
                app_data.get("company", ""),
                app_data.get("job_title", ""),
                app_data.get("job_location", ""),
                post_url,
                app_data.get("job_description", ""),
                app_data.get("submission_date", now_str),
                app_data.get("email_status", "Sent"),
                app_data.get("resume_filename", ""),
                app_data.get("email_subject", ""),
                app_data.get("email_body", ""),
                now_str
            ))
            app_id = cursor.lastrowid

            # Update processed_posts directly on same cursor
            if post_url:
                cursor.execute("""
                    INSERT INTO processed_posts (post_url, recruiter_email, job_title, company, scraped_at, status, reason)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(post_url) DO UPDATE SET 
                        status = excluded.status,
                        reason = excluded.reason,
                        scraped_at = excluded.scraped_at
                """, (post_url, recruiter_email if recruiter_email else None, app_data.get("job_title", ""), app_data.get("company", ""), now_str, "submitted", "Application sent via Gmail"))

            # Update recruiters table directly on same cursor
            if recruiter_email:
                cursor.execute("""
                    INSERT INTO recruiters (name, email, company, hiring_team, first_seen, last_contacted)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON CONFLICT(email) DO UPDATE SET
                        name = COALESCE(excluded.name, recruiters.name),
                        company = COALESCE(excluded.company, recruiters.company),
                        last_contacted = excluded.last_contacted
                """, (
                    app_data.get("recruiter_name", ""),
                    recruiter_email.lower(),
                    app_data.get("company", ""),
                    app_data.get("hiring_team", ""),
                    now_str,
                    now_str
                ))

            conn.commit()
            return app_id

    def get_applications(self, limit: int = 100) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM applications ORDER BY id DESC LIMIT ?", (limit,))
            return [dict(row) for row in cursor.fetchall()]

    def get_stats(self) -> Dict[str, Any]:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM applications")
            total_apps = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM applications WHERE email_status IN ('Sent', 'Draft Prepared / Simulated')")
            sent_apps = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM processed_posts WHERE status LIKE '%duplicate%' OR status LIKE '%skipped%'")
            duplicates_prevented = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM recruiters")
            total_recruiters = cursor.fetchone()[0]

            return {
                "total_applications": total_apps,
                "sent_applications": sent_apps,
                "duplicates_prevented": duplicates_prevented,
                "total_recruiters": total_recruiters
            }
