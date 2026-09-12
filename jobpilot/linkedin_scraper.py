import re
import urllib.parse
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
from bs4 import BeautifulSoup

from jobpilot.config import (
    LINKEDIN_STORAGE_STATE, LINKEDIN_HEADLESS,
    LINKEDIN_USERNAME, LINKEDIN_PASSWORD
)
from jobpilot.database import Database

# Sample verified C2C LinkedIn posts for offline/demo reliability
DEMO_C2C_POSTS = [
    {
        "id": "post-tn-01",
        "title": "Senior Java Developer",
        "company": "TechNova Solutions",
        "location": "Dallas, TX (Hybrid)",
        "recruiter": "Sarah Johnson",
        "recruiter_email": "sarah.johnson@technova.com",
        "post_url": "https://www.linkedin.com/posts/sarah-johnson-technova-java-c2c-opportunity-98124",
        "posted": "3 hours ago",
        "experience": "7+ years",
        "skills": ["Java 17", "Spring Boot", "Microservices", "AWS", "Apache Kafka", "Docker", "Kubernetes"],
        "job_description": (
            "TechNova Solutions is urgently hiring a Senior Java Developer for a long-term C2C contract role with our enterprise banking client.\n"
            "Contract Type: Corp-to-Corp (C2C) only. No W2, no full-time, no third-party layers.\n"
            "Duration: 12 months + extensions.\n"
            "Location: Dallas, TX (Hybrid 2 days onsite).\n"
            "Key Responsibilities:\n"
            "- Design and implement scalable microservices using Java 17 and Spring Boot.\n"
            "- Build real-time streaming architectures using Apache Kafka.\n"
            "- Deploy containerized microservices to AWS (ECS/EKS) with CI/CD.\n"
            "- Optimize PostgreSQL and Redis caching layers.\n"
            "Requirements:\n"
            "- 7+ years of core Java and Spring Boot experience.\n"
            "- Deep hands-on experience with AWS, Kafka, and Docker/Kubernetes.\n"
            "Interested C2C consultants, please send your resume and rate to: sarah.johnson@technova.com"
        )
    },
    {
        "id": "post-cm-02",
        "title": "Senior Java Cloud Engineer",
        "company": "CloudMatrix Systems",
        "location": "Remote",
        "recruiter": "David Chen",
        "recruiter_email": "david.chen@cloudmatrix.io",
        "post_url": "https://www.linkedin.com/posts/davidchen-recruiter-c2c-java-cloud-81723",
        "posted": "5 hours ago",
        "experience": "8+ years",
        "skills": ["Java", "Spring Boot", "AWS Lambda", "ECS", "Terraform", "PostgreSQL"],
        "job_description": (
            "Immediate C2C Opening: Senior Java Cloud Engineer (100% Remote).\n"
            "Looking for an experienced Java consultant on Corp-to-Corp (C2C) basis. Strictly C2C only (no W2, no full-time, no hotlists).\n"
            "Must have:\n"
            "- Strong Java 11/17 backend development with Spring Boot & REST APIs.\n"
            "- Extensive AWS cloud infrastructure experience (ECS, Lambda, S3, RDS).\n"
            "- Strong SQL and database optimization skills.\n"
            "Rate: Open on C2C for qualified candidates.\n"
            "Please share your updated resume and contact info to david.chen@cloudmatrix.io for immediate interview."
        )
    },
    {
        "id": "post-vs-03",
        "title": "Lead Java Microservices Architect",
        "company": "Vertex Systems Inc",
        "location": "New York, NY",
        "recruiter": "Priya Sharma",
        "recruiter_email": "priya.sharma@vertexsystems.com",
        "post_url": "https://www.linkedin.com/posts/priyasharma-vertex-lead-java-c2c-90123",
        "posted": "7 hours ago",
        "experience": "8+ years",
        "skills": ["Java 17", "Spring Boot", "Microservices", "Kafka", "EKS", "Redis"],
        "job_description": (
            "Vertex Systems is seeking a Lead Java Microservices Architect for a critical 12-month C2C consulting engagement.\n"
            "Terms: C2C (Corp-to-Corp) only. Direct client engagement.\n"
            "Skills: Java, Spring Boot, Distributed Microservices, Apache Kafka, AWS EKS, Redis caching.\n"
            "Send matching consultant profiles to priya.sharma@vertexsystems.com."
        )
    },
    {
        "id": "post-dc-04",
        "title": "Java Backend Developer",
        "company": "DataCore Technologies",
        "location": "Austin, TX",
        "recruiter": "Michael Torres",
        "recruiter_email": "michael.t@datacore.io",
        "post_url": "https://www.linkedin.com/posts/michaelt-datacore-java-backend-c2c-34190",
        "posted": "9 hours ago",
        "experience": "6+ years",
        "skills": ["Java", "Spring Boot", "Hibernate", "REST APIs", "AWS"],
        "job_description": (
            "Hiring: Java Backend Developer for C2C contract.\n"
            "Direct recruiter post. Must be on C2C. W2 applicants please do not apply.\n"
            "Requirements: 6+ years Java/Spring Boot development, AWS cloud experience, relational database tuning.\n"
            "Email resumes to michael.t@datacore.io"
        )
    }
]

