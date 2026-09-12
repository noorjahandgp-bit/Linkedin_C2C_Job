import re
from pathlib import Path
from typing import Dict, Any, Optional
import pypdf
from jobpilot.config import (
    CANDIDATE_NAME, CANDIDATE_EMAIL, CANDIDATE_PHONE,
    CANDIDATE_LINKEDIN, CANDIDATE_LOCATION, CANDIDATE_WORK_AUTH,
    CANDIDATE_AVAILABILITY, CANDIDATE_TOTAL_EXP, CANDIDATE_EXPECTED_RATE,
    CANDIDATE_DEFAULT_TITLE
)

def extract_text_from_file(file_path: Path) -> str:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Resume file not found: {file_path}")

    if path.suffix.lower() == ".pdf":
        text = ""
        reader = pypdf.PdfReader(str(path))
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
        return text
    else:
        # Default to utf-8 text / markdown
        return path.read_text(encoding="utf-8", errors="ignore")

def extract_job_title_from_text(text: str) -> str:
    """
    Identifies candidate primary job title from resume content.
    """
    common_titles = [
        "Senior Java Developer", "Java Developer", "Java Full Stack Developer",
        "Python Developer", "Full Stack Developer", "Backend Developer",
        "DevOps Engineer", "Cloud Engineer", "React Developer", "Frontend Developer",
        "Data Engineer", "Data Scientist", "Solutions Architect", "Software Engineer"
    ]
    # Check first 500 characters / summary section
    header_text = text[:1000]
    for title in common_titles:
        if re.search(rf"\b{re.escape(title)}\b", header_text, re.IGNORECASE):
            return title

    # Fallback to lines matching 'Developer' or 'Engineer'
    lines = [line.strip() for line in header_text.splitlines() if line.strip()]
    for line in lines[:8]:
        if any(term in line.lower() for term in ["developer", "engineer", "architect"]):
            cleaned = re.sub(r"[^a-zA-Z\s]", "", line).strip()
            if 5 < len(cleaned) < 35:
                return cleaned

    return CANDIDATE_DEFAULT_TITLE

def generate_linkedin_search_query(job_title: str) -> str:
    """
    Generates exact required query format:
    "Candidate Job Title" C2C -W2 -Full-Time -Bench -Sales -Hotlist
    """
    clean_title = job_title.strip()
    return f'"{clean_title}" C2C -W2 -Full-Time -Bench -Sales -Hotlist'

def parse_resume(file_path: Path) -> Dict[str, Any]:
    """
    Parses resume and extracts candidate details and search query.
    """
    text = extract_text_from_file(file_path)
    
    # Extract email if present
    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    email = email_match.group(0) if email_match else CANDIDATE_EMAIL

    # Extract phone if present
    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0) if phone_match else CANDIDATE_PHONE

    # Extract LinkedIn URL
    linkedin_match = re.search(r'(https?://)?(www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+', text)
    linkedin = linkedin_match.group(0) if linkedin_match else CANDIDATE_LINKEDIN
    if not linkedin.startswith("http"):
        linkedin = "https://" + linkedin

    # Extract name (first non-empty line or fallback)
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    name = CANDIDATE_NAME
    if lines and len(lines[0].split()) <= 4 and not any(char.isdigit() for char in lines[0]):
        name = lines[0]

    job_title = extract_job_title_from_text(text)
    search_query = generate_linkedin_search_query(job_title)

    return {
        "candidate_name": name,
        "email": email,
        "phone": phone,
        "linkedin": linkedin,
        "location": CANDIDATE_LOCATION,
        "work_authorization": CANDIDATE_WORK_AUTH,
        "availability": CANDIDATE_AVAILABILITY,
        "total_experience": CANDIDATE_TOTAL_EXP,
        "expected_salary": CANDIDATE_EXPECTED_RATE,
        "job_title": job_title,
        "search_query": search_query,
        "raw_text": text
    }
