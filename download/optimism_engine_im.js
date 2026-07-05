const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer, 
        AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType, VerticalAlign, 
        PageNumber, LevelFormat, PageBreak } = require('docx');
const fs = require('fs');

// Color scheme - Midnight Code palette
const colors = {
  primary: "020617",
  body: "1E293B",
  secondary: "64748B",
  accent: "94A3B8",
  tableBg: "F8FAFC"
};

const tableBorder = { style: BorderStyle.SINGLE, size: 12, color: colors.primary };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } };

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Times New Roman", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", run: { size: 56, bold: true, color: colors.primary, font: "Times New Roman" }, paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, color: colors.primary, font: "Times New Roman" }, paragraph: { spacing: { before: 600, after: 300 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 28, bold: true, color: colors.body, font: "Times New Roman" }, paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, color: colors.secondary, font: "Times New Roman" }, paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 2 } }
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-list", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-features", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-assets", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-tech", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
    ]
  },
  sections: [
    // Cover Page
    {
      properties: { page: { margin: { top: 0, right: 0, bottom: 0, left: 0 } } },
      children: [
        new Paragraph({ spacing: { before: 2500 }, children: [] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CONFIDENTIAL", size: 24, color: colors.secondary, font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "INFORMATION MEMORANDUM", bold: true, size: 48, color: colors.primary, font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "OPTIMISM ENGINE", bold: true, size: 72, color: colors.primary, font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Proprietary Hybrid Cognitive Engine for Mental Health", size: 28, color: colors.secondary, font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 1500 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ACQUISITION OPPORTUNITY", bold: true, size: 32, color: colors.body, font: "Times New Roman" })] }),
        new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Asking Price: $40,000 USD", size: 28, color: colors.body, font: "Times New Roman" })] }),
        new Paragraph({ children: [new PageBreak()] })
      ]
    },
    // Main Content
    {
      properties: { page: { margin: { top: 1800, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "CONFIDENTIAL | Optimism Engine Acquisition", size: 18, color: colors.secondary, font: "Times New Roman" })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Page ", size: 18, color: colors.secondary, font: "Times New Roman" }), new TextRun({ children: [PageNumber.CURRENT], size: 18, color: colors.secondary, font: "Times New Roman" }), new TextRun({ text: " of ", size: 18, color: colors.secondary, font: "Times New Roman" }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: colors.secondary, font: "Times New Roman" })] })] }) },
      children: [
        // Executive Summary
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Executive Summary")] }),
        new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Optimism Engine represents a groundbreaking approach to AI-powered mental health support, combining the flexibility of Generative AI with the safety and reliability of a Deterministic Logic Layer. Unlike standard AI chatbots that can hallucinate or provide inconsistent guidance, Optimism Engine uses a proprietary \"Gatekeeper\" architecture to enforce safety protocols, detect cognitive distortions, and guide users through evidence-based Cognitive Behavioral Therapy (CBT) interventions.", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "This acquisition opportunity includes the complete source code, proprietary logic algorithms, branded content assets, and full intellectual property rights. The application is production-ready and deployed, representing approximately 6 months of research, architecture design, and development work valued at over $60,000 based on market rates for senior engineering and UI design talent.", size: 22, font: "Times New Roman" })] }),

        // Key Investment Highlights
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Key Investment Highlights")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Unique Differentiation: Proprietary Anti-Hallucination Architecture addresses the #1 concern in AI mental health applications", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Production-Ready: Fully functional web application currently live on Vercel with mobile-ready Capacitor architecture", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Complete IP Transfer: Full source code, proprietary algorithms, branded content, and intellectual property rights", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Scalable Architecture: Built on enterprise-grade tech stack (Next.js 16, PostgreSQL, Clerk Auth)", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Strategic Value: For established mental health platforms, this engine can pay for itself within 3 months through upsells and feature expansion", size: 22, font: "Times New Roman" })] }),

        // The Problem
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("The Problem: AI Hallucination in Mental Health")] }),
        new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "The mental health app market has exploded with AI-powered solutions, but a critical problem remains unsolved: Generative AI systems can hallucinate. In casual applications, a fabricated fact is merely annoying. In mental health contexts, AI hallucinations can be dangerous—providing incorrect therapeutic guidance, missing crisis indicators, or generating inappropriate content that could harm vulnerable users.", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Major mental health platforms (Wysa, Woebot, Reflectly) rely primarily on pure Generative AI approaches, leaving them exposed to these risks. Regulatory scrutiny is increasing, and liability concerns are growing among enterprise buyers evaluating mental health solutions for their employee populations.", size: 22, font: "Times New Roman" })] }),

        // The Solution
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("The Solution: Hybrid Cognitive Engine")] }),
        new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Optimism Engine solves the hallucination problem through a proprietary Hybrid Architecture that combines the conversational fluency of Large Language Models with the safety and consistency of a Deterministic Logic Layer. This approach treats mental health like engineering—applying systematic, verifiable processes to emotional and cognitive challenges.", size: 22, font: "Times New Roman" })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("The Gatekeeper (Logic Layer)")] }),
        new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "At the core of Optimism Engine is \"The Gatekeeper\"—a deterministic state machine that acts as a safety layer between user input and AI response generation. The Gatekeeper enforces three critical functions:", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "numbered-features", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Safety Enforcement: Screens all inputs and outputs against defined safety protocols, preventing harmful content from reaching users", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "numbered-features", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Distortion Detection: Identifies cognitive distortions (Catastrophizing, Labeling, All-or-Nothing Thinking) before AI processing", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "numbered-features", level: 0 }, spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Guided Analysis: Directs the AI through structured Root Cause Analysis rather than free-form conversation", size: 22, font: "Times New Roman" })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("The Reflect Engine (Conversational AI)")] }),
        new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "The Reflect Engine is the user-facing conversational interface powered by GPT-4, but constrained and guided by the Gatekeeper. Unlike unconstrained AI chatbots, Reflect Engine conversations follow therapeutic best practices while maintaining natural, empathetic dialogue. The system systematically helps users label distortions, reframe negative thoughts, and identify root causes (Trigger Events) underlying their emotional responses.", size: 22, font: "Times New Roman" })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("The Lab (Interactive Dashboard)")] }),
        new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "The Lab provides a science/engineering-themed suite of interactive tools that extend the therapeutic experience beyond conversation. This unique feature set differentiates Optimism Engine from chatbot-only competitors:", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Quick Tools: Emergency grounding exercises (5-4-3-2-1 technique), Box Breathing, Reality Checks for immediate anxiety management", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Practice Module: Interactive exercises including Reframe Lab and Distortion Spotter to retrain cognitive patterns", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Goals Tracking: Data-driven monitoring of mental performance metrics including Pattern Interruptions and Streaks", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Visual Analytics: Journey Mapping with Iceberg visualization showing progress from Surface Thoughts to Core Beliefs", size: 22, font: "Times New Roman" })] }),

        // Technology Stack
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Technology Stack")] }),
        new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "The application is built on a modern, enterprise-grade technology stack designed for scalability, maintainability, and performance:", size: 22, font: "Times New Roman" })] }),
        
        // Tech Stack Table
        new Table({
          columnWidths: [3120, 6240],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          alignment: AlignmentType.CENTER,
          rows: [
            new TableRow({ tableHeader: true, children: [
              new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Component", bold: true, size: 20, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6240, type: WidthType.DXA }, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Technology", bold: true, size: 20, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Frontend Framework", size: 20, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6240, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Next.js 16 (App Router), React, TypeScript", size: 20, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Styling", size: 20, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6240, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tailwind CSS, Shadcn/ui, Framer Motion", size: 20, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Backend", size: 20, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6240, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Next.js API Routes", size: 20, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Database", size: 20, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6240, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "PostgreSQL with Prisma ORM", size: 20, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Authentication", size: 20, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6240, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Clerk (Enterprise-grade auth)", size: 20, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "AI Integration", size: 20, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6240, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "OpenAI API (GPT-4) via custom safety protocols", size: 20, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Mobile Ready", size: 20, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6240, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Capacitor architecture (iOS/Android ready)", size: 20, font: "Times New Roman" })] })] })
            ]})
          ]
        }),

        // Assets Included
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Assets Included in Sale")] }),
        new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "The acquisition includes complete transfer of all intellectual property and assets required to operate and scale the Optimism Engine platform:", size: 22, font: "Times New Roman" })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Source Code & Technical Assets")] }),
        new Paragraph({ numbering: { reference: "numbered-assets", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Complete Frontend Codebase: Next.js 16 application with all React components, pages, and UI elements", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "numbered-assets", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Complete Backend Codebase: API routes, business logic, and integration layers", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "numbered-assets", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Logic Engine Source Code: The Gatekeeper state machine and safety algorithms", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "numbered-assets", level: 0 }, spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Database Schema: Complete Prisma schema with all models and relationships", size: 22, font: "Times New Roman" })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Intellectual Property")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Gatekeeper Logic State Machine: Proprietary deterministic safety layer architecture", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Safety Algorithms: Custom protocols for input/output validation and crisis detection", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "The Lab Concept: Science/engineering-themed approach to mental wellness tools", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Custom CBT Prompts: Engineered prompts for distortion detection and reframing", size: 22, font: "Times New Roman" })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Content & Branding")] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Distortion Definitions: Complete library of cognitive distortion types and explanations", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Lab Exercises: All interactive exercises (Reframe Lab, Distortion Spotter, etc.)", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "System Branding: \"Optimism Engine\" brand assets and \"The Lab\" visual theme", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "UI/UX Design: High-conversion landing page and application interface", size: 22, font: "Times New Roman" })] }),

        // Valuation
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Valuation & Pricing Rationale")] }),
        new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "The asking price of $40,000 USD reflects the Replacement Cost for a buyer to develop equivalent technology internally, not the seller's development costs. This valuation methodology is standard in technology acquisitions where the value lies in intellectual property and engineering expertise rather than revenue multiples.", size: 22, font: "Times New Roman" })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Replacement Cost Analysis")] }),
        new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "For an established company to build Optimism Engine internally, the resource allocation would typically include:", size: 22, font: "Times New Roman" })] }),
        
        // Valuation Table
        new Table({
          columnWidths: [4680, 2340, 2340],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          alignment: AlignmentType.CENTER,
          rows: [
            new TableRow({ tableHeader: true, children: [
              new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Component", bold: true, size: 20, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Timeline", bold: true, size: 20, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Cost (Est.)", bold: true, size: 20, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Senior Full-Stack Engineer", size: 20, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "4-5 months", size: 20, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$50,000+", size: 20, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "UI/UX Design", size: 20, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1-2 months", size: 20, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$10,000+", size: 20, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CBT/Therapeutic Content Development", size: 20, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Ongoing", size: 20, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$5,000+", size: 20, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TOTAL REPLACEMENT COST", bold: true, size: 20, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5-7 months", bold: true, size: 20, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$65,000+", bold: true, size: 20, font: "Times New Roman" })] })] })
            ]})
          ]
        }),

        new Paragraph({ spacing: { before: 300, after: 200, line: 312 }, children: [new TextRun({ text: "By acquiring Optimism Engine at $40,000, buyers save approximately $25,000+ and 4-6 months of development time, while gaining immediate access to a production-ready, tested solution.", size: 22, font: "Times New Roman" })] }),

        // Ideal Buyer Profile
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Ideal Buyer Profile")] }),
        new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Optimism Engine is ideally suited for several types of strategic acquirers who can leverage the technology to accelerate their market position:", size: 22, font: "Times New Roman" })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Mental Health Platforms")] }),
        new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Established mental health applications (Wysa, Woebot, Reflectly, Sanvello) can integrate the Gatekeeper architecture to differentiate their AI offerings and address growing regulatory concerns about AI safety in therapeutic contexts. The Anti-Hallucination technology provides immediate competitive advantage in enterprise sales conversations.", size: 22, font: "Times New Roman" })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Employee Assistance Program (EAP) Providers")] }),
        new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Corporate wellness companies and EAP providers seeking to modernize their digital offerings can deploy Optimism Engine as a white-label solution. The safety-first architecture appeals to enterprise buyers who require robust risk management for employee mental health tools.", size: 22, font: "Times New Roman" })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Healthcare Technology Companies")] }),
        new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Digital health companies looking to expand into mental health can use Optimism Engine as a foundation, leveraging the CBT content and safety architecture while adding their own distribution channels and clinical partnerships.", size: 22, font: "Times New Roman" })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("AI Safety Startups")] }),
        new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Companies focused on AI safety and responsible AI development can acquire Optimism Engine as a case study and working implementation of deterministic safety layers in high-stakes applications.", size: 22, font: "Times New Roman" })] }),

        // Transaction Terms
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Transaction Terms")] }),
        new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "The seller is seeking a clean asset sale with the following structure:", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Asking Price: $40,000 USD", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Floor Price: $25,000 USD (for quick transfer)", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Payment Terms: Full payment upon transfer of assets", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Transition Support: 30 days of technical support included", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Non-Compete: Available upon request", size: 22, font: "Times New Roman" })] }),

        // Contact
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Next Steps")] }),
        new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Interested parties are invited to request additional information including:", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Live product demonstration", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Technical architecture documentation", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 150, line: 312 }, children: [new TextRun({ text: "Code sample review", size: 22, font: "Times New Roman" })] }),
        new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Due diligence materials", size: 22, font: "Times New Roman" })] }),

        new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "All inquiries treated with strict confidentiality.", size: 22, italics: true, color: colors.secondary, font: "Times New Roman" })] })
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/home/z/my-project/download/Optimism_Engine_Information_Memorandum.docx', buffer);
  console.log('Information Memorandum created successfully!');
});