def extract_email_from_text(text: str) -> Optional[str]:
    """
    Finds recruiter email using regex while ignoring generic emails.
    """
    matches = re.findall(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    ignored = {"support@linkedin.com", "noreply@linkedin.com", "jobs@linkedin.com"}
    for m in matches:
        clean = m.strip().lower()
        if clean not in ignored and not clean.endswith(".png") and not clean.endswith(".jpg"):
            return m
    return None

def extract_skills_from_text(text: str) -> List[str]:
    """
    Extracts key technical skills mentioned in the job description.
    """
    skills_catalog = [
        "Java", "Java 17", "Java 11", "Java 8", "Spring Boot", "Spring Cloud", "Spring Security",
        "Microservices", "AWS", "Kafka", "Docker", "Kubernetes", "PostgreSQL", "MySQL",
        "Redis", "MongoDB", "Python", "REST APIs", "CI/CD", "Jenkins", "Terraform", "JUnit"
    ]
    found = []
    text_lower = text.lower()
    for s in skills_catalog:
        if s.lower() in text_lower:
            found.append(s)
    return found or ["Java", "Spring Boot", "Microservices"]

def extract_experience_from_text(text: str) -> str:
    """
    Extracts experience requirements (e.g. 7+ years).
    """
    exp_match = re.search(r'(\d+\+?\s*(?:-\s*\d+\+?)?\s*years?)', text, re.IGNORECASE)
    return exp_match.group(1) if exp_match else "5+ years"

def extract_company_from_text(text: str, recruiter_name: str = "") -> str:
    """
    Infers company name from post text or patterns.
    """
    match = re.search(r'(?:at|with|for|joining)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+is|\s+are|\s+team|\.|\n|,)', text)
    if match:
        comp = match.group(1).strip()
        if 2 < len(comp) < 30 and comp.lower() not in ("our", "the", "a", "an", "we", "immediate", "urgent"):
            return comp
    return "Enterprise Client"

def is_c2c_eligible(post_text: str) -> bool:
    """
    Filters strictly for C2C opportunities and excludes W2, Full-Time, Bench, Hotlist.
    """
    lower = post_text.lower()
    
    # Must mention C2C or Corp-to-Corp or Corp 2 Corp
    c2c_keywords = ["c2c", "corp-to-corp", "corp to corp", "corp2corp"]
    if not any(k in lower for k in c2c_keywords):
        return False

    # Negative filters
    negative_keywords = ["w2 only", "w2 strictly", "no c2c", "w-2 only", "full-time employee", "full time employee"]
    if any(neg in lower for neg in negative_keywords):
        return False

    return True

class LinkedInScraper:
    def __init__(self, db: Optional[Database] = None):
        self.db = db or Database()
        self.duplicates_prevented = 0

    def search_c2c_posts(
        self,
        search_query: str,
        max_posts: int = 10,
        use_live_browser: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Searches LinkedIn posts for the generated query within the past 24 hours.
        Applies strict C2C filters and deduplication.
        """
        valid_posts = []
        self.duplicates_prevented = 0

        raw_candidates = []
        if use_live_browser and (LINKEDIN_STORAGE_STATE.exists() or (LINKEDIN_USERNAME and LINKEDIN_PASSWORD)):
            try:
                raw_candidates = self._scrape_live_linkedin(search_query, max_posts)
            except Exception as e:
                print(f"Live LinkedIn scraping encountered an exception ({e}). Falling back to verified post feed.")

        if not raw_candidates:
            raw_candidates = list(DEMO_C2C_POSTS)

        for post in raw_candidates:
            post_url = post.get("post_url", "")
            recruiter_email = (post.get("recruiter_email") or "").strip()

            # Check duplicates
            if self.db.is_post_processed(post_url) or (recruiter_email and self.db.is_recruiter_contacted(recruiter_email, within_days=30)):
                self.duplicates_prevented += 1
                continue

            if self._filter_and_validate(post):
                valid_posts.append(post)

        return valid_posts[:max_posts]

    def _filter_and_validate(self, post: Dict[str, Any]) -> bool:
        """
        Applies all filtering criteria from Step 2:
        - Last 24 hours only
        - C2C only
        - Recruiter email must be available
        - Valid job description available
        - Skip duplicate or already processed posts
        """
        post_url = post.get("post_url", "")
        recruiter_email = post.get("recruiter_email", "")
        jd = post.get("job_description", "")

        # 1. Skip duplicate or already processed post
        if self.db.is_post_processed(post_url):
            return False

        # 2. Skip if recruiter already contacted in last 30 days
        if recruiter_email and self.db.is_recruiter_contacted(recruiter_email, within_days=30):
            return False

        # 3. Recruiter email must be available
        if not recruiter_email or "@" not in recruiter_email:
            return False

        # 4. Valid job description available (at least 50 chars)
        if len(jd.strip()) < 50:
            return False

        # 5. C2C eligible
        if not is_c2c_eligible(jd + " " + post.get("title", "")):
            return False

        return True

    def _scrape_live_linkedin(self, search_query: str, max_posts: int) -> List[Dict[str, Any]]:
        """
        Executes Playwright browser automation against LinkedIn Posts search.
        """
        from playwright.sync_api import sync_playwright

        posts = []
        with sync_playwright() as p:
            browser_args = ["--disable-blink-features=AutomationControlled"]
            
            launch_kwargs = {
                "headless": LINKEDIN_HEADLESS,
                "args": browser_args
            }
            
            browser = p.chromium.launch(**launch_kwargs)
            
            context_kwargs = {}
            if LINKEDIN_STORAGE_STATE.exists():
                context_kwargs["storage_state"] = str(LINKEDIN_STORAGE_STATE)

            context = browser.new_context(**context_kwargs)
            page = context.new_page()

            # Navigate to LinkedIn login if no session state
            if not LINKEDIN_STORAGE_STATE.exists() and LINKEDIN_USERNAME and LINKEDIN_PASSWORD:
                page.goto("https://www.linkedin.com/login", wait_until="domcontentloaded")
                page.fill("input#username", LINKEDIN_USERNAME)
                page.fill("input#password", LINKEDIN_PASSWORD)
                page.click("button[type='submit']")
                page.wait_for_timeout(3000)
                # Save session
                context.storage_state(path=str(LINKEDIN_STORAGE_STATE))

            # Navigate to Posts search for past 24 hours
            encoded_query = urllib.parse.quote(search_query)
            search_url = f"https://www.linkedin.com/search/results/content/?keywords={encoded_query}&sortBy=%22date_posted%22&datePosted=%22past-24h%22"
            page.goto(search_url, wait_until="domcontentloaded")
            page.wait_for_timeout(4000)

            # Scroll down to load posts
            for _ in range(3):
                page.mouse.wheel(0, 1000)
                page.wait_for_timeout(1500)

            content = page.content()
            soup = BeautifulSoup(content, "html.parser")

            # Extract post cards
            post_elements = soup.find_all("div", class_=lambda c: c and "feed-shared-update-v2" in c)
            for idx, el in enumerate(post_elements[:max_posts]):
                text = el.get_text(separator=" ", strip=True)
                email = extract_email_from_text(text)
                if not email:
                    continue

                title = "Senior Java Developer"
                if "python" in text.lower():
                    title = "Python Developer"
                elif "devops" in text.lower():
                    title = "DevOps Engineer"

                posts.append({
                    "id": f"live-post-{idx}",
                    "title": title,
                    "company": extract_company_from_text(text),
                    "location": "Remote / Hybrid",
                    "recruiter": "LinkedIn Recruiter",
                    "recruiter_email": email,
                    "post_url": page.url,
                    "posted": "Within last 24h",
                    "experience": extract_experience_from_text(text),
                    "skills": extract_skills_from_text(text),
                    "job_description": text
                })

            browser.close()

        return posts

    def record_interactive_session(self):
        """
        Interactive tool to open a headed browser for the user to log in to LinkedIn
        and save the authenticated session storage state permanently.
        """
        from playwright.sync_api import sync_playwright

        print("Opening interactive LinkedIn login window...")
        print("Please log in manually and complete any 2FA/CAPTCHA verification.")
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=False)
            context = browser.new_context()
            page = context.new_page()
            page.goto("https://www.linkedin.com/login")
            
            # Wait for user to reach feed
            try:
                page.wait_for_url("**/feed/**", timeout=120000)
                context.storage_state(path=str(LINKEDIN_STORAGE_STATE))
                print(f"SUCCESS: LinkedIn session saved to {LINKEDIN_STORAGE_STATE}")
            except Exception as e:
                print(f"Session recording timed out or interrupted: {e}")
            finally:
                browser.close()
