# JobPilot AI — Automated C2C Job Discovery, Resume Customizer & Gmail Submitter

JobPilot AI is an end-to-end automation system engineered to discover high-value Corp-to-Corp (C2C) job posts on LinkedIn, customize candidate resumes using AI, compile ATS-friendly PDF documents, compose standardized candidate submission emails, and automatically dispatch applications via Gmail while preventing duplicate applications.

---

## System Architecture & 7-Step Workflow

```
┌─────────────────────────┐     ┌────────────────────────┐     ┌─────────────────────────┐
│ Step 1: Login & Session │ ──> │ Step 2: Search & Filter│ ──> │  Step 3: Analyze Job   │
│ Playwright context /    │     │ Posts within last 24h  │     │ Extract Recruiter, Email│
│ Session storage state   │     │ C2C query format       │     │ Title, JD, Location     │
└─────────────────────────┘     └────────────────────────┘     └─────────────────────────┘
                                                                            │
                                                                            ▼
┌─────────────────────────┐     ┌────────────────────────┐     ┌─────────────────────────┐
│  Step 6 & 7: Compose &  │ <── │ Step 5: Recruiter Info │ <── │ Step 4: AI Resume Tailor│
│  Send via Gmail (SMTP)  │     │ Enhancement & Greeting │     │ 90-95% Truthful Match   │
│  SQLite Deduplication   │     │ First name & Team      │     │ ReportLab ATS PDF Gen   │
└─────────────────────────┘     └────────────────────────┘     └─────────────────────────┘
```

### Step 1: Automatic Login
- **LinkedIn Session Automation**: Uses Playwright with persistent session storage (`sessions/linkedin_storage_state.json`) to bypass repetitive 2FA/CAPTCHA prompts.
- **Gmail Integration**: Authenticated via Gmail SMTP using SSL with Google App Passwords or OAuth2.

### Step 2: Search Relevant Jobs
- **Dynamic Query Generation**: Candidate primary title is parsed from the master resume (e.g. `"Senior Java Developer"`).
- **Exact Search Format**:
  `"Candidate Job Title" C2C -W2 -Full-Time -Bench -Sales -Hotlist`
- **Filtering Rules**:
  - Posted within the last 24 hours (`datePosted="past-24h"`).
  - C2C opportunities only (explicit corp-to-corp keywords).
  - W2, full-time, bench, sales, and hotlists excluded.
  - Recruiter contact email must be available in post.
  - Duplicate or previously contacted recruiters skipped.

### Step 3: Analyze the Job
- Automated extraction of:
  - Recruiter Name
  - Recruiter Email (aggressive regex validation)
  - Company Name
  - Job Title
  - Required Skills & Experience
  - Job Location
  - LinkedIn Post URL & Complete Job Description

### Step 4: AI-Based Resume Customization
- Compares master resume against the scraped Job Description.
- Powered by OpenAI / Google Gemini API with a local truthful ATS optimization engine fallback.
- Enforces **Strict Truthfulness**: Reorders skills and tailors project descriptions to match 90–95% of job requirements without hallucinating false credentials.
- Compiles a real ATS-friendly PDF resume using **ReportLab** (`resumes_generated/`).

### Step 5: Recruiter Information Enhancement
- Enhances recruiter details (extracts first name, infers hiring team/department, crafts personalized greeting).

### Step 6: Compose Standardized Email
- Composes email matching the exact required template:
  - **Subject:** `Submission for <Job Title> | C2C Consultant`
  - **Body:** Standard greeting, candidate summary table, post URL, complete job description, professional closing.
  - **Attachment:** Path to customized resume PDF.

### Step 7: Send Email & Prevent Duplicates
- Attaches the customized PDF.
- Validates recipient email address syntax.
- Sends automatically via Gmail SMTP (`smtplib` + SSL).
- Logs submission into SQLite (`data/jobpilot.db`) with date, recruiter, company, job title, post URL, resume filename, and delivery status.
- Prevents re-submitting to the same post URL or contacting the same recruiter within 30 days.

---

## Quick Start Guide

### 1. Prerequisites & Installation

Ensure Python 3.10+ is installed:
```powershell
pip install pypdf python-dotenv fastapi uvicorn reportlab playwright beautifulsoup4 python-multipart
python -m playwright install chromium
```

### 2. Configuration (.env)

Copy `.env.example` to `.env` and set your credentials:
```powershell
cp .env.example .env
```
Key settings:
- `GMAIL_USER`: Your Gmail address
- `GMAIL_APP_PASSWORD`: 16-character Google App Password
- `OPENAI_API_KEY`: (Optional) OpenAI API key for LLM tailoring
- `LINKEDIN_USERNAME` / `LINKEDIN_PASSWORD`: (Optional) LinkedIn credentials

---

## Running the Application

### Option A: Interactive Web Dashboard (FastAPI)

Launch the backend API and frontend dashboard:
```powershell
python server.py
```
Then open your browser at:
👉 **`http://127.0.0.1:8000`**

From the Web UI:
1. **Dashboard**: View system stats and live AI engine status.
2. **Resume Library**: Click **"Upload Master Resume"** to upload your own `.pdf` or `.txt` resume. The system automatically identifies your job title and updates the LinkedIn query.
3. **Job Finder**: Click **"Run AI Discovery"** to find C2C jobs.
4. **AI Resume Lab**: Click **"Generate Customized Resume"** to produce tailored bullets and click **"Download PDF"** to get the actual PDF file.
5. **Application Copilot**: Click **"Send Application"** to dispatch the email and attach the customized PDF.
6. **Application Tracker**: View live records stored in the SQLite database (`jobpilot.db`).

### Option B: Command-Line Automation (CLI)

Run individual steps or batch pipelines:

```powershell
# Run full 7-step automated pipeline (dry-run mode)
python run_automation.py --pipeline

# Search LinkedIn posts for candidate title & extract recruiter emails
python run_automation.py --search

# Customize resume & compile PDF
python run_automation.py --customize

# Display SQLite tracking report & duplicate stats
python run_automation.py --report

# Interactive LinkedIn session login (saves persistent cookies)
python run_automation.py --record-session
```

---

## Verification & Artifacts Produced

The system produces verifiable evidence of completion:
- **Generated PDF Resumes**: Located in `resumes_generated/` (e.g. `Alex_Morgan_Senior_Java_Developer_C2C.pdf`).
- **SQLite Database**: Located at `data/jobpilot.db` tracking all applications, processed post URLs, and recruiters.
- **Master Resume Sample**: Located at `sample_data/master_resume.txt`.
