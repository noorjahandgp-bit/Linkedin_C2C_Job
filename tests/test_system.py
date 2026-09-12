import unittest
from pathlib import Path
import tempfile
import re

from jobpilot.config import BASE_DIR
from jobpilot.database import Database
from jobpilot.resume_parser import parse_resume, generate_linkedin_search_query
from jobpilot.linkedin_scraper import LinkedInScraper, is_c2c_eligible, extract_email_from_text
from jobpilot.ai_customizer import customize_resume, extract_recruiter_details
from jobpilot.pdf_generator import create_resume_pdf
from jobpilot.gmail_sender import compose_c2c_email, send_c2c_application, validate_email_address

class TestJobPilotAI(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.TemporaryDirectory(ignore_cleanup_errors=True)
        self.db_path = Path(self.test_dir.name) / "test_jobpilot.db"
        self.db = Database(self.db_path)
        self.resume_path = BASE_DIR / "sample_data" / "master_resume.txt"

    def tearDown(self):
        self.db = None
        try:
            self.test_dir.cleanup()
        except Exception:
            pass

    def test_step1_and_2_resume_parsing_and_query_generation(self):
        parsed = parse_resume(self.resume_path)
        self.assertEqual(parsed["candidate_name"], "Alex Morgan")
        self.assertIn("Java Developer", parsed["job_title"])
        expected_query = '"Senior Java Developer" C2C -W2 -Full-Time -Bench -Sales -Hotlist'
        self.assertEqual(parsed["search_query"], expected_query)

    def test_step2_filtering_rules(self):
        c2c_post = "Urgent opening for Java Developer on Corp-to-Corp (C2C) contract."
        w2_post = "Java Developer opening. Strictly W2 only. No C2C."
        self.assertTrue(is_c2c_eligible(c2c_post))
        self.assertFalse(is_c2c_eligible(w2_post))

    def test_step3_recruiter_data_extraction(self):
        sample_text = "Hiring Senior Java Dev for C2C. Email resumes to recruiter.jane@globaltech.com"
        email = extract_email_from_text(sample_text)
        self.assertEqual(email, "recruiter.jane@globaltech.com")

    def test_step4_ai_resume_customization_and_pdf(self):
        cand = parse_resume(self.resume_path)
        job = {
            "title": "Senior Java Developer",
            "company": "TechNova",
            "recruiter": "Sarah Johnson",
            "location": "Dallas, TX",
            "job_description": "Seeking Java 17, Spring Boot, AWS, Kafka expert."
        }
        res = customize_resume(cand, job)
        self.assertGreaterEqual(res["match_score"], 90)
        self.assertLessEqual(res["match_score"], 95)
        pdf_path = Path(res["pdf_path"])
        self.assertTrue(pdf_path.exists())
        self.assertGreater(pdf_path.stat().st_size, 1000)

    def test_step5_recruiter_enhancement(self):
        details = extract_recruiter_details("Reach out to Sarah Johnson at TechNova", "Sarah Johnson")
        self.assertEqual(details["first_name"], "Sarah")
        self.assertEqual(details["personalized_greeting"], "Dear Sarah,")

    def test_step6_email_composition(self):
        cand = parse_resume(self.resume_path)
        job = {
            "title": "Senior Java Developer",
            "company": "TechNova Solutions",
            "recruiter": "Sarah Johnson",
            "recruiter_email": "sarah.j@technova.com",
            "post_url": "https://linkedin.com/posts/technova-100",
            "job_description": "Need Senior Java developer C2C."
        }
        email_data = compose_c2c_email(job, cand)
        self.assertEqual(email_data["subject"], "Submission for Senior Java Developer | C2C Consultant")
        self.assertIn("Dear Sarah,", email_data["body"])
        self.assertIn("Candidate Summary", email_data["body"])
        self.assertIn("Post URL:\nhttps://linkedin.com/posts/technova-100", email_data["body"])
        self.assertIn("Attachment:\n• Resume (PDF)", email_data["body"])

    def test_step7_send_email_and_deduplication(self):
        cand = parse_resume(self.resume_path)
        job = {
            "title": "Senior Java Developer",
            "company": "TechNova Solutions",
            "recruiter": "Sarah Johnson",
            "recruiter_email": "sarah.j@technova.com",
            "post_url": "https://linkedin.com/posts/technova-100",
            "job_description": "Need Senior Java developer C2C."
        }
        pdf_path = Path(self.test_dir.name) / "test_resume.pdf"
        create_resume_pdf(pdf_path, {"candidate_name": "Alex Morgan", "email": "alex@email.com"})

        # First dispatch
        ok1, msg1 = send_c2c_application(job, pdf_path, cand, db=self.db, dry_run=True)
        self.assertTrue(ok1)
        self.assertIn("Simulated", msg1)

        # Duplicate post check
        ok2, msg2 = send_c2c_application(job, pdf_path, cand, db=self.db, dry_run=True)
        self.assertFalse(ok2)
        self.assertIn("Duplicate post", msg2)

        # Verify recorded in DB
        apps = self.db.get_applications()
        self.assertEqual(len(apps), 1)
        self.assertEqual(apps[0]["recruiter_email"], "sarah.j@technova.com")

if __name__ == "__main__":
    unittest.main()
