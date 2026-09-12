#!/usr/bin/env python3
"""
JobPilot AI - Master Automation CLI Runner.
Executes the 7-step C2C LinkedIn Job Automation, AI Resume Customization, and Gmail Dispatch.
"""

import argparse
import sys
import json
from pathlib import Path

from jobpilot.config import BASE_DIR, RESUMES_DIR
from jobpilot.database import Database
from jobpilot.resume_parser import parse_resume
from jobpilot.linkedin_scraper import LinkedInScraper
from jobpilot.ai_customizer import customize_resume
from jobpilot.gmail_sender import compose_c2c_email, send_c2c_application
from jobpilot.pipeline import AutomationPipeline

def print_header(title: str):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def main():
    parser = argparse.ArgumentParser(description="JobPilot AI Automation System")
    parser.add_argument("--pipeline", action="store_true", help="Run full 7-step end-to-end automation pipeline")
    parser.add_argument("--search", action="store_true", help="Search LinkedIn posts & extract recruiter info")
    parser.add_argument("--customize", action="store_true", help="Generate AI customized ATS resume PDF")
    parser.add_argument("--send", action="store_true", help="Compose and send application email via Gmail")
    parser.add_argument("--report", action="store_true", help="Display application tracking report and statistics")
    parser.add_argument("--record-session", action="store_true", help="Launch interactive browser to log in to LinkedIn")
    parser.add_argument("--resume", type=str, default=str(BASE_DIR / "sample_data" / "master_resume.txt"), help="Path to candidate master resume")
    parser.add_argument("--live-send", action="store_true", help="Send live email via SMTP (otherwise dry-run)")
    parser.add_argument("--live-browser", action="store_true", help="Use live Playwright browser for LinkedIn")
    parser.add_argument("--max-jobs", type=int, default=5, help="Maximum jobs to process")

    args = parser.parse_args()
    db = Database()

    if args.record_session:
        print_header("LinkedIn Session Recording")
        scraper = LinkedInScraper(db)
        scraper.record_interactive_session()
        return

    if args.report:
        print_header("JobPilot AI — Application Tracking Report")
        stats = db.get_stats()
        print(f"• Total Applications Logged: {stats['total_applications']}")
        print(f"• Sent Applications:         {stats['sent_applications']}")
        print(f"• Duplicates Prevented:      {stats['duplicates_prevented']}")
        print(f"• Recruiters in Database:    {stats['total_recruiters']}\n")

        apps = db.get_applications(limit=10)
        if apps:
            print("Recent Submissions:")
            for a in apps:
                print(f"  - [{a['id']}] {a['submission_date'][:16]} | {a['job_title']} at {a['company']}")
                print(f"      To: {a['recruiter_email']} ({a['recruiter_name']}) | Status: {a['email_status']}")
                print(f"      Resume: {a['resume_filename']}")
        else:
            print("No submissions recorded yet.")
        return

    if args.search:
        print_header("Step 1 & 2: Resume Extraction & LinkedIn Search")
        cand = parse_resume(Path(args.resume))
        print(f"Candidate:    {cand['candidate_name']} ({cand['job_title']})")
        print(f"Search Query: {cand['search_query']}")
        
        scraper = LinkedInScraper(db)
        posts = scraper.search_c2c_posts(cand['search_query'], max_posts=args.max_jobs, use_live_browser=args.live_browser)
        print(f"\nFound {len(posts)} qualifying C2C posts:")
        for idx, p in enumerate(posts, 1):
            print(f"\n[{idx}] {p['title']} — {p['company']} ({p['location']})")
            print(f"    Recruiter: {p.get('recruiter')} <{p.get('recruiter_email')}>")
            print(f"    Post URL:  {p.get('post_url')}")
            print(f"    Skills:    {', '.join(p.get('skills', [])[:5])}")
        return

    if args.customize:
        print_header("Step 4 & 5: AI Resume Customization & Recruiter Enhancement")
        cand = parse_resume(Path(args.resume))
        scraper = LinkedInScraper(db)
        posts = scraper.search_c2c_posts(cand['search_query'], max_posts=1, use_live_browser=args.live_browser)
        if not posts:
            print("No new jobs to customize for.")
            return

        target_job = posts[0]
        print(f"Target Job: {target_job['title']} at {target_job['company']}")
        result = customize_resume(cand, target_job)
        print(f"• Match Score:        {result['match_score']}%")
        print(f"• Generated PDF:      {result['pdf_filename']}")
        print(f"• PDF Full Path:      {result['pdf_path']}")
        print(f"• Enhanced Greeting:  {result['recruiter_enhancement']['personalized_greeting']}")
        print(f"• Hiring Team:        {result['recruiter_enhancement']['hiring_team']}")
        return

    if args.send:
        print_header("Step 6 & 7: Compose & Send Application Email")
        cand = parse_resume(Path(args.resume))
        scraper = LinkedInScraper(db)
        posts = scraper.search_c2c_posts(cand['search_query'], max_posts=1, use_live_browser=args.live_browser)
        if not posts:
            print("No jobs available for submission.")
            return

        target_job = posts[0]
        customized = customize_resume(cand, target_job)
        pdf_path = Path(customized["pdf_path"])
        
        ok, msg = send_c2c_application(
            job_data=target_job,
            pdf_path=pdf_path,
            candidate_data=cand,
            recruiter_details=customized["recruiter_enhancement"],
            db=db,
            dry_run=not args.live_send
        )
        print(f"Result:  {'SUCCESS' if ok else 'FAILED'}")
        print(f"Message: {msg}")
        return

    # Default: Run Full Pipeline
    print_header("JobPilot AI — Executing Full 7-Step Automation Pipeline")
    pipeline = AutomationPipeline(resume_path=Path(args.resume), db=db)
    report = pipeline.run(
        max_jobs=args.max_jobs,
        dry_run=not args.live_send,
        use_live_browser=args.live_browser
    )

    print(f"Candidate:            {report['candidate_profile']['name']} ({report['candidate_profile']['title']})")
    print(f"Search Query:         {report['search_query']}")
    print(f"Jobs Discovered:      {report['jobs_found']}")
    print(f"Duplicates Prevented: {report['duplicates_prevented']}")
    print(f"Applications Sent:    {report['applications_sent']}")

    if report["jobs_processed"]:
        print("\nProcessed Submissions:")
        for j in report["jobs_processed"]:
            print(f"  ✓ {j['title']} at {j['company']} ({j['recruiter_email']})")
            print(f"    Match: {j['match_score']}% | PDF: {j['resume_pdf']} | Status: {j['status']}")
            print(f"    Message: {j['message']}")

    print("\n✓ Pipeline execution finished.")

if __name__ == "__main__":
    main()
