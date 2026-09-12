from pathlib import Path
from typing import Dict, Any, List, Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, ListFlowable, ListItem
from reportlab.lib.units import inch
from jobpilot.config import RESUMES_DIR

def sanitize_text(text: str) -> str:
    """Escapes XML entities for ReportLab Paragraphs"""
    return (
        text.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
            .replace("'", "&#39;")
    )

def create_resume_pdf(
    output_path: Path,
    resume_data: Dict[str, Any]
) -> Path:
    """
    Generates a professional, ATS-friendly PDF resume using ReportLab.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom ATS-friendly styles
    name_style = ParagraphStyle(
        'ResumeName',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1a1a2e'),
        alignment=1 # Centered
    )

    contact_style = ParagraphStyle(
        'ResumeContact',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#4a4a5a'),
        alignment=1 # Centered
    )

    section_heading = ParagraphStyle(
        'ResumeHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#1a365d'),
        spaceBefore=8,
        spaceAfter=3,
        textTransform='uppercase'
    )

    job_title_style = ParagraphStyle(
        'ResumeJobTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#222222')
    )

    job_company_style = ParagraphStyle(
        'ResumeCompany',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#333333')
    )

    body_style = ParagraphStyle(
        'ResumeBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#2d3748')
    )

    bullet_style = ParagraphStyle(
        'ResumeBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        leftIndent=12,
        firstLineIndent=-8,
        textColor=colors.HexColor('#2d3748')
    )

    story = []

    # 1. Candidate Name
    candidate_name = sanitize_text(resume_data.get("candidate_name", "Candidate Name"))
    story.append(Paragraph(candidate_name, name_style))
    story.append(Spacer(1, 4))

    # 2. Contact Line
    contact_parts = [
        resume_data.get("email", ""),
        resume_data.get("phone", ""),
        resume_data.get("location", ""),
        resume_data.get("work_authorization", ""),
        resume_data.get("linkedin", "")
    ]
    contact_line = " &bull; ".join(sanitize_text(p) for p in contact_parts if p)
    story.append(Paragraph(contact_line, contact_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cbd5e1'), spaceBefore=2, spaceAfter=8))

    # 3. Professional Summary
    summary = resume_data.get("summary", "")
    if summary:
        story.append(Paragraph("Professional Summary", section_heading))
        story.append(Paragraph(sanitize_text(summary), body_style))
        story.append(Spacer(1, 6))

    # 4. Technical Skills
    skills = resume_data.get("technical_skills", {})
    if skills:
        story.append(Paragraph("Technical Skills", section_heading))
        if isinstance(skills, dict):
            for category, items in skills.items():
                if isinstance(items, list):
                    items_str = ", ".join(items)
                else:
                    items_str = str(items)
                line = f"<b>{sanitize_text(category)}:</b> {sanitize_text(items_str)}"
                story.append(Paragraph(line, body_style))
                story.append(Spacer(1, 2))
        elif isinstance(skills, list):
            story.append(Paragraph(sanitize_text(", ".join(skills)), body_style))
        story.append(Spacer(1, 6))

    # 5. Professional Experience
    experience = resume_data.get("experience", [])
    if experience:
        story.append(Paragraph("Professional Experience", section_heading))
        for exp in experience:
            title = sanitize_text(exp.get("title", ""))
            period = sanitize_text(exp.get("period", ""))
            company = sanitize_text(exp.get("company", ""))
            location = sanitize_text(exp.get("location", ""))

            header_text = f"<b>{title}</b> &mdash; <i>{company}</i> ({location})" if location else f"<b>{title}</b> &mdash; <i>{company}</i>"
            if period:
                header_text = f"{header_text} &nbsp;|&nbsp; {period}"
            story.append(Paragraph(header_text, job_title_style))
            story.append(Spacer(1, 2))

            bullets = exp.get("bullets", [])
            for bullet in bullets:
                story.append(Paragraph(f"&bull;&nbsp; {sanitize_text(bullet)}", bullet_style))
                story.append(Spacer(1, 2))
            story.append(Spacer(1, 4))

    # 6. Education & Certifications
    education = resume_data.get("education", [])
    if education:
        story.append(Paragraph("Education", section_heading))
        for edu in education:
            story.append(Paragraph(sanitize_text(edu), body_style))
            story.append(Spacer(1, 2))
        story.append(Spacer(1, 4))

    certifications = resume_data.get("certifications", [])
    if certifications:
        story.append(Paragraph("Certifications", section_heading))
        for cert in certifications:
            story.append(Paragraph(f"&bull;&nbsp; {sanitize_text(cert)}", bullet_style))
            story.append(Spacer(1, 2))

    doc.build(story)
    return output_path
