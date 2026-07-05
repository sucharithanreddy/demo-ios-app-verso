const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer, 
        AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType, VerticalAlign, 
        PageNumber, LevelFormat, TableOfContents, PageBreak } = require('docx');
const fs = require('fs');

// Color scheme - Midnight Code palette
const colors = {
  primary: "020617",      // Midnight Black
  body: "1E293B",         // Deep Slate Blue
  secondary: "64748B",    // Cool Blue-Gray
  accent: "94A3B8",       // Steady Silver
  tableBg: "F8FAFC"       // Glacial Blue-White
};

// Table border style
const tableBorder = { style: BorderStyle.SINGLE, size: 12, color: colors.primary };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } };

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Times New Roman", size: 22 } }
    },
    paragraphStyles: [
      {
        id: "Title",
        name: "Title",
        basedOn: "Normal",
        run: { size: 56, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER }
      },
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 600, after: 300 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, color: colors.body, font: "Times New Roman" },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 1 }
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 24, bold: true, color: colors.secondary, font: "Times New Roman" },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 2 }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: "bullet-list",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "numbered-objectives",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "numbered-strategies",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "numbered-targeting",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "numbered-creative",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "numbered-budget",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "numbered-implementation",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  sections: [
    // Cover Section
    {
      properties: {
        page: { margin: { top: 0, right: 0, bottom: 0, left: 0 } }
      },
      children: [
        new Paragraph({ spacing: { before: 3000 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "LINKEDIN CAMPAIGNS",
              bold: true,
              size: 72,
              color: colors.primary,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200 },
          children: [
            new TextRun({
              text: "A Comprehensive Guide to Promoting Your",
              size: 28,
              color: colors.secondary,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "SaaS CBT Mental Wellness App",
              size: 32,
              bold: true,
              color: colors.body,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({ spacing: { before: 2000 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Strategic Marketing Framework for B2B Mental Health Solutions",
              size: 24,
              italics: true,
              color: colors.accent,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({ children: [new PageBreak()] })
      ]
    },
    // Main Content Section
    {
      properties: {
        page: { margin: { top: 1800, right: 1440, bottom: 1440, left: 1440 } }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: "LinkedIn Campaigns Guide | CBT Mental Wellness App",
                  size: 18,
                  color: colors.secondary,
                  font: "Times New Roman"
                })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Page ", size: 18, color: colors.secondary, font: "Times New Roman" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18, color: colors.secondary, font: "Times New Roman" }),
                new TextRun({ text: " of ", size: 18, color: colors.secondary, font: "Times New Roman" }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: colors.secondary, font: "Times New Roman" })
              ]
            })
          ]
        })
      },
      children: [
        // Table of Contents
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun("Table of Contents")]
        }),
        new TableOfContents("Table of Contents", {
          hyperlink: true,
          headingStyleRange: "1-3"
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100 },
          children: [
            new TextRun({
              text: "Note: Right-click the Table of Contents and select \"Update Field\" to refresh page numbers.",
              size: 18,
              color: "999999",
              italics: true,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // Section 1: What Are LinkedIn Campaigns
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun("What Are LinkedIn Campaigns?")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "LinkedIn Campaigns represent a sophisticated advertising platform designed specifically for B2B marketing, enabling businesses to reach professional audiences with unprecedented precision and targeting capabilities. Unlike traditional social media advertising platforms that primarily focus on consumer behavior and interests, LinkedIn campaigns leverage the platform's unique professional data to deliver highly targeted messages to decision-makers, industry professionals, and corporate buyers. The platform offers a comprehensive suite of advertising solutions that span the entire marketing funnel, from initial brand awareness through consideration phases and ultimately to conversion and lead generation.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "The fundamental architecture of LinkedIn's advertising ecosystem revolves around the Campaign Manager platform, which serves as the central hub for creating, managing, and optimizing advertising campaigns. This sophisticated platform provides advertisers with granular control over their advertising spend, targeting parameters, creative elements, and performance measurement. LinkedIn's advertising model operates on both cost-per-click (CPC) and cost-per-impression (CPM) pricing structures, allowing advertisers to choose the payment model that best aligns with their campaign objectives and budget considerations.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "What distinguishes LinkedIn campaigns from other digital advertising platforms is the quality and depth of professional targeting data available to advertisers. The platform maintains detailed information about its members' job titles, industries, company sizes, seniority levels, skills, educational backgrounds, and professional interests. This wealth of first-party data enables advertisers to construct highly specific audience segments that would be impossible to replicate on other advertising platforms, making LinkedIn particularly valuable for B2B marketers seeking to reach specific professional demographics.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        // Section 2: Campaign Objectives
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun("Understanding LinkedIn Campaign Objectives")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "LinkedIn organizes its campaign objectives into three primary categories that correspond to different stages of the marketing funnel: Awareness, Consideration, and Conversions. Understanding these objectives and selecting the appropriate one for your mental wellness app is crucial for campaign success, as each objective type influences not only the optimization algorithm but also the available ad formats, targeting options, and pricing models. The platform's machine learning algorithms automatically optimize ad delivery based on the selected objective, making this initial decision one of the most impactful choices in campaign configuration.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("Awareness Objectives")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "Awareness campaigns are specifically designed to maximize your brand's visibility and share-of-voice within your target professional audience. These campaigns prioritize reaching the maximum number of unique individuals while maintaining optimal frequency levels to ensure message retention without causing audience fatigue. For mental wellness apps targeting corporate decision-makers, awareness campaigns serve as the foundation of your marketing strategy by establishing brand recognition and credibility within the professional wellness space. The primary objective options include Brand Awareness, which optimizes for maximum reach and impressions, and Video Views, which prioritizes video content engagement and completion rates.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("Consideration Objectives")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "Consideration objectives focus on engaging users who have shown initial interest and encouraging them to interact more deeply with your brand. This category includes Website Visits, which drives traffic to your landing pages or app store listings; Engagement campaigns that promote interactions with your content; Video Views for more in-depth video consumption; and Followers campaigns designed to grow your LinkedIn Company Page following. For CBT mental wellness apps, consideration campaigns are particularly effective for educating potential enterprise buyers about the science behind cognitive behavioral therapy and demonstrating your app's unique value proposition through detailed content engagement.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("Conversion Objectives")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "Conversion objectives represent the bottom-of-funnel stage where campaigns are optimized for specific actions that represent business value. LinkedIn offers several conversion-focused objectives including Lead Generation, which captures prospect information directly within the LinkedIn platform; Website Conversions for tracking specific actions on your website; and Job Applicants for recruitment-focused campaigns. For SaaS mental wellness apps, the Lead Generation objective is particularly powerful because it allows you to capture qualified B2B leads without requiring users to leave the LinkedIn platform, significantly reducing friction in the conversion process and improving lead quality through LinkedIn's professional context.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        // Objective Selection Table
        new Paragraph({
          spacing: { before: 300, after: 200 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Table 1: LinkedIn Campaign Objectives Selection Guide",
              bold: true,
              size: 20,
              font: "Times New Roman"
            })
          ]
        }),
        new Table({
          columnWidths: [2340, 2340, 2340, 2340],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          alignment: AlignmentType.CENTER,
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({
                  borders: cellBorders,
                  width: { size: 2340, type: WidthType.DXA },
                  shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Objective Type", bold: true, size: 20, font: "Times New Roman" })] })]
                }),
                new TableCell({
                  borders: cellBorders,
                  width: { size: 2340, type: WidthType.DXA },
                  shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Best For", bold: true, size: 20, font: "Times New Roman" })] })]
                }),
                new TableCell({
                  borders: cellBorders,
                  width: { size: 2340, type: WidthType.DXA },
                  shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Mental Health App Use Case", bold: true, size: 20, font: "Times New Roman" })] })]
                }),
                new TableCell({
                  borders: cellBorders,
                  width: { size: 2340, type: WidthType.DXA },
                  shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Pricing Model", bold: true, size: 20, font: "Times New Roman" })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Brand Awareness", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "New market entry", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Building EAP recognition", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CPM", size: 20, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Website Visits", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Driving traffic", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Demo signups, free trials", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CPC", size: 20, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Lead Generation", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Capturing B2B leads", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Enterprise demo requests", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CPC", size: 20, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Video Views", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Product demos", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CBT technique showcases", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CPV", size: 20, font: "Times New Roman" })] })] })
              ]
            })
          ]
        }),

        // Section 3: LinkedIn Ad Formats
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun("LinkedIn Ad Formats for Mental Wellness Apps")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "LinkedIn offers a diverse range of ad formats, each designed to serve specific marketing objectives and engagement styles. For mental wellness apps seeking to establish credibility and generate B2B leads, understanding the strengths and appropriate applications of each format is essential for developing an effective multi-format advertising strategy. The platform continuously evolves its ad format offerings, introducing new options such as Document Ads and Thought Leader Ads that provide innovative ways to engage professional audiences with educational and thought leadership content.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("Sponsored Content")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "Sponsored Content represents the most versatile and widely-used ad format on LinkedIn, appearing directly in members' feeds alongside organic content from their connections and followed companies. This native advertising approach ensures your mental wellness app messaging integrates seamlessly with the professional content experience, resulting in higher engagement rates compared to traditional display advertising. The format includes several subtypes: Single Image Ads for compelling visual storytelling, Video Ads for demonstrating app functionality and CBT techniques, and Carousel Ads for presenting multiple value propositions or user testimonials in an interactive swipeable format.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "For CBT mental wellness apps specifically, Sponsored Content excels at delivering educational content that establishes thought leadership while simultaneously promoting app features. Video Sponsored Content can demonstrate actual CBT exercises, showing potential enterprise buyers the practical value their employees would receive. Single Image Ads work effectively for showcasing app screenshots with compelling statistics about mental health outcomes, while Carousel Ads can tell a sequential story about an employee's wellness journey using your app. The key to success lies in creating content that provides genuine value while subtly positioning your app as the solution to workplace mental health challenges.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("Thought Leader Ads")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "Thought Leader Ads represent one of LinkedIn's most powerful formats for B2B marketing, allowing companies to sponsor posts from individual employees rather than from the company page. This format leverages the natural trust and engagement that personal profiles generate on social media platforms, with research consistently showing that content from individuals receives significantly higher engagement rates than corporate communications. For mental wellness apps, sponsoring content from clinical psychologists, wellness coaches, or mental health advocates within your organization can dramatically amplify your message authenticity and reach.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "The strategic advantage of Thought Leader Ads for mental wellness promotion lies in the credibility transfer that occurs when mental health expertise is communicated through individual practitioners rather than corporate entities. Enterprise buyers evaluating EAP solutions are more likely to trust clinical recommendations from named professionals than marketing messages from a company account. This format also enables your clinical team to share insights about cognitive behavioral therapy techniques, workplace mental health trends, and employee wellness strategies, positioning your organization as a thought leader in the corporate mental health space.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("Document Ads")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "Document Ads represent a relatively new but highly effective format that allows advertisers to upload PDF documents directly into the LinkedIn feed as interactive, swipeable carousel-style ads. This format is particularly valuable for mental wellness apps because it enables the distribution of substantive educational content such as whitepapers on CBT effectiveness, workplace mental health research summaries, and comprehensive guides to implementing employee wellness programs. Users can engage with multi-page documents directly within their LinkedIn feed without navigating to external websites.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "The Document Ads format aligns perfectly with the considered purchase process typical of enterprise mental health solutions. Decision-makers researching EAP options appreciate access to detailed clinical evidence and implementation guides without the friction of form submissions or external site visits. By providing valuable educational content upfront, your app demonstrates expertise and generosity that builds trust with potential enterprise customers. The format also captures lead information when users click through to download or view more details, enabling follow-up nurturing sequences for prospects who demonstrate interest.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("Lead Gen Forms")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "LinkedIn Lead Gen Forms represent a transformative capability for B2B advertisers, enabling lead capture directly within the LinkedIn platform without requiring users to navigate to external landing pages. These forms automatically pre-populate with LinkedIn profile data, dramatically reducing friction in the lead capture process and resulting in significantly higher conversion rates compared to traditional landing page forms. For mental wellness apps targeting enterprise buyers, this format is invaluable for capturing qualified leads requesting demos, pricing information, or implementation consultations.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "The Lead Gen Form format can be customized to capture specific information relevant to your enterprise sales process, including company size, current wellness program status, timeline for implementation, and specific mental health focus areas. For CBT mental wellness apps, asking about current EAP satisfaction levels or specific employee wellness challenges enables your sales team to personalize follow-up conversations with relevant solutions and case studies. The seamless user experience and professional context of LinkedIn Lead Gen Forms typically result in lead quality improvements of 30-50% compared to traditional web forms.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        // Section 4: Promoting CBT Mental Wellness App
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun("Promoting Your CBT Mental Wellness App on LinkedIn")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "Promoting a CBT mental wellness app on LinkedIn requires a strategic approach that recognizes the unique characteristics of the B2B buying process for enterprise wellness solutions. Unlike consumer wellness apps that target individual users, B2B mental wellness solutions must convince multiple stakeholders including HR directors, benefits managers, C-suite executives, and sometimes employee wellness committees. Each of these decision-makers has different priorities, concerns, and evaluation criteria that must be addressed through targeted messaging and content strategies.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("Identifying Your Target Audience")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "The foundation of any successful LinkedIn campaign lies in precisely defining and targeting the right audience segments. For CBT mental wellness apps targeting the enterprise market, the primary audience segments include Human Resources executives and managers responsible for employee benefits programs, Chief People Officers and Chief Human Resources Officers who champion organizational wellness initiatives, Benefits Managers who evaluate and select specific wellness vendors, and C-suite executives who approve wellness program budgets. Each of these segments requires different messaging approaches and value propositions.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "numbered-targeting", level: 0 },
          spacing: { after: 150, line: 312 },
          children: [new TextRun({ text: "HR Directors and Managers: Focus messaging on employee engagement, utilization rates, and seamless integration with existing benefits programs. These professionals care deeply about program adoption and measurable employee satisfaction improvements.", size: 22, font: "Times New Roman" })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-targeting", level: 0 },
          spacing: { after: 150, line: 312 },
          children: [new TextRun({ text: "Chief People Officers: Emphasize strategic organizational benefits including talent retention, employer branding, and competitive differentiation in the talent marketplace. These executives are motivated by how wellness programs support broader organizational objectives.", size: 22, font: "Times New Roman" })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-targeting", level: 0 },
          spacing: { after: 150, line: 312 },
          children: [new TextRun({ text: "Benefits Managers: Address practical concerns including implementation timeline, administrative requirements, reporting capabilities, and vendor support. These professionals evaluate detailed operational aspects and require evidence of reliability and service quality.", size: 22, font: "Times New Roman" })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-targeting", level: 0 },
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "CFOs and Budget Approvers: Demonstrate clear ROI through reduced healthcare costs, decreased absenteeism, and improved productivity metrics. These decision-makers require financial justification and evidence of measurable business impact.", size: 22, font: "Times New Roman" })]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("LinkedIn Targeting Capabilities")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "LinkedIn's targeting capabilities represent the platform's most significant advantage for B2B mental wellness marketing. The platform enables advertisers to target based on comprehensive professional attributes including job title, job function, seniority level, industry, company size, company revenue, skills, and group memberships. For mental wellness apps, the ability to target specific job functions such as Human Resources, Organizational Development, and Employee Benefits ensures your advertising reaches professionals with direct responsibility for wellness program decisions.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "Account-Based Marketing (ABM) targeting on LinkedIn provides additional precision by enabling advertisers to upload lists of target companies and serve ads specifically to employees of those organizations. This capability is particularly valuable for mental wellness apps pursuing enterprise sales, as it allows concentrated advertising efforts on organizations known to be actively evaluating or expanding their employee wellness programs. ABM campaigns can be supplemented with LinkedIn's built-in lookalike audiences, which identify companies similar to your existing customers or target account list.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        // Targeting Options Table
        new Paragraph({
          spacing: { before: 300, after: 200 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Table 2: LinkedIn Targeting Options for Mental Wellness Apps",
              bold: true,
              size: 20,
              font: "Times New Roman"
            })
          ]
        }),
        new Table({
          columnWidths: [3120, 3120, 3120],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          alignment: AlignmentType.CENTER,
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Targeting Category", bold: true, size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Specific Options", bold: true, size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Strategic Application", bold: true, size: 20, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Job Titles", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "HR Director, CPO, Benefits Manager", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Direct decision-maker targeting", size: 20, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Job Functions", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Human Resources, Operations", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Broader functional reach", size: 20, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Company Size", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "501-1000, 1001-5000, 5000+", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Enterprise opportunity sizing", size: 20, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Industries", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Tech, Healthcare, Finance", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "High-stress industry focus", size: 20, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Skills", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Employee Engagement, Wellness", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Interest-based targeting", size: 20, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Account Lists", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Uploaded target company lists", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Account-Based Marketing", size: 20, font: "Times New Roman" })] })] })
              ]
            })
          ]
        }),

        // Section 5: Content Strategies
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun("Content Strategies for CBT Mental Wellness Promotion")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "Developing compelling content for LinkedIn mental wellness advertising requires a strategic balance between educational value, clinical credibility, and commercial persuasion. Enterprise buyers evaluating mental wellness solutions are sophisticated consumers who respond positively to evidence-based content while remaining skeptical of overly promotional messaging. Your content strategy should position your CBT mental wellness app as a trusted partner in organizational wellness rather than simply a vendor seeking sales.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("Educational Thought Leadership")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "Educational content that establishes your organization as a thought leader in workplace mental health creates a foundation of credibility that significantly influences enterprise buying decisions. This content category includes research summaries on CBT effectiveness in workplace settings, analysis of current mental health trends affecting workforce productivity, and expert perspectives on building supportive organizational cultures. By providing genuinely valuable insights without immediate commercial intent, you build trust and recognition that predisposes prospects to consider your solution when they enter active buying cycles.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "For CBT-focused apps, thought leadership content should emphasize the scientific foundation of cognitive behavioral therapy and its proven effectiveness in treating common workplace mental health challenges including anxiety, depression, and stress management. Sharing research data, clinical outcomes, and expert commentary on CBT techniques positions your app as a legitimate clinical tool rather than a casual wellness application. This scientific credibility is particularly important for enterprise buyers who must justify their wellness investments to stakeholders and demonstrate alignment with evidence-based practices.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("Case Studies and Social Proof")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "Case studies representing your most successful enterprise implementations provide powerful social proof that addresses the fundamental question in every B2B buyer's mind: \"Will this work for my organization?\" Effective case studies for mental wellness apps should include specific metrics on employee engagement and utilization rates, documented improvements in employee mental health outcomes, ROI calculations demonstrating business value, and testimonials from HR leaders or benefits managers. The most compelling case studies tell complete stories that readers can envision replicating in their own organizations.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "Video testimonials from satisfied enterprise customers are particularly effective on LinkedIn, as the professional context lends additional credibility to peer recommendations. Consider creating documentary-style case study videos that show your app in use within actual workplace settings, with interviews from both HR administrators and employees who have benefited from the CBT programs. These authentic stories resonate strongly with prospects who are evaluating similar solutions for their organizations and provide concrete evidence of implementation success.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("Problem-Solution Content Framework")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "The problem-solution framework is a proven content approach that resonates strongly with enterprise buyers who are actively researching solutions to specific organizational challenges. This framework begins by acknowledging and validating the mental health challenges facing modern workplaces, then positions your CBT app as a specifically designed solution for those challenges. The key is to frame problems in ways that your app addresses uniquely well, while avoiding overly aggressive sales language that undermines credibility.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "numbered-creative", level: 0 },
          spacing: { after: 150, line: 312 },
          children: [new TextRun({ text: "Acknowledge the Challenge: Begin with statistics or insights about workplace mental health challenges such as rising employee stress levels, the mental health impact of remote work, or the hidden costs of presenteeism. This demonstrates understanding of the prospect's organizational context.", size: 22, font: "Times New Roman" })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-creative", level: 0 },
          spacing: { after: 150, line: 312 },
          children: [new TextRun({ text: "Present the CBT Solution: Introduce cognitive behavioral therapy as an evidence-based approach specifically suited to addressing these challenges. Explain how CBT techniques translate into practical workplace interventions that employees can access through your app.", size: 22, font: "Times New Roman" })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-creative", level: 0 },
          spacing: { after: 150, line: 312 },
          children: [new TextRun({ text: "Demonstrate App Value: Show how your app delivers CBT interventions in an accessible, engaging format. Include screenshots, feature demonstrations, or user journey illustrations that help prospects visualize implementation.", size: 22, font: "Times New Roman" })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-creative", level: 0 },
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "Provide Clear Next Steps: Include specific calls-to-action that make it easy for interested prospects to engage further, such as scheduling a demo, downloading a detailed case study, or starting a pilot program.", size: 22, font: "Times New Roman" })]
        }),

        // Section 6: Budget and Optimization
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun("Budget Allocation and Campaign Optimization")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "LinkedIn advertising typically operates at higher cost-per-click rates than other digital advertising platforms, reflecting the premium value of reaching professional decision-makers in a business context. For B2B mental wellness apps targeting enterprise buyers, these higher costs are often justified by the significant customer lifetime value and concentrated decision-maker audience that LinkedIn provides. Understanding budget allocation strategies and optimization techniques is essential for maximizing return on investment from LinkedIn campaigns.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("Budget Considerations for Mental Wellness Apps")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "LinkedIn recommends minimum daily budgets of $10-20 per campaign, though effective B2B campaigns typically require significantly higher investment to achieve meaningful reach and statistical significance for optimization. For mental wellness apps targeting enterprise buyers, monthly budgets of $5,000-15,000 represent common starting points that allow for adequate audience reach and meaningful data collection. The actual budget required depends on your target audience size, geographic scope, and campaign objectives.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "Budget allocation should follow a funnel-based approach, with awareness campaigns receiving approximately 30-40% of total budget for brand building and market education, consideration campaigns receiving 40-50% for driving engagement and demo requests, and conversion campaigns receiving 20-30% for capturing high-intent leads. This distribution ensures balanced investment across the buyer's journey while concentrating resources on the consideration stage where most enterprise wellness decisions are influenced.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("Optimization Best Practices")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "Continuous optimization is essential for maximizing LinkedIn campaign performance and return on investment. The platform provides robust analytics and optimization tools that enable data-driven campaign refinement. Key optimization areas include audience targeting adjustments based on which segments generate the highest engagement and conversion rates, creative performance analysis to identify which messaging approaches resonate most strongly with different audience segments, and bid strategy optimization to balance cost efficiency with competitive visibility.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "numbered-budget", level: 0 },
          spacing: { after: 150, line: 312 },
          children: [new TextRun({ text: "A/B Testing Framework: Systematically test different ad creatives, headlines, and calls-to-action to identify optimal combinations. Test one variable at a time and allow sufficient sample sizes before drawing conclusions. LinkedIn recommends minimum 100 clicks per variation for statistically meaningful results.", size: 22, font: "Times New Roman" })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-budget", level: 0 },
          spacing: { after: 150, line: 312 },
          children: [new TextRun({ text: "Audience Refinement: Monitor performance by audience segment and reallocate budget toward high-performing segments. LinkedIn's campaign analytics enable detailed analysis by job title, company size, industry, and other targeting dimensions.", size: 22, font: "Times New Roman" })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-budget", level: 0 },
          spacing: { after: 150, line: 312 },
          children: [new TextRun({ text: "Retargeting Implementation: Implement LinkedIn Insight Tag on your website to enable retargeting campaigns that re-engage prospects who have visited your site but not converted. Retargeting typically delivers higher conversion rates at lower costs than prospecting campaigns.", size: 22, font: "Times New Roman" })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-budget", level: 0 },
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "Performance Monitoring Cadence: Review campaign performance weekly for tactical adjustments and monthly for strategic optimization. Avoid making changes too frequently, which prevents the platform's algorithms from optimizing effectively.", size: 22, font: "Times New Roman" })]
        }),

        // Section 7: Implementation Roadmap
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun("Implementation Roadmap")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "Successfully launching and scaling LinkedIn campaigns for your CBT mental wellness app requires a structured implementation approach that builds from foundational setup through continuous optimization. The following roadmap outlines key phases and activities for developing an effective LinkedIn advertising program that generates qualified enterprise leads and builds brand recognition in the corporate wellness market.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("Phase 1: Foundation Setup (Weeks 1-2)")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "The foundation phase focuses on establishing the infrastructure and strategic framework necessary for effective campaign execution. This includes creating or optimizing your LinkedIn Company Page with professional branding, compelling company description, and relevant showcase pages for your mental wellness solutions. Install the LinkedIn Insight Tag on your website to enable conversion tracking and retargeting capabilities. Define your target account list for ABM campaigns and develop initial audience segment definitions based on job titles, functions, industries, and company characteristics.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("Phase 2: Campaign Development (Weeks 3-4)")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "Campaign development involves creating initial advertising assets and configuring campaign settings. Develop a creative asset library including images, videos, and copy variations for different audience segments and campaign objectives. Create your first awareness campaign focused on building recognition among target HR and benefits professionals. Configure lead generation forms with appropriate fields for capturing enterprise demo requests. Establish baseline metrics and KPI targets for measuring campaign success.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("Phase 3: Launch and Learning (Weeks 5-8)")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "The launch phase involves initial campaign deployment and systematic learning. Launch awareness and consideration campaigns with multiple creative variations to enable A/B testing. Monitor performance daily during the first two weeks to identify any technical issues or unexpected performance patterns. Begin collecting data on which audience segments, creative approaches, and messaging themes generate the strongest engagement. Resist the temptation to make frequent changes during this phase, allowing LinkedIn's algorithms time to optimize delivery.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun("Phase 4: Optimization and Scaling (Ongoing)")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "The ongoing optimization phase focuses on systematic performance improvement and campaign expansion. Implement weekly optimization reviews focusing on creative performance, audience segment efficiency, and conversion rate improvements. Launch retargeting campaigns to re-engage website visitors and content consumers. Expand successful campaign approaches to additional audience segments or geographic markets. Develop thought leader ad programs featuring clinical experts from your organization. Build a testing roadmap for continuous creative and targeting innovation.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),

        // Implementation Timeline Table
        new Paragraph({
          spacing: { before: 300, after: 200 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Table 3: Implementation Timeline and Key Milestones",
              bold: true,
              size: 20,
              font: "Times New Roman"
            })
          ]
        }),
        new Table({
          columnWidths: [2340, 3120, 3900],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          alignment: AlignmentType.CENTER,
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Phase", bold: true, size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Timeline", bold: true, size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Key Deliverables", bold: true, size: 20, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Foundation Setup", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Weeks 1-2", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Company page, Insight Tag, Target accounts", size: 20, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Campaign Development", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Weeks 3-4", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Creative assets, Campaign configuration", size: 20, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Launch & Learning", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Weeks 5-8", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Campaigns live, Initial performance data", size: 20, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Optimization", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Week 9+", size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Scaled campaigns, Retargeting, Thought Leader", size: 20, font: "Times New Roman" })] })] })
              ]
            })
          ]
        }),

        // Section 8: Key Takeaways
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun("Key Takeaways and Strategic Recommendations")]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "LinkedIn campaigns represent a powerful marketing channel for promoting CBT mental wellness apps to enterprise buyers, offering unparalleled access to professional decision-makers responsible for employee wellness program decisions. Success on the platform requires a strategic approach that combines precise audience targeting with compelling content that addresses the specific concerns and priorities of HR professionals, benefits managers, and organizational leaders.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        }),
        new Paragraph({
          numbering: { reference: "numbered-implementation", level: 0 },
          spacing: { after: 150, line: 312 },
          children: [new TextRun({ text: "Target the Right Decision-Makers: Focus your LinkedIn campaigns on HR directors, benefits managers, and C-suite executives who have direct influence over employee wellness program decisions. Use LinkedIn's professional targeting capabilities to reach these specific roles within companies of appropriate size and industry.", size: 22, font: "Times New Roman" })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-implementation", level: 0 },
          spacing: { after: 150, line: 312 },
          children: [new TextRun({ text: "Leverage Clinical Credibility: Emphasize the evidence-based foundation of CBT and position your app as a legitimate clinical tool rather than a casual wellness application. Thought leader content from clinical psychologists or mental health experts performs particularly well in building trust.", size: 22, font: "Times New Roman" })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-implementation", level: 0 },
          spacing: { after: 150, line: 312 },
          children: [new TextRun({ text: "Implement Account-Based Marketing: Use LinkedIn's ABM capabilities to concentrate advertising efforts on target companies with known interest in employee wellness programs. Upload lists of target accounts and serve customized messaging to employees of those organizations.", size: 22, font: "Times New Roman" })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-implementation", level: 0 },
          spacing: { after: 150, line: 312 },
          children: [new TextRun({ text: "Diversify Ad Formats: Utilize multiple ad formats including Sponsored Content for awareness, Document Ads for educational content distribution, and Lead Gen Forms for efficient lead capture. Each format serves different stages of the buyer journey.", size: 22, font: "Times New Roman" })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-implementation", level: 0 },
          spacing: { after: 150, line: 312 },
          children: [new TextRun({ text: "Measure and Optimize Continuously: Establish clear KPIs including engagement rates, lead quality, and ultimately enterprise sales attributed to LinkedIn campaigns. Implement systematic A/B testing and audience optimization to continuously improve performance.", size: 22, font: "Times New Roman" })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-implementation", level: 0 },
          spacing: { after: 200, line: 312 },
          children: [new TextRun({ text: "Build Long-Term Brand Presence: LinkedIn success requires sustained investment in brand building and thought leadership, not just direct response campaigns. Balance immediate lead generation with longer-term brand awareness that positions your app as a leader in the corporate mental wellness space.", size: 22, font: "Times New Roman" })]
        }),
        new Paragraph({
          spacing: { after: 200, line: 312 },
          children: [
            new TextRun({
              text: "By implementing these strategies systematically and maintaining a commitment to continuous improvement, your CBT mental wellness app can effectively leverage LinkedIn campaigns to generate qualified enterprise leads, build brand recognition among decision-makers, and ultimately expand your presence in the growing corporate mental wellness market. The platform's unique professional context and targeting capabilities make it an essential component of any B2B mental wellness marketing strategy.",
              size: 22,
              font: "Times New Roman"
            })
          ]
        })
      ]
    }
  ]
});

// Generate document
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/home/z/my-project/download/LinkedIn_Campaigns_Guide_CBT_Mental_Wellness_App.docx', buffer);
  console.log('Document created successfully!');
});
