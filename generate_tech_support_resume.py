from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Register fonts
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Create document
doc = SimpleDocTemplate(
    "/home/z/my-project/download/Sucharitha_TechSupport_Resume.pdf",
    pagesize=letter,
    topMargin=0.5*72,
    bottomMargin=0.5*72,
    leftMargin=0.6*72,
    rightMargin=0.6*72,
    title="Sucharitha_Nandyala_TechSupport_Resume",
    author="Z.ai",
    creator="Z.ai",
    subject="Technical Support Resume"
)

# Styles
styles = getSampleStyleSheet()

name_style = ParagraphStyle(
    'NameStyle',
    fontName='Times New Roman',
    fontSize=18,
    leading=22,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#1a1a1a'),
    spaceAfter=4
)

contact_style = ParagraphStyle(
    'ContactStyle',
    fontName='Times New Roman',
    fontSize=10,
    leading=14,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#444444'),
    spaceAfter=10
)

section_header = ParagraphStyle(
    'SectionHeader',
    fontName='Times New Roman',
    fontSize=12,
    leading=16,
    textColor=colors.HexColor('#1a1a1a'),
    spaceBefore=10,
    spaceAfter=6
)

body_style = ParagraphStyle(
    'BodyStyle',
    fontName='Times New Roman',
    fontSize=10,
    leading=14,
    alignment=TA_LEFT,
    textColor=colors.HexColor('#333333'),
    spaceAfter=4
)

bullet_style = ParagraphStyle(
    'BulletStyle',
    fontName='Times New Roman',
    fontSize=10,
    leading=13,
    leftIndent=15,
    bulletIndent=0,
    alignment=TA_LEFT,
    textColor=colors.HexColor('#333333'),
    spaceAfter=3
)

job_title_style = ParagraphStyle(
    'JobTitleStyle',
    fontName='Times New Roman',
    fontSize=10,
    leading=14,
    textColor=colors.HexColor('#1a1a1a'),
    spaceAfter=2
)

skill_header_style = ParagraphStyle(
    'SkillHeaderStyle',
    fontName='Times New Roman',
    fontSize=10,
    leading=13,
    textColor=colors.HexColor('#1a1a1a'),
    spaceAfter=2
)

skill_item_style = ParagraphStyle(
    'SkillItemStyle',
    fontName='Times New Roman',
    fontSize=10,
    leading=13,
    textColor=colors.HexColor('#333333'),
    spaceAfter=3
)

# Build document
story = []

# Header
story.append(Paragraph("SUCHARITHA NANDYALA", name_style))
story.append(Paragraph("sucharithareddyn@outlook.com • +91 799-312-6594 • LinkedIn • GitHub", contact_style))

# Horizontal line
story.append(Table([['']], colWidths=[7*72], rowHeights=[1]))
story[-1].setStyle(TableStyle([
    ('LINEABOVE', (0, 0), (-1, 0), 1, colors.HexColor('#1a1a1a')),
]))
story.append(Spacer(1, 8))

# Professional Summary
story.append(Paragraph("<b>PROFESSIONAL SUMMARY</b>", section_header))
story.append(Paragraph(
    "IT Service Desk professional with 5+ years of experience supporting enterprise users in fast-paced "
    "environments. Strong expertise in L1/L2 service desk operations, incident and request management, "
    "and ITIL-aligned service delivery. Proven ability to troubleshoot Windows OS, cloud infrastructure, "
    "containerized applications, and networking issues. Background in supporting AWS-based production "
    "environments, Kubernetes deployments, and CI/CD pipelines with a consistent record of meeting SLA, "
    "quality, and customer satisfaction targets.",
    body_style
))

# Technical Skills
story.append(Paragraph("<b>TECHNICAL SKILLS</b>", section_header))

skills_data = [
    ("IT Service Desk & ITSM", "IT Service Desk (L1/L2 Support), Incident Categorization, Prioritization & Resolution, SLA Management, Escalation Handling, ITIL Processes, Customer Communication"),
    ("Cloud & Infrastructure", "AWS (EC2, EKS, S3, VPC), Azure, Docker, Kubernetes, Terraform, Ansible, CloudWatch"),
    ("Operating Systems & Applications", "Windows OS, Linux, Microsoft 365 (Outlook, Teams, OneDrive), Enterprise Application Support"),
    ("DevOps & CI/CD", "Jenkins, GitHub Actions, GitLab CI/CD, Argo CD, Pipeline Troubleshooting, Deployment Automation"),
    ("Access & Security", "Active Directory, VPN & Remote Access, MFA Support, User Access Management, Bitlocker Recovery"),
    ("Monitoring & Tools", "Prometheus, Grafana, ServiceNow, Ticketing Systems, Documentation & Knowledge Base"),
    ("Databases", "PostgreSQL, MySQL, Prisma ORM, Basic SQL Troubleshooting"),
]

for category, skills in skills_data:
    story.append(Paragraph(f"<b>{category}:</b> {skills}", skill_item_style))

# Professional Experience
story.append(Paragraph("<b>PROFESSIONAL EXPERIENCE</b>", section_header))

