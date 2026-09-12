import unittest
from fastapi.testclient import TestClient
from server import app

class TestFastAPIEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_get_status(self):
        res = self.client.get("/api/status")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "online")
        self.assertEqual(data["ai_engine"], "active")

    def test_get_candidate(self):
        res = self.client.get("/api/candidate")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["candidate_name"], "Alex Morgan")
        self.assertIn("Java Developer", data["job_title"])

    def test_get_jobs(self):
        res = self.client.get("/api/jobs")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("search_query", data)
        self.assertIn("duplicates_prevented", data)

    def test_resume_customize_and_download(self):
        job = {
            "title": "Senior Java Developer",
            "company": "TechNova Solutions",
            "recruiter": "Sarah Johnson",
            "location": "Dallas, TX",
            "job_description": "Microservices, Spring Boot, AWS Kafka developer."
        }
        res = self.client.post("/api/resume/customize", json={"job": job})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(data["match_score"], 90)
        pdf_name = data["pdf_filename"]

        # Test download
        dl_res = self.client.get(f"/api/resumes/download/{pdf_name}")
        self.assertEqual(dl_res.status_code, 200)
        self.assertEqual(dl_res.headers["content-type"], "application/pdf")
        self.assertGreater(len(dl_res.content), 1000)

    def test_email_compose(self):
        job = {
            "title": "Senior Java Developer",
            "company": "TechNova",
            "recruiter": "Sarah Johnson",
            "recruiter_email": "sarah.j@technova.com",
            "post_url": "https://linkedin.com/posts/test",
            "job_description": "C2C opportunity."
        }
        res = self.client.post("/api/email/compose", json={"job": job})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("Submission for Senior Java Developer | C2C Consultant", data["subject"])
        self.assertIn("Candidate Summary", data["body"])

    def test_get_applications_and_stats(self):
        res_apps = self.client.get("/api/applications")
        self.assertEqual(res_apps.status_code, 200)
        self.assertIsInstance(res_apps.json(), list)

        res_stats = self.client.get("/api/stats")
        self.assertEqual(res_stats.status_code, 200)
        data = res_stats.json()
        self.assertIn("total_applications", data)
        self.assertIn("sent_applications", data)

if __name__ == "__main__":
    unittest.main()
