const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign } = require('docx');
const fs = require('fs');

// Green Color Palette (same as Optimism Engine teaser)
const colors = {
  primary: "020617",      // Midnight Black
  body: "1E293B",         // Deep Slate Blue  
  secondary: "64748B",    // Cool Blue-Gray
  accent: "10B981",       // Emerald Green for highlights
  tableBg: "F8FAFC",      // Glacial Blue-White
};

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const bottomBorder = { style: BorderStyle.SINGLE, size: 8, color: colors.accent };
const sectionBorder = { top: noBorder, bottom: bottomBorder, left: noBorder, right: noBorder };

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Times New Roman", size: 20 } } },
    paragraphStyles: [
      { id: "Name", name: "Name", basedOn: "Normal",
        run: { size: 44, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { after: 40 }, alignment: AlignmentType.CENTER } },
      { id: "Contact", name: "Contact", basedOn: "Normal",
        run: { size: 18, color: colors.secondary, font: "Times New Roman" },
        paragraph: { spacing: { after: 100 }, alignment: AlignmentType.CENTER } },
      { id: "SectionHeader", name: "Section Header", basedOn: "Normal",
        run: { size: 22, bold: true, color: colors.primary, font: "Times New Roman", allCaps: true },
        paragraph: { spacing: { before: 160, after: 80 } } },
      { id: "JobTitle", name: "Job Title", basedOn: "Normal",
        run: { size: 22, bold: true, color: colors.body, font: "Times New Roman" },
        paragraph: { spacing: { before: 100, after: 20 } } },
      { id: "Body", name: "Body", basedOn: "Normal",
        run: { size: 20, color: colors.body, font: "Times New Roman" },
        paragraph: { spacing: { after: 40 }, alignment: AlignmentType.LEFT } },
      { id: "Bullet", name: "Bullet", basedOn: "Normal",
        run: { size: 20, color: colors.body, font: "Times New Roman" },
        paragraph: { spacing: { after: 30 }, indent: { left: 280 } } }
    ]
  },
  sections: [{
    properties: {
      page: { margin: { top: 560, right: 560, bottom: 560, left: 560 } }
    },
    children: [
      // NAME
      new Paragraph({ style: "Name", children: [new TextRun("SUCHARITHA NANDYALA")] }),
      
      // CONTACT INFO
      new Paragraph({
        style: "Contact",
        children: [
          new TextRun("sucharithareddyn@outlook.com | +91 799-312-6594"),
          new TextRun({ text: "  |  ", color: colors.secondary }),
          new TextRun({ text: "linkedin.com/in/sucharithanreddy13", color: colors.accent }),
          new TextRun({ text: "  |  ", color: colors.secondary }),
          new TextRun({ text: "GitHub", color: colors.accent })
        ]
      }),
      
      // DIVIDER LINE
      new Table({
        columnWidths: [10200],
        rows: [new TableRow({
          children: [new TableCell({
            borders: sectionBorder,
            children: [new Paragraph({ children: [] })]
          })]
        })]
      }),
      
      // SUMMARY
      new Paragraph({ style: "SectionHeader", children: [new TextRun("SUMMARY")] }),
      new Paragraph({
        style: "Body",
        children: [
          new TextRun("DevOps/Site Reliability Engineer with hands-on experience running and fixing production systems. Over the years I have readjusted my focus to understanding "),
          new TextRun({ text: "why incidents happen", bold: true }),
          new TextRun("-rather than just restoring services, but identifying recurring patterns, underlying system gaps, and preventing repeat failures. Recently expanded into "),
          new TextRun({ text: "AI/ML application development", bold: true }),
          new TextRun(", building and deploying a production AI application from concept to client demo. Comfortable troubleshooting Linux, Kubernetes, CI/CD pipelines, and cloud infrastructure, with a strong ownership mindset and ability to simplify complex operational problems.")
        ]
      }),
      
      // TECHNICAL SKILLS
      new Paragraph({ style: "SectionHeader", children: [new TextRun("TECHNICAL SKILLS")] }),
      new Table({
        columnWidths: [2200, 8000],
        margins: { top: 40, bottom: 40, left: 0, right: 0 },
        rows: [
          new TableRow({ children: [
            new TableCell({ borders: noBorders, width: { size: 2200, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "Programming:", bold: true, size: 20 })] })] }),
            new TableCell({ borders: noBorders, width: { size: 8000, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "Python, TypeScript, JavaScript, Bash, Shell Scripting", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noBorders, width: { size: 2200, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "Cloud & DevOps:", bold: true, size: 20 })] })] }),
            new TableCell({ borders: noBorders, width: { size: 8000, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "AWS, Azure, Docker, Kubernetes, Terraform, Ansible, Jenkins, GitHub Actions, GitLab CI/CD, Argo CD", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noBorders, width: { size: 2200, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "AI/ML:", bold: true, size: 20 })] })] }),
            new TableCell({ borders: noBorders, width: { size: 8000, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "LLM Integration, Prompt Engineering, AI SDKs, Next.js AI Features, Vector Databases", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noBorders, width: { size: 2200, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "Monitoring:", bold: true, size: 20 })] })] }),
            new TableCell({ borders: noBorders, width: { size: 8000, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "Prometheus, Grafana, CloudWatch", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noBorders, width: { size: 2200, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "Databases:", bold: true, size: 20 })] })] }),
            new TableCell({ borders: noBorders, width: { size: 8000, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "PostgreSQL, MySQL, Prisma ORM", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noBorders, width: { size: 2200, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "Full-Stack:", bold: true, size: 20 })] })] }),
            new TableCell({ borders: noBorders, width: { size: 8000, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "Next.js, React, Node.js, Tailwind CSS, Clerk Auth", size: 20 })] })] })
          ]})
        ]
      }),
      
      // FEATURED PROJECT
      new Paragraph({ style: "SectionHeader", children: [new TextRun("FEATURED PROJECT")] }),
      new Paragraph({
        children: [
          new TextRun({ text: "Verso - AI-Powered Emotional Intelligence App", bold: true, size: 22, color: colors.body }),
          new TextRun({ text: "  |  ", size: 18, color: colors.secondary }),
          new TextRun({ text: "Feb 2026 - Present", size: 18, color: colors.secondary, italics: true })
        ]
      }),
      new Paragraph({ style: "Bullet", children: [
        new TextRun({ text: "• ", size: 20 }),
        new TextRun({ text: "Built a production AI-powered mental wellness application over 3 months, combining Cognitive Behavioral Therapy (CBT) principles with LLM technology for cognitive reframing, mood tracking, and emotional intelligence training.", size: 20 })
      ]}),
      new Paragraph({ style: "Bullet", children: [
        new TextRun({ text: "• ", size: 20 }),
        new TextRun({ text: "Full-stack development using Next.js 16, TypeScript, PostgreSQL with Prisma, and AI SDK integration-deployed to Railway with Docker containerization and secure authentication.", size: 20 })
      ]}),
      new Paragraph({ style: "Bullet", children: [
        new TextRun({ text: "• ", size: 20 }),
        new TextRun({ text: "Handled end-to-end product ownership: research, design, development, deployment, client demos, and technical sales-successfully pitched the product for a ", size: 20 }),
        new TextRun({ text: "$40K client engagement.", bold: true, size: 20, color: colors.accent })
      ]}),
      
      // WORK EXPERIENCE
      new Paragraph({ style: "SectionHeader", children: [new TextRun("PROFESSIONAL EXPERIENCE")] }),
      
      // HCLTech
      new Paragraph({
        children: [
          new TextRun({ text: "Specialist", bold: true, size: 22, color: colors.body }),
          new TextRun({ text: " - HCLTech  |  ", size: 20, color: colors.body }),
          new TextRun({ text: "Apr 2024 - Aug 2025  |  Hyderabad, India", size: 18, color: colors.secondary, italics: true })
        ]
      }),
      new Paragraph({ style: "Bullet", children: [new TextRun({ text: "• Supported AWS-based production environments running containerized applications on EKS, handling availability, performance, and deployment issues across Dev, QA, and Prod.", size: 20 })] }),
      new Paragraph({ style: "Bullet", children: [new TextRun({ text: "• Identified recurring pod restarts and memory exhaustion issues; fixed them by correcting resource requests/limits and autoscaling thresholds, ", size: 20 }),
        new TextRun({ text: "reducing repeat incidents by 30%", bold: true, size: 20, color: colors.accent }),
        new TextRun({ text: " over 6 months.", size: 20 })] }),
      new Paragraph({ style: "Bullet", children: [new TextRun({ text: "• Observed patterns of CI/CD failures; standardized pipeline templates and validation checks, ", size: 20 }),
        new TextRun({ text: "reducing deployment failures by 25%", bold: true, size: 20, color: colors.accent }),
        new TextRun({ text: ".", size: 20 })] }),
      new Paragraph({ style: "Bullet", children: [new TextRun({ text: "• Detected infrastructure-level patterns such as unused volumes, stale AMIs; automated cleanup using scripts and Terraform to ", size: 20 }),
        new TextRun({ text: "reduce monthly cloud costs by $500 USD", bold: true, size: 20, color: colors.accent }),
        new TextRun({ text: ".", size: 20 })] }),
      
      // Cognizant
      new Paragraph({
        children: [
          new TextRun({ text: "Senior Process Executive", bold: true, size: 22, color: colors.body }),
          new TextRun({ text: " - Cognizant  |  ", size: 20, color: colors.body }),
          new TextRun({ text: "Jul 2022 - Feb 2024  |  Hyderabad, India", size: 18, color: colors.secondary, italics: true })
        ]
      }),
      new Paragraph({ style: "Bullet", children: [new TextRun({ text: "• Supported containerized applications on Kubernetes and EC2, handling production issues across deployments, networking, configuration, and runtime failures.", size: 20 })] }),
      new Paragraph({ style: "Bullet", children: [new TextRun({ text: "• Investigated intermittent application downtime, identifying patterns related to pod restarts, node resource pressure, and uneven traffic distribution.", size: 20 })] }),
      new Paragraph({ style: "Bullet", children: [new TextRun({ text: "• Troubleshot service-to-service connectivity issues, tracing failures to incorrect security group rules, service ports, and DNS resolution problems.", size: 20 })] }),
      new Paragraph({ style: "Bullet", children: [new TextRun({ text: "• Handled CI/CD pipeline failures; coordinated fixes across Git repositories, build configs, and artifact registries.", size: 20 })] }),
      
      // CSS Corp
      new Paragraph({
        children: [
          new TextRun({ text: "Engineer", bold: true, size: 22, color: colors.body }),
          new TextRun({ text: " - CSS Corp  |  ", size: 20, color: colors.body }),
          new TextRun({ text: "Sep 2021 - May 2022  |  Hyderabad, India", size: 18, color: colors.secondary, italics: true })
        ]
      }),
      new Paragraph({ style: "Bullet", children: [new TextRun({ text: "• Performed first-line support for cloud-hosted applications, monitoring system health and responding to alerts related to EC2, storage, and application services.", size: 20 })] }),
      new Paragraph({ style: "Bullet", children: [new TextRun({ text: "• Detected recurring storage and disk utilization issues; coordinated cleanups and capacity adjustments to prevent outages.", size: 20 })] }),
      
      // Infosys
      new Paragraph({
        children: [
          new TextRun({ text: "Process Executive", bold: true, size: 22, color: colors.body }),
          new TextRun({ text: " - Infosys  |  ", size: 20, color: colors.body }),
          new TextRun({ text: "Sep 2019 - Jun 2021  |  Hyderabad, India", size: 18, color: colors.secondary, italics: true })
        ]
      }),
      new Paragraph({ style: "Bullet", children: [new TextRun({ text: "• Provided technical support for enterprise users, resolving software, hardware, and network-related issues in production environments.", size: 20 })] }),
      new Paragraph({ style: "Bullet", children: [new TextRun({ text: "• Observed recurring issues caused by configuration drift and outdated versions; flagged them for corrective action instead of repeated fixes.", size: 20 })] }),
      
      // EDUCATION & CERTIFICATIONS - Side by side
      new Paragraph({ style: "SectionHeader", children: [new TextRun("EDUCATION & CERTIFICATIONS")] }),
      new Table({
        columnWidths: [5100, 5100],
        margins: { top: 40, bottom: 40, left: 0, right: 0 },
        rows: [
          new TableRow({ children: [
            new TableCell({ borders: noBorders, width: { size: 5100, type: WidthType.DXA },
              children: [
                new Paragraph({ children: [
                  new TextRun({ text: "B.Tech, Computer Science Engineering", bold: true, size: 20, color: colors.body })
                ]}),
                new Paragraph({ children: [
                  new TextRun({ text: "Acharya Nagarjuna University  |  ", size: 18, color: colors.secondary }),
                  new TextRun({ text: "CGPA: 9.27", size: 18, color: colors.accent, bold: true })
                ]})
              ]
            }),
            new TableCell({ borders: noBorders, width: { size: 5100, type: WidthType.DXA },
              children: [
                new Paragraph({ children: [
                  new TextRun({ text: "• AWS Solutions Architect - Associate ", size: 18, color: colors.body }),
                  new TextRun({ text: "(Preparing)", size: 16, color: colors.secondary, italics: true })
                ]}),
                new Paragraph({ children: [
                  new TextRun({ text: "• Certified Kubernetes Administrator ", size: 18, color: colors.body }),
                  new TextRun({ text: "(Preparing)", size: 16, color: colors.secondary, italics: true })
                ]}),
                new Paragraph({ children: [
                  new TextRun({ text: "• HashiCorp Terraform Associate ", size: 18, color: colors.body }),
                  new TextRun({ text: "(Preparing)", size: 16, color: colors.secondary, italics: true })
                ]})
              ]
            })
          ]})
        ]
      }),
      
      // STRENGTHS
      new Paragraph({ style: "SectionHeader", children: [new TextRun("KEY STRENGTHS")] }),
      new Paragraph({
        style: "Body",
        children: [new TextRun({ text: "Systems Thinker  •  Builder Mindset  •  End-to-End Ownership  •  First-Principles Problem Solving  •  Highly Adaptable  •  Fast Learner", size: 20, color: colors.body })]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/z/my-project/download/Sucharitha_Nandyala_Resume.docx", buffer);
  console.log("Resume created successfully with green accent!");
});
