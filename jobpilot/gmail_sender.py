import re
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
from datetime import datetime

from jobpilot.config import (
    GMAIL_USER, GMAIL_APP_PASSWORD, SMTP_SERVER, SMTP_PORT,
    CANDIDATE_NAME, CANDIDATE_EMAIL, CANDIDATE_PHONE,
    CANDIDATE_LINKEDIN, CANDIDATE_LOCATION, CANDIDATE_WORK_AUTH,
    CANDIDATE_AVAILABILITY, CANDIDATE_TOTAL_EXP, CANDIDATE_EXPECTED_RATE
)
from jobpilot.database import Database

def validate_email_address(email: str) -> bool:
    """
    Validates recipient email format.
    """
    if not email:
        return False
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return bool(re.match(pattern, email.strip()))

def compose_c2c_email(
    job_data: Dict[str, Any],
    candidate_data: Optional[Dict[str, Any]] = None,
    recruiter_details: Optional[Dict[str, Any]] = None
) -> Dict[str, str]:
    """
    Composes standard email strictly following the prompt specification.
    """
    cand = candidate_data or {}
    cand_name = cand.get("candidate_name", CANDIDATE_NAME)
    cand_email = cand.get("email", CANDIDATE_EMAIL)
    cand_phone = cand.get("phone", CANDIDATE_PHONE)
    cand_linkedin = cand.get("linkedin", CANDIDATE_LINKEDIN)
    cand_location = cand.get("location", CANDIDATE_LOCATION)
    cand_auth = cand.get("work_authorization", CANDIDATE_WORK_AUTH)
    cand_avail = cand.get("availability", CANDIDATE_AVAILABILITY)
    cand_exp = cand.get("total_experience", CANDIDATE_TOTAL_EXP)
    cand_rate = cand.get("expected_salary", CANDIDATE_EXPECTED_RATE)

    job_title = job_data.get("title", "Consultant")
    post_url = job_data.get("post_url") or job_data.get("linkedinUrl", "N/A")
    job_description = job_data.get("job_description", "").strip()

    # Recruiter greeting
    greeting_name = "Hiring Manager"
    if recruiter_details and recruiter_details.get("first_name"):
        greeting_name = recruiter_details["first_name"]
    elif job_data.get("recruiter"):
        greeting_name = job_data["recruiter"].split()[0]

    subject = f"Submission for {job_title} | C2C Consultant"

    body = f"""Dear {greeting_name},

I hope this email finds you well.

I came across your recent LinkedIn hiring post regarding the {job_title} opportunity and would like to submit my application.

Please find my customized resume attached for your review.

Candidate Summary

• Candidate Name: {cand_name}
• Email: {cand_email}
• Phone: {cand_phone}
• LinkedIn Profile: {cand_linkedin}
• Current Location: {cand_location}
• Work Authorization: {cand_auth}
• Availability: {cand_avail}
• Total Experience: {cand_exp}
• Expected Salary: {cand_rate}

LinkedIn Job Post

Post URL:
{post_url}

Job Description:
{job_description}

I believe my experience aligns well with your requirements and would appreciate the opportunity to discuss the role further.

Thank you for your time and consideration.

Best Regards,

{cand_name}

Attachment:
• Resume (PDF)
"""
    return {
        "subject": subject,
        "body": body,
        "recipient": job_data.get("recruiter_email", "").strip(),
        "job_title": job_title,
        "post_url": post_url
    }

def send_c2c_application(
    job_data: Dict[str, Any],
    pdf_path: Path,
    candidate_data: Optional[Dict[str, Any]] = None,
    recruiter_details: Optional[Dict[str, Any]] = None,
    db: Optional[Database] = None,
    dry_run: bool = False
) -> Tuple[bool, str]:
    """
    Sends application email via Gmail with attached PDF resume and logs into SQLite.
    Checks duplicate recruiter and duplicate post before sending.
    """
    db_instance = db or Database()
    recipient = (job_data.get("recruiter_email") or "").strip()
    post_url = job_data.get("post_url") or job_data.get("linkedinUrl", "")
    job_title = job_data.get("title", "")
    company = job_data.get("company", "")

    # 1. Verification of recipient email
    if not validate_email_address(recipient):
        err = f"Invalid recruiter email address: '{recipient}'"
        db_instance.record_processed_post(post_url, recipient, job_title, company, "skipped_invalid_email", err)
        return False, err

    # 2. Check duplicate post
    if db_instance.is_post_processed(post_url):
        err = f"Duplicate post already processed: {post_url}"
        db_instance.record_processed_post(post_url, recipient, job_title, company, "skipped_duplicate_post", err)
        return False, err

    # 3. Check duplicate recruiter within 30 days
    if db_instance.is_recruiter_contacted(recipient, within_days=30):
        err = f"Recruiter {recipient} has already been contacted within the last 30 days."
        db_instance.record_processed_post(post_url, recipient, job_title, company, "skipped_duplicate_recruiter", err)
        return False, err

    # 4. Check attachment
    pdf_file = Path(pdf_path)
    if not pdf_file.exists():
        return False, f"Attachment file not found at: {pdf_path}"

    # 5. Compose email
    email_content = compose_c2c_email(job_data, candidate_data, recruiter_details)
    subject = email_content["subject"]
    body = email_content["body"]

    # 6. Send email via SMTP or dry-run
    status = "Sent"
    delivery_msg = f"Email sent successfully to {recipient}"

    if dry_run or not GMAIL_APP_PASSWORD:
        if not GMAIL_APP_PASSWORD:
            delivery_msg = f"Simulated dispatch to {recipient} (GMAIL_APP_PASSWORD not set in .env; email validated and draft prepared)"
            status = "Draft Prepared / Simulated"
        else:
            delivery_msg = f"Dry-run simulation to {recipient} completed."
            status = "Simulated"
    else:
        try:
            msg = MIMEMultipart()
            msg["From"] = GMAIL_USER
            msg["To"] = recipient
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain", "utf-8"))

            with open(pdf_file, "rb") as f:
                part = MIMEApplication(f.read(), Name=pdf_file.name)
                part['Content-Disposition'] = f'attachment; filename="{pdf_file.name}"'
                msg.attach(part)

            with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
                server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
                server.sendmail(GMAIL_USER, [recipient], msg.as_string())

            delivery_msg = f"Live email successfully delivered to {recipient} via Gmail SMTP."
            status = "Sent"
        except Exception as e:
            status = "Failed"
            delivery_msg = f"Gmail SMTP error: {str(e)}"
            return False, delivery_msg

    # 7. Record submission in SQLite Database
    cand = candidate_data or {}
    db_instance.record_submission({
        "candidate_name": cand.get("candidate_name", CANDIDATE_NAME),
        "recruiter_name": job_data.get("recruiter", ""),
        "recruiter_email": recipient,
        "company": company,
        "job_title": job_title,
        "job_location": job_data.get("location", ""),
        "post_url": post_url,
        "job_description": job_data.get("job_description", ""),
        "submission_date": datetime.now().isoformat(),
        "email_status": status,
        "resume_filename": pdf_file.name,
        "email_subject": subject,
        "email_body": body
    })

    return True, delivery_msg