# Job 1 - HCLTech
story.append(Paragraph("<b>Specialist (IT Infrastructure & Cloud Support)</b>", job_title_style))
story.append(Paragraph("HCLTech | Apr 2024 – Aug 2025 | Hyderabad, India", body_style))
bullets_hcl = [
    "Delivered L1/L2 support for AWS-based production environments running containerized applications on EKS, handling availability, performance, and deployment issues across Dev, QA, and Prod.",
    "Supported Microsoft 365 applications including Outlook, Teams, and OneDrive, ensuring seamless collaboration for enterprise users.",
    "Managed Kubernetes clusters on EKS, troubleshooting pod failures, node issues, and deployment problems.",
    "Resolved VPN, authentication, and access-related issues, including MFA and SSO login failures.",
    "Identified recurring pod restarts and memory exhaustion issues; fixed them by correcting resource requests/limits and autoscaling thresholds, reducing repeat incidents by 30% over 6 months.",
    "Observed patterns of CI/CD failures; standardized pipeline templates and validation checks, reducing deployment failures by 25%.",
    "Detected infrastructure-level patterns such as unused volumes, stale AMIs; automated cleanup using scripts and Terraform to reduce monthly cloud costs by $500 USD.",
    "Handled incident and service request management using monitoring tools, ensuring SLA compliance and proper documentation.",
]
for bullet in bullets_hcl:
    story.append(Paragraph(f"• {bullet}", bullet_style))

story.append(Spacer(1, 6))

# Job 2 - Cognizant
story.append(Paragraph("<b>Senior Process Executive (IT Infrastructure Support)</b>", job_title_style))
story.append(Paragraph("Cognizant | Jul 2022 – Feb 2024 | Hyderabad, India", body_style))
bullets_cognizant = [
    "Provided L1/L2 IT service desk support to enterprise users, handling production issues across deployments, networking, configuration, and runtime failures.",
    "Supported containerized applications on Kubernetes and EC2, troubleshooting pod restarts, node resource pressure, and performance issues.",
    "Investigated intermittent application downtime, identifying patterns related to traffic distribution and resource constraints.",
    "Troubleshot service-to-service connectivity issues, tracing failures to incorrect security group rules, service ports, and DNS resolution problems.",
    "Resolved VPN and remote access issues, ensuring business continuity for remote users.",
    "Handled CI/CD pipeline failures; coordinated fixes across Git repositories, build configs, and artifact registries.",
    "Maintained clear documentation of incidents, resolution steps, and user communication for audit and knowledge reference.",
]
for bullet in bullets_cognizant:
    story.append(Paragraph(f"• {bullet}", bullet_style))

story.append(Spacer(1, 6))

# Job 3 - CSS Corp
story.append(Paragraph("<b>Engineer (Technical Support)</b>", job_title_style))
story.append(Paragraph("CSS Corp | Sep 2021 – May 2022 | Hyderabad, India", body_style))
bullets_css = [
    "Performed first-line support for cloud-hosted applications, monitoring system health and responding to alerts related to EC2, storage, and application services.",
    "Handled user account-related issues, including password resets, account unlocks, and basic access management.",
    "Detected recurring storage and disk utilization issues; coordinated cleanups and capacity adjustments to prevent outages.",
    "Supported users with multi-factor authentication (MFA) issues, troubleshooting OTP failures and device verification problems.",
]
for bullet in bullets_css:
    story.append(Paragraph(f"• {bullet}", bullet_style))

story.append(Spacer(1, 6))

# Job 4 - Infosys
story.append(Paragraph("<b>Process Executive (IT Service Desk)</b>", job_title_style))
story.append(Paragraph("Infosys | Sep 2019 – Jun 2021 | Hyderabad, India", body_style))
bullets_infosys = [
    "Provided technical support for enterprise users, resolving software, hardware, and network-related issues in production environments.",
    "Logged, categorized, prioritized, and resolved incidents and service requests as per defined SLAs and support procedures.",
    "Observed recurring issues caused by configuration drift and outdated versions; flagged them for corrective action instead of repeated fixes.",
    "Worked in SLA-driven support environment, consistently meeting productivity, quality, and customer satisfaction benchmarks.",
]
for bullet in bullets_infosys:
    story.append(Paragraph(f"• {bullet}", bullet_style))

# Education
story.append(Paragraph("<b>EDUCATION</b>", section_header))
story.append(Paragraph("<b>B.Tech, Computer Science Engineering</b>", body_style))
story.append(Paragraph("Acharya Nagarjuna University | CGPA: 9.27", body_style))

# Certifications
story.append(Spacer(1, 6))
story.append(Paragraph("<b>CERTIFICATIONS (In Progress)</b>", section_header))
story.append(Paragraph("• Microsoft Azure Fundamentals (AZ-900)", body_style))
story.append(Paragraph("• AWS Solutions Architect Associate", body_style))

# Key Strengths
story.append(Spacer(1, 6))
story.append(Paragraph("<b>KEY STRENGTHS</b>", section_header))
story.append(Paragraph("Systems Thinker • Problem-Solving Mindset • End-to-End Ownership • ITIL Aligned • Highly Adaptable • Fast Learner", body_style))

# Build PDF
doc.build(story)
print("Tech Support Resume generated successfully!")
