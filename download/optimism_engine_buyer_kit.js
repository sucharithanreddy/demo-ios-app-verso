const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType, 
        VerticalAlign, LevelFormat, PageBreak } = require('docx');
const fs = require('fs');

const colors = {
  primary: "020617",
  body: "1E293B",
  secondary: "64748B",
  accent: "94A3B8",
  tableBg: "F8FAFC",
  highlight: "10B981",
  alert: "DC2626"
};

const tableBorder = { style: BorderStyle.SINGLE, size: 12, color: colors.primary };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } };

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Times New Roman", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 32, bold: true, color: colors.primary, font: "Times New Roman" }, paragraph: { spacing: { before: 600, after: 300 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 28, bold: true, color: colors.body, font: "Times New Roman" }, paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, color: colors.secondary, font: "Times New Roman" }, paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 2 } }
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-list", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-steps", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
    ]
  },
  sections: [{
    properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    children: [
      // Title
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "OPTIMISM ENGINE", bold: true, size: 48, color: colors.primary, font: "Times New Roman" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "Buyer Target List & Outreach Strategy", size: 28, color: colors.secondary, font: "Times New Roman" })] }),

      // Important Note
      new Paragraph({ 
        spacing: { before: 200, after: 200 }, 
        shading: { fill: "FEF3C7", type: ShadingType.CLEAR },
        children: [new TextRun({ text: "IMPORTANT UPDATE: ", bold: true, size: 22, font: "Times New Roman" }), new TextRun({ text: "Woebot Health (raised $124M) shut down in June 2025 due to funding issues. This validates the market need for AI safety — Woebot's pure AI approach couldn't scale safely. Optimism Engine's Anti-Hallucination architecture solves exactly this problem.", size: 22, font: "Times New Roman" })] 
      }),

      // Section 1: Tier 1 Buyers
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Tier 1: Strategic Buyers (Active Acquirers)")] }),
      new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "These companies are actively acquiring and have the budget. They understand the mental health AI space and will immediately see the value of the Anti-Hallucination architecture.", size: 22, font: "Times New Roman" })] }),

      // Wysa
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1. Wysa (HIGH PRIORITY)")] }),
      new Paragraph({ spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Why They're Perfect: ", bold: true, size: 22, font: "Times New Roman" }), new TextRun({ text: "Wysa is in aggressive acquisition mode — they acquired April Health (behavioral health) and Kins (physical therapy) in 2024-2025. They have an AI chatbot but face the same hallucination concerns as everyone else. The Gatekeeper technology would give them immediate differentiation.", size: 22, font: "Times New Roman" })] }),
      new Paragraph({ spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Company Details:", bold: true, size: 22, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "Location: Boston, USA (founded in India)", size: 20, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "Users: 5+ million downloads globally", size: 20, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "Funding: Backed by Swiss Re, MassMutual partnership", size: 20, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Recent Moves: Wysa Assure (for insurers), Wysa Copilot (for clinics)", size: 20, font: "Times New Roman" })] }),
      new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Who to Contact: ", bold: true, size: 22, font: "Times New Roman" }), new TextRun({ text: "Jo Aggarwal (CEO/Co-founder) — search on LinkedIn. Also: Ramakant Vempati (Co-founder), Head of Corporate Development.", size: 22, font: "Times New Roman" })] }),

      // Intellect
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2. Intellect (HIGH PRIORITY)")] }),
      new Paragraph({ spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Why They're Perfect: ", bold: true, size: 22, font: "Times New Roman" }), new TextRun({ text: "Intellect is the fastest-growing mental health benefits company in Asia-Pacific. They serve 4M+ members across 100 countries. They need differentiated technology to compete with Calm/Headspace in the enterprise market. The Gatekeeper gives them a \"safe AI\" story for corporate buyers.", size: 22, font: "Times New Roman" })] }),
      new Paragraph({ spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Company Details:", bold: true, size: 22, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "Location: Singapore (global presence)", size: 20, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "Users: 4+ million members, 120+ languages", size: 20, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "Focus: Enterprise mental health benefits, coaching, therapy", size: 20, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Recent: Major enterprise partnerships across Asia", size: 20, font: "Times New Roman" })] }),
      new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Who to Contact: ", bold: true, size: 22, font: "Times New Roman" }), new TextRun({ text: "Theodoric Chew (CEO/Co-founder) — very active on LinkedIn. Also: Alvin Ea (COO/Co-founder).", size: 22, font: "Times New Roman" })] }),

      // Calm
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3. Calm (MEDIUM PRIORITY)")] }),
      new Paragraph({ spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Why They're a Fit: ", bold: true, size: 22, font: "Times New Roman" }), new TextRun({ text: "Calm is the market leader in meditation/sleep apps, now expanding into clinical mental health with Calm Health. They've made acquisitions (e.g., Ripple) and have the budget. However, they may prefer to build vs. buy at this price point.", size: 22, font: "Times New Roman" })] }),
      new Paragraph({ spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Company Details:", bold: true, size: 22, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "Location: San Francisco, USA", size: 20, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "Revenue: $596M+ (2024)", size: 20, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 80, line: 312 }, children: [new TextRun({ text: "Valuation: $2B+", size: 20, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Who to Contact: David Ko (CEO), Head of Corporate Development", size: 20, font: "Times New Roman" })] }),

      // Section 2: Tier 2 Buyers
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Tier 2: EAP Providers & Corporate Wellness")] }),
      new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "These companies sell to enterprises and need AI tools to modernize their offerings. They may not have large M&A budgets but could be strategic acquirers for white-label deployment.", size: 22, font: "Times New Roman" })] }),

      // ThoughtFull
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4. ThoughtFull")] }),
      new Paragraph({ spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Why They're a Fit: ", bold: true, size: 22, font: "Times New Roman" }), new TextRun({ text: "Singapore-based EAP provider competing with Intellect. They offer therapy, wellness webinars, and 24/7 support. Adding an AI CBT engine would differentiate their enterprise pitch. Likely more open to a small acquisition than the big players.", size: 22, font: "Times New Roman" })] }),
      new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Who to Contact: ", bold: true, size: 22, font: "Times New Roman" }), new TextRun({ text: "Joan Low (Founder/CEO) — search on LinkedIn. Singapore-based, active in mental health community.", size: 22, font: "Times New Roman" })] }),

      // Mercer
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5. Mercer (Marsh McLennan)")] }),
      new Paragraph({ spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Why They're a Fit: ", bold: true, size: 22, font: "Times New Roman" }), new TextRun({ text: "Mercer is a global HR consulting giant offering EAP services to Fortune 500 companies. They don't have an AI mental health product and may want to acquire one rather than build. The enterprise safety angle plays perfectly here.", size: 22, font: "Times New Roman" })] }),
      new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Who to Contact: ", bold: true, size: 22, font: "Times New Roman" }), new TextRun({ text: "Look for \"Head of Digital Health\" or \"VP Employee Wellbeing\" on LinkedIn. Also: M&A team at Marsh McLennan parent company.", size: 22, font: "Times New Roman" })] }),

      // Section 3: Marketplaces
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Tier 3: App Marketplaces (Quick Sale)")] }),
      new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "If strategic buyers don't bite, list on these marketplaces. You'll get lower prices ($10-25K typically) but faster sales (2-4 weeks).", size: 22, font: "Times New Roman" })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Acquire.com")] }),
      new Paragraph({ spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "The largest marketplace for startup acquisitions. Many micro-PE funds and individual buyers browse here. List at $40K, accept $25K minimum. Listing is free.", size: 22, font: "Times New Roman" })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Flippa")] }),
      new Paragraph({ spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Larger buyer pool but more price-sensitive buyers. Good for apps with revenue. Pre-revenue apps typically sell for $5-15K here. Use as backup option.", size: 22, font: "Times New Roman" })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Side Projectors")] }),
      new Paragraph({ spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Free marketplace for smaller projects. Lower quality buyers but good for quick sale. Expect $5-15K range.", size: 22, font: "Times New Roman" })] }),

      // Section 4: Outreach Templates
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Outreach Templates")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("LinkedIn Connection Request (55 characters max)")] }),
      new Paragraph({ 
        spacing: { after: 200 }, 
        shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
        children: [new TextRun({ text: "Built an AI mental health engine you should see — solves the hallucination problem.", size: 20, italics: true, font: "Times New Roman" })] 
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("LinkedIn Message (After Connection Accepted)")] }),
      new Paragraph({ 
        spacing: { after: 200 }, 
        shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
        children: [new TextRun({ text: "Hi [Name],\n\nThanks for connecting.\n\nI built Optimism Engine — a CBT mental health app with a proprietary \"Anti-Hallucination\" architecture. Unlike standard AI chatbots, it uses a deterministic logic layer (\"The Gatekeeper\") to enforce safety and guide users through evidence-based CBT.\n\nWith Woebot shutting down last month, the industry is waking up to AI safety risks. Our engine solves exactly that problem.\n\nI'm selling the complete IP (source code, algorithms, content) for $40K — a fraction of what it would cost to build in-house.\n\nWould you be open to a 10-minute demo? I can show you the Gatekeeper in action.\n\nBest,\n[Your Name]", size: 20, font: "Times New Roman" })] 
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Cold Email Template")] }),
      new Paragraph({ 
        spacing: { after: 200 }, 
        shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
        children: [new TextRun({ text: "Subject: AI safety tech for [Company] mental health offerings\n\nHi [Name],\n\nI noticed [Company]'s impressive growth in the mental health space — congratulations on [specific recent achievement].\n\nI'm reaching out because I've built something that could give [Company] a significant competitive edge: a CBT mental health engine with built-in AI safety.\n\nThe Problem: Every AI mental health app (including Woebot, which just shut down) relies on pure Generative AI — which can hallucinate. In mental health, that's dangerous.\n\nThe Solution: Optimism Engine uses a \"Gatekeeper\" logic layer that screens every input/output through deterministic safety protocols. No hallucinations. Enterprise-ready.\n\nWhat's Included:\n• Full source code (Next.js 16, PostgreSQL, GPT-4 integration)\n• Proprietary Gatekeeper algorithms (the Anti-Hallucination IP)\n• Complete CBT content library\n• Production-ready deployment\n\nI'm selling the complete IP for $40K — approximately $25K less than building equivalent technology in-house.\n\nWould you be open to a brief call to see if this fits [Company]'s roadmap?\n\nBest regards,\n[Your Name]\n[Link to live demo or 1-page teaser attached]", size: 20, font: "Times New Roman" })] 
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Follow-Up Message (No Reply After 5 Days)")] }),
      new Paragraph({ 
        spacing: { after: 200 }, 
        shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
        children: [new TextRun({ text: "Hi [Name],\n\nJust following up on my previous message.\n\nGiven Woebot's recent shutdown (after raising $124M), the mental health industry is rethinking AI safety. Optimism Engine's Gatekeeper technology addresses exactly this gap.\n\nHappy to share a code sample or live demo if you're curious — no commitment needed.\n\nBest,\n[Your Name]", size: 20, font: "Times New Roman" })] 
      }),

      // Section 5: Action Plan
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Your Action Plan (This Week)")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Day 1-2: Preparation")] }),
      new Paragraph({ numbering: { reference: "numbered-steps", level: 0 }, spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Take 3 screenshots: Chat interface, The Lab dashboard, Mobile view (use browser dev tools)", size: 22, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "numbered-steps", level: 0 }, spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Ensure your app is live and accessible via a shareable link", size: 22, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "numbered-steps", level: 0 }, spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Create a simple GitHub repo (private) that you can grant read access to for due diligence", size: 22, font: "Times New Roman" })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Day 3-4: Tier 1 Outreach")] }),
      new Paragraph({ numbering: { reference: "numbered-steps", level: 0 }, spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Send LinkedIn connection requests to Jo Aggarwal (Wysa) and Theodoric Chew (Intellect)", size: 22, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "numbered-steps", level: 0 }, spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Once connected, send the LinkedIn message template", size: 22, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "numbered-steps", level: 0 }, spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "If no response in 5 days, send follow-up", size: 22, font: "Times New Roman" })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Day 5-7: Expand & Backup")] }),
      new Paragraph({ numbering: { reference: "numbered-steps", level: 0 }, spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "If no interest from Tier 1, reach out to Tier 2 (ThoughtFull, Mercer contacts)", size: 22, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "numbered-steps", level: 0 }, spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Create listing on Acquire.com as backup", size: 22, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "numbered-steps", level: 0 }, spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Attach One-Page Teaser to all outreach", size: 22, font: "Times New Roman" })] }),

      // Final Tips
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Final Tips")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Lead with the problem: \"AI hallucination in mental health\" — this is your differentiator", size: 22, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Mention Woebot's shutdown — it validates the market need for your solution", size: 22, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Don't mention $0 development cost or 2-month timeline — ever", size: 22, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Be ready for live demo requests — know your app inside out", size: 22, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 100, line: 312 }, children: [new TextRun({ text: "Floor price is $25K — walk away from anything lower", size: 22, font: "Times New Roman" })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, spacing: { after: 200, line: 312 }, children: [new TextRun({ text: "Get NDA signed before granting code access", size: 22, font: "Times New Roman" })] }),

      new Paragraph({ 
        spacing: { before: 400 }, 
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Good luck with your sale! 🚀", bold: true, size: 24, color: colors.highlight, font: "Times New Roman" })] 
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/home/z/my-project/download/Optimism_Engine_Buyer_Kit.docx', buffer);
  console.log('Buyer Kit created successfully!');
});
