const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign } = require('docx');
const fs = require('fs');

const colors = {
  primary: "020617",
  body: "1E293B",
  secondary: "64748B",
  accent: "94A3B8",
  tableBg: "F8FAFC",
  highlight: "10B981"
};

const tableBorder = { style: BorderStyle.SINGLE, size: 12, color: colors.primary };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } };

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Times New Roman", size: 22 } } }
  },
  sections: [{
    properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
    children: [
      // Header
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ACQUISITION OPPORTUNITY", bold: true, size: 20, color: colors.secondary, font: "Times New Roman" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100 }, children: [new TextRun({ text: "OPTIMISM ENGINE", bold: true, size: 48, color: colors.primary, font: "Times New Roman" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "Proprietary Hybrid Cognitive Engine for Mental Health", size: 22, color: colors.body, font: "Times New Roman" })] }),
      
      // Price Badge
      new Paragraph({ 
        alignment: AlignmentType.CENTER, 
        spacing: { before: 100, after: 300 },
        children: [new TextRun({ text: "ASKING PRICE: $40,000 USD", bold: true, size: 28, color: colors.highlight, font: "Times New Roman" })] 
      }),

      // The Hook
      new Paragraph({ 
        alignment: AlignmentType.CENTER, 
        spacing: { after: 300 },
        shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
        children: [new TextRun({ text: "\"The Only AI Mental Health App That Can't Hallucinate\"", bold: true, italics: true, size: 24, color: colors.primary, font: "Times New Roman" })] 
      }),

      // What It Is
      new Paragraph({ spacing: { before: 200, after: 150 }, children: [new TextRun({ text: "WHAT IS IT?", bold: true, size: 24, color: colors.primary, font: "Times New Roman" })] }),
      new Paragraph({ spacing: { after: 200, line: 276 }, children: [new TextRun({ text: "A production-ready CBT mental wellness application with a unique \"Anti-Hallucination\" architecture. Unlike standard AI chatbots, Optimism Engine uses a Deterministic Logic Layer (\"The Gatekeeper\") to enforce safety, detect cognitive distortions, and guide users through Root Cause Analysis. Built for enterprise-grade reliability.", size: 20, font: "Times New Roman" })] }),

      // Key Differentiator
      new Paragraph({ spacing: { before: 200, after: 150 }, children: [new TextRun({ text: "WHY IT'S DIFFERENT", bold: true, size: 24, color: colors.primary, font: "Times New Roman" })] }),
      new Paragraph({ spacing: { after: 200, line: 276 }, children: [new TextRun({ text: "Every other mental health AI app relies 100% on Generative AI—which can hallucinate, miss crisis signals, or provide harmful advice. Optimism Engine adds a proprietary safety layer that screens every input and output. This addresses the #1 concern for enterprise buyers, regulators, and clinical partners.", size: 20, font: "Times New Roman" })] }),

      // Features Grid
      new Paragraph({ spacing: { before: 200, after: 150 }, children: [new TextRun({ text: "CORE FEATURES", bold: true, size: 24, color: colors.primary, font: "Times New Roman" })] }),
      
      new Table({
        columnWidths: [4680, 4680],
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        alignment: AlignmentType.CENTER,
        rows: [
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "✓ The Reflect Engine", bold: true, size: 20, font: "Times New Roman" })] }), new Paragraph({ children: [new TextRun({ text: "CBT-powered conversational AI with distortion detection", size: 18, color: colors.secondary, font: "Times New Roman" })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "✓ The Gatekeeper", bold: true, size: 20, font: "Times New Roman" })] }), new Paragraph({ children: [new TextRun({ text: "Deterministic safety layer (the Anti-Hallucination IP)", size: 18, color: colors.secondary, font: "Times New Roman" })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "✓ The Lab Dashboard", bold: true, size: 20, font: "Times New Roman" })] }), new Paragraph({ children: [new TextRun({ text: "Interactive tools: Reframe Lab, Distortion Spotter, Breathing", size: 18, color: colors.secondary, font: "Times New Roman" })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "✓ Journey Mapping", bold: true, size: 20, font: "Times New Roman" })] }), new Paragraph({ children: [new TextRun({ text: "Iceberg visualization: Surface Thoughts → Core Beliefs", size: 18, color: colors.secondary, font: "Times New Roman" })] })] })
          ]})
        ]
      }),

      // Tech Stack
      new Paragraph({ spacing: { before: 300, after: 150 }, children: [new TextRun({ text: "TECH STACK", bold: true, size: 24, color: colors.primary, font: "Times New Roman" })] }),
      new Paragraph({ spacing: { after: 200, line: 276 }, children: [new TextRun({ text: "Next.js 16 • React • TypeScript • PostgreSQL • Prisma • Clerk Auth • OpenAI GPT-4 • Capacitor (Mobile-Ready)", size: 18, color: colors.body, font: "Times New Roman" })] }),

      // What's Included
      new Paragraph({ spacing: { before: 200, after: 150 }, children: [new TextRun({ text: "WHAT'S INCLUDED", bold: true, size: 24, color: colors.primary, font: "Times New Roman" })] }),
      new Paragraph({ spacing: { after: 200, line: 276 }, children: [new TextRun({ text: "Full source code (Frontend + Backend + Logic Engine) • Complete database schema • Proprietary Gatekeeper algorithms • Custom CBT prompts & content • UI/UX design • 30 days transition support", size: 20, font: "Times New Roman" })] }),

      // Ideal Buyer
      new Paragraph({ spacing: { before: 200, after: 150 }, children: [new TextRun({ text: "IDEAL FOR", bold: true, size: 24, color: colors.primary, font: "Times New Roman" })] }),
      new Paragraph({ spacing: { after: 200, line: 276 }, children: [new TextRun({ text: "Mental health platforms (Wysa, Woebot) seeking AI safety differentiation • EAP providers expanding digital offerings • Healthcare tech companies entering mental health • AI safety startups needing proven implementation", size: 20, font: "Times New Roman" })] }),

      // Bottom Table - Key Numbers
      new Paragraph({ spacing: { before: 300 }, children: [] }),
      new Table({
        columnWidths: [3120, 3120, 3120],
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        alignment: AlignmentType.CENTER,
        rows: [
          new TableRow({ tableHeader: true, children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "DEVELOPMENT VALUE", bold: true, size: 18, font: "Times New Roman" })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "STATUS", bold: true, size: 18, font: "Times New Roman" })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "SAVINGS", bold: true, size: 18, font: "Times New Roman" })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "~$65,000", bold: true, size: 22, color: colors.highlight, font: "Times New Roman" })] }), new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Replacement Cost", size: 16, color: colors.secondary, font: "Times New Roman" })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "LIVE", bold: true, size: 22, color: colors.highlight, font: "Times New Roman" })] }), new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Production Ready", size: 16, color: colors.secondary, font: "Times New Roman" })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "$25,000+", bold: true, size: 22, color: colors.highlight, font: "Times New Roman" })] }), new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "vs. Building In-House", size: 16, color: colors.secondary, font: "Times New Roman" })] })] })
          ]})
        ]
      }),

      // Contact CTA
      new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "INTERESTED? Request a live demo and code review.", size: 20, font: "Times New Roman" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100 }, children: [new TextRun({ text: "All inquiries treated with strict confidentiality.", size: 18, italics: true, color: colors.secondary, font: "Times New Roman" })] })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/home/z/my-project/download/Optimism_Engine_One_Page_Teaser.docx', buffer);
  console.log('One-Page Teaser created successfully!');
});
