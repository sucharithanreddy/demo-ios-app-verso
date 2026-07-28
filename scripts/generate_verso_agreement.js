// ============================================================================
// Verso × Developer - Software Purchase, Assignment, Exclusive Licence,
// Revenue Sharing & Technical Services Agreement
//
// Source: PDF (Untitled%20document.pdf.pdf) provides the substantive content -
// the Optimism Engine purchase for ₹40L, deferred via revenue share, exclusive
// license during payment, ongoing technical services.
//
// Structure: docx template (Verso_Developer_Agreement_Revised (3).docx) -
// 12 clauses + Schedule 1, English law, LCIA arbitration, professional format.
// ============================================================================

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, HeadingLevel,
  PageNumber, Header, Footer, PageBreak, LevelFormat,
} = require('docx');
const fs = require('fs');

// ---------------------------------------------------------------------------
// Palette - per contract scene: pure black for ALL text. No colored headings.
// ---------------------------------------------------------------------------
const BLACK = '000000';
const MUTED = '6E6560'; // only for table header backgrounds (decoration)
const TABLE_HEADER_BG = 'F2EEE8';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safeText(value, placeholder) {
  if (value === undefined || value === null || value === '' ||
      String(value) === 'NaN' || String(value) === 'undefined') {
    return placeholder || '[Please fill in]';
  }
  return String(value);
}

const NB = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = {
  top: NB, bottom: NB, left: NB, right: NB,
  insideHorizontal: NB, insideVertical: NB,
};

// Single thin black border for definitions table
const thinBlack = { style: BorderStyle.SINGLE, size: 4, color: BLACK };
const thinBorders = {
  top: thinBlack, bottom: thinBlack, left: thinBlack, right: thinBlack,
  insideHorizontal: thinBlack, insideVertical: thinBlack,
};

// ---------------------------------------------------------------------------
// Paragraph builders
// ---------------------------------------------------------------------------

function title(text) {
  // Er Hao (22pt = size 44), SimHei, centered, black
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { line: Math.ceil(22 * 23), lineRule: 'atLeast', before: 0, after: 120 },
    children: [new TextRun({
      text, size: 44, bold: true, color: BLACK,
      font: { eastAsia: 'SimHei', ascii: 'Times New Roman' },
    })],
  });
}

function subtitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 480 },
    children: [new TextRun({
      text, size: 22, color: BLACK, italics: true,
      font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
    })],
  });
}

function sectionHeading(text) {
  // Heading 1 - Xiao San (15pt = size 30), SimHei, bold, black
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180, line: 360 },
    keepNext: true,
    children: [new TextRun({
      text, size: 30, bold: true, color: BLACK,
      font: { eastAsia: 'SimHei', ascii: 'Times New Roman' },
    })],
  });
}

function subHeading(text) {
  return new Paragraph({
    spacing: { before: 240, after: 120, line: 360 },
    keepNext: true,
    children: [new TextRun({
      text, size: 24, bold: true, color: BLACK,
      font: { eastAsia: 'SimHei', ascii: 'Times New Roman' },
    })],
  });
}

function body(text, opts = {}) {
  // Justified, first-line indent 480 twips, line spacing 1.5x = 360
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: opts.noIndent ? 0 : 480 },
    spacing: { line: 360, after: opts.after ?? 120 },
    children: [new TextRun({
      text, size: 24, color: BLACK,
      font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
    })],
  });
}

// Body with mixed bold runs - for clauses with key terms in bold
function bodyRich(runs, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: opts.noIndent ? 0 : 480 },
    spacing: { line: 360, after: opts.after ?? 120 },
    children: runs.map(r => {
      if (typeof r === 'string') {
        return new TextRun({
          text: r, size: 24, color: BLACK,
          font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
        });
      }
      return new TextRun({
        text: r.text, size: 24, color: BLACK, bold: !!r.bold, italics: !!r.italics,
        font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
      });
    }),
  });
}

// Sub-clause with hanging indent (e.g., "3.1  text text text...")
function clause(num, text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: 480, hanging: 480 },
    spacing: { line: 360, after: opts.after ?? 120 },
    children: [
      new TextRun({
        text: `${num}\t`, size: 24, bold: opts.numBold ?? false, color: BLACK,
        font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
      }),
      new TextRun({
        text, size: 24, color: BLACK,
        font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
      }),
    ],
  });
}

// Sub-clause with mixed runs
function clauseRich(num, runs, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: 480, hanging: 480 },
    spacing: { line: 360, after: opts.after ?? 120 },
    children: [
      new TextRun({
        text: `${num}\t`, size: 24, color: BLACK,
        font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
      }),
      ...runs.map(r => {
        if (typeof r === 'string') {
          return new TextRun({
            text: r, size: 24, color: BLACK,
            font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
          });
        }
        return new TextRun({
          text: r.text, size: 24, color: BLACK, bold: !!r.bold, italics: !!r.italics,
          font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
        });
      }),
    ],
  });
}

// Sub-sub clause (a) (b) (c) - lettered list inside a clause
function letteredClause(letter, text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: 960, hanging: 360 },
    spacing: { line: 360, after: opts.after ?? 80 },
    children: [
      new TextRun({
        text: `(${letter})\t`, size: 24, color: BLACK,
        font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
      }),
      new TextRun({
        text, size: 24, color: BLACK,
        font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
      }),
    ],
  });
}

// Bulleted clause (uses a dash character)
function bulletClause(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: 960, hanging: 360 },
    spacing: { line: 360, after: opts.after ?? 80 },
    children: [
      new TextRun({
        text: '\u2013\t', size: 24, color: BLACK,
        font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
      }),
      new TextRun({
        text, size: 24, color: BLACK,
        font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
      }),
    ],
  });
}

function blankLine() {
  return new Paragraph({ spacing: { line: 360, after: 0 }, children: [new TextRun({ text: '' })] });
}

// Definitions table (2 columns: Term | Definition)
function definitionsTable(rows) {
  const headerCellShading = { fill: TABLE_HEADER_BG, type: ShadingType.CLEAR, color: 'auto' };

  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: [
      new TableCell({
        width: { size: 25, type: WidthType.PERCENTAGE },
        shading: headerCellShading,
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        children: [new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { line: 360 },
          children: [new TextRun({
            text: 'Term', size: 24, bold: true, color: BLACK,
            font: { eastAsia: 'SimHei', ascii: 'Times New Roman' },
          })],
        })],
      }),
      new TableCell({
        width: { size: 75, type: WidthType.PERCENTAGE },
        shading: headerCellShading,
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        children: [new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { line: 360 },
          children: [new TextRun({
            text: 'Definition', size: 24, bold: true, color: BLACK,
            font: { eastAsia: 'SimHei', ascii: 'Times New Roman' },
          })],
        })],
      }),
    ],
  });

  const dataRows = rows.map(([term, def]) => new TableRow({
    cantSplit: true,
    children: [
      new TableCell({
        width: { size: 25, type: WidthType.PERCENTAGE },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        children: [new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { line: 360 },
          children: [new TextRun({
            text: term, size: 24, bold: true, color: BLACK,
            font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
          })],
        })],
      }),
      new TableCell({
        width: { size: 75, type: WidthType.PERCENTAGE },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        children: [new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { line: 360 },
          children: [new TextRun({
            text: def, size: 24, color: BLACK,
            font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
          })],
        })],
      }),
    ],
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: thinBorders,
    rows: [headerRow, ...dataRows],
  });
}

// Compensation table (compact 2-col)
function compTable(rows) {
  const dataRows = rows.map(([label, value], i) => new TableRow({
    cantSplit: true,
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        shading: i % 2 === 0 ? { fill: TABLE_HEADER_BG, type: ShadingType.CLEAR, color: 'auto' } : undefined,
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        children: [new Paragraph({
          spacing: { line: 360 },
          children: [new TextRun({
            text: label, size: 24, bold: true, color: BLACK,
            font: { eastAsia: 'SimHei', ascii: 'Times New Roman' },
          })],
        })],
      }),
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        shading: i % 2 === 0 ? { fill: TABLE_HEADER_BG, type: ShadingType.CLEAR, color: 'auto' } : undefined,
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        children: [new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { line: 360 },
          children: [new TextRun({
            text: value, size: 24, color: BLACK,
            font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
          })],
        })],
      }),
    ],
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: thinBorders,
    rows: dataRows,
  });
}

// Schedule 1 - Software modules table
function scheduleTable(rows) {
  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: ['#', 'Module', 'Description'].map((h, i) => new TableCell({
      width: { size: [8, 30, 62][i], type: WidthType.PERCENTAGE },
      shading: { fill: TABLE_HEADER_BG, type: ShadingType.CLEAR, color: 'auto' },
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      children: [new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { line: 360 },
        children: [new TextRun({
          text: h, size: 24, bold: true, color: BLACK,
          font: { eastAsia: 'SimHei', ascii: 'Times New Roman' },
        })],
      })],
    })),
  });

  const dataRows = rows.map(([num, module, desc]) => new TableRow({
    cantSplit: true,
    children: [
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        children: [new Paragraph({
          spacing: { line: 360 },
          children: [new TextRun({
            text: num, size: 24, color: BLACK,
            font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
          })],
        })],
      }),
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        children: [new Paragraph({
          spacing: { line: 360 },
          children: [new TextRun({
            text: module, size: 24, bold: true, color: BLACK,
            font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
          })],
        })],
      }),
      new TableCell({
        width: { size: 62, type: WidthType.PERCENTAGE },
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        children: [new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { line: 360 },
          children: [new TextRun({
            text: desc, size: 24, color: BLACK,
            font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
          })],
        })],
      }),
    ],
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: thinBorders,
    rows: [headerRow, ...dataRows],
  });
}

// Signature block (2-col borderless table)
function signatureBlock() {
  const labels = [
    'Full Name',
    'Title / Trading As',
    'Signature',
    'Date',
  ];

  const partyAValues = [
    '[Enrico - Full Legal Name]',
    'Co-Founder, Verso',
    '_______________________',
    '_______________________',
  ];
  const partyBValues = [
    '[Developer Full Legal Name]',
    '[Company / Trading Name, if any]',
    '_______________________',
    '_______________________',
  ];

  const rows = labels.map((label, i) => new TableRow({
    cantSplit: true,
    children: [
      new TableCell({
        width: { size: 50, type: WidthType.PERCENTAGE },
        borders: { top: NB, bottom: NB, left: NB, right: NB },
        margins: { top: 160, bottom: 160, left: 0, right: 120 },
        children: [new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: `${label}: `, size: 24, color: BLACK,
              font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
            }),
            new TextRun({
              text: partyAValues[i], size: 24, color: BLACK,
              font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
            }),
          ],
        })],
      }),
      new TableCell({
        width: { size: 50, type: WidthType.PERCENTAGE },
        borders: { top: NB, bottom: NB, left: NB, right: NB },
        margins: { top: 160, bottom: 160, left: 120, right: 0 },
        children: [new Paragraph({
          spacing: { line: 360 },
          children: [
            new TextRun({
              text: `${label}: `, size: 24, color: BLACK,
              font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
            }),
            new TextRun({
              text: partyBValues[i], size: 24, color: BLACK,
              font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
            }),
          ],
        })],
      }),
    ],
  }));

  // Header row (party labels)
  const headerRow = new TableRow({
    cantSplit: true,
    children: [
      new TableCell({
        width: { size: 50, type: WidthType.PERCENTAGE },
        borders: { top: NB, bottom: NB, left: NB, right: NB },
        margins: { top: 80, bottom: 80, left: 0, right: 120 },
        children: [new Paragraph({
          spacing: { line: 360 },
          children: [new TextRun({
            text: 'FOR AND ON BEHALF OF VERSO', size: 24, bold: true, color: BLACK,
            font: { eastAsia: 'SimHei', ascii: 'Times New Roman' },
          })],
        })],
      }),
      new TableCell({
        width: { size: 50, type: WidthType.PERCENTAGE },
        borders: { top: NB, bottom: NB, left: NB, right: NB },
        margins: { top: 80, bottom: 80, left: 120, right: 0 },
        children: [new Paragraph({
          spacing: { line: 360 },
          children: [new TextRun({
            text: 'THE DEVELOPER', size: 24, bold: true, color: BLACK,
            font: { eastAsia: 'SimHei', ascii: 'Times New Roman' },
          })],
        })],
      }),
    ],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [headerRow, ...rows],
  });
}

// ---------------------------------------------------------------------------
// Document content
// ---------------------------------------------------------------------------

const children = [];

// ============================================================================
// TITLE PAGE
// ============================================================================

children.push(title('SOFTWARE PURCHASE, ASSIGNMENT, EXCLUSIVE LICENCE,'));
children.push(title('REVENUE SHARING AND TECHNICAL SERVICES AGREEMENT'));
children.push(subtitle('Verso × [Developer Name]'));

// Parties & Details
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 240, after: 360, line: 360 },
  children: [new TextRun({
    text: 'PARTIES & DETAILS', size: 26, bold: true, color: BLACK,
    font: { eastAsia: 'SimHei', ascii: 'Times New Roman' },
  })],
}));

// Party info as borderless 2-col table
const partyInfoTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: noBorders,
  rows: [
    new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: { top: NB, bottom: NB, left: NB, right: NB },
          margins: { top: 80, bottom: 80, left: 0, right: 120 },
          children: [
            new Paragraph({ spacing: { line: 360, after: 80 }, children: [
              new TextRun({ text: 'PURCHASER (CLIENT):', size: 24, bold: true, color: BLACK,
                font: { eastAsia: 'SimHei', ascii: 'Times New Roman' } }),
            ]}),
            new Paragraph({ spacing: { line: 360, after: 80 }, children: [
              new TextRun({ text: 'Verso, a company incorporated under the laws of England and Wales', size: 24, color: BLACK,
                font: { eastAsia: 'SimSun', ascii: 'Times New Roman' } }),
            ]}),
            new Paragraph({ spacing: { line: 360, after: 80 }, children: [
              new TextRun({ text: 'Co-Founder: Mr. Enrico [Full Legal Name]', size: 24, color: BLACK,
                font: { eastAsia: 'SimSun', ascii: 'Times New Roman' } }),
            ]}),
            new Paragraph({ spacing: { line: 360, after: 80 }, children: [
              new TextRun({ text: 'Email: rico@versonow.com', size: 24, color: BLACK,
                font: { eastAsia: 'SimSun', ascii: 'Times New Roman' } }),
            ]}),
            new Paragraph({ spacing: { line: 360, after: 80 }, children: [
              new TextRun({ text: 'Website: versonow.com', size: 24, color: BLACK,
                font: { eastAsia: 'SimSun', ascii: 'Times New Roman' } }),
            ]}),
            new Paragraph({ spacing: { line: 360, after: 80 }, children: [
              new TextRun({ text: 'Registered Office: [UK Address]', size: 24, color: BLACK,
                font: { eastAsia: 'SimSun', ascii: 'Times New Roman' } }),
            ]}),
          ],
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: { top: NB, bottom: NB, left: NB, right: NB },
          margins: { top: 80, bottom: 80, left: 120, right: 0 },
          children: [
            new Paragraph({ spacing: { line: 360, after: 80 }, children: [
              new TextRun({ text: 'DEVELOPER:', size: 24, bold: true, color: BLACK,
                font: { eastAsia: 'SimHei', ascii: 'Times New Roman' } }),
            ]}),
            new Paragraph({ spacing: { line: 360, after: 80 }, children: [
              new TextRun({ text: '[Developer Full Legal Name]', size: 24, color: BLACK,
                font: { eastAsia: 'SimSun', ascii: 'Times New Roman' } }),
            ]}),
            new Paragraph({ spacing: { line: 360, after: 80 }, children: [
              new TextRun({ text: 'An Indian citizen, Software Developer', size: 24, color: BLACK,
                font: { eastAsia: 'SimSun', ascii: 'Times New Roman' } }),
            ]}),
            new Paragraph({ spacing: { line: 360, after: 80 }, children: [
              new TextRun({ text: 'Company / Trading Name (if any): [Insert]', size: 24, color: BLACK,
                font: { eastAsia: 'SimSun', ascii: 'Times New Roman' } }),
            ]}),
            new Paragraph({ spacing: { line: 360, after: 80 }, children: [
              new TextRun({ text: 'Email: [Developer Email]', size: 24, color: BLACK,
                font: { eastAsia: 'SimSun', ascii: 'Times New Roman' } }),
            ]}),
            new Paragraph({ spacing: { line: 360, after: 80 }, children: [
              new TextRun({ text: 'Resident Address: [India Address]', size: 24, color: BLACK,
                font: { eastAsia: 'SimSun', ascii: 'Times New Roman' } }),
            ]}),
          ],
        }),
      ],
    }),
  ],
});
children.push(partyInfoTable);

children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 360, after: 240, line: 360 },
  children: [
    new TextRun({ text: 'Effective Date: ', size: 24, bold: true, color: BLACK,
      font: { eastAsia: 'SimSun', ascii: 'Times New Roman' } }),
    new TextRun({ text: '[INSERT DATE]', size: 24, color: BLACK,
      font: { eastAsia: 'SimSun', ascii: 'Times New Roman' } }),
  ],
}));

children.push(body(
  'This Agreement is entered into by the Parties named above and governs the purchase, assignment, exclusive licensing, revenue sharing, and ongoing technical services relating to the proprietary Artificial Intelligence software platform known as THE OPTIMISM ENGINE. The Purchaser and the Developer are hereinafter individually referred to as a "Party" and collectively as the "Parties".',
  { noIndent: false, after: 240 }
));

// ============================================================================
// 1. BACKGROUND AND PURPOSE (Recitals)
// ============================================================================

children.push(sectionHeading('1.  Background and Purpose'));

children.push(body(
  '1.1  The Developer is an experienced software developer possessing specialised expertise in artificial intelligence, software architecture, machine learning, application development, and digital mental wellbeing technologies.',
  { noIndent: true }
));

children.push(body(
  '1.2  Prior to the execution of this Agreement, the Developer independently conceived, designed, developed, and exclusively owns a proprietary Artificial Intelligence software platform known as "THE OPTIMISM ENGINE" (hereinafter referred to as the "Software"), together with its complete source code, object code, software architecture, algorithms, databases, APIs, user interface, documentation, workflows, prompts, training logic, technical know-how, and all associated Intellectual Property Rights.',
  { noIndent: true }
));

children.push(body(
  '1.3  The Software is a proprietary Artificial Intelligence-powered emotional wellbeing platform specifically designed to assist users in recognising, understanding, and positively reframing negative thoughts, emotions, and inner dialogue through intelligent conversational interactions and behavioural guidance.',
  { noIndent: true }
));

children.push(body(
  '1.4  The Software was independently developed by the Developer at her own cost, effort, and expertise and does not constitute software commissioned, financed, or developed on behalf of the Purchaser. The Parties expressly acknowledge that the Software, together with all present and future enhancements, constitutes the independent intellectual creation and proprietary technology of the Developer and was conceived, designed, and substantially developed entirely by the Developer prior to the execution of this Agreement without any contribution, funding, or ownership claim from the Purchaser.',
  { noIndent: true }
));

children.push(body(
  '1.5  Having evaluated the Software and its commercial potential, the Purchaser expressed its intention to acquire the Software together with all associated Intellectual Property Rights for commercial exploitation through Verso, a sales wellbeing business operating a proprietary diagnostic framework known as the Sales Wellbeing Map.',
  { noIndent: true }
));

children.push(body(
  '1.6  The Developer offered to transfer ownership of the Software for a total purchase consideration to be agreed in writing between the Parties (the "Purchase Consideration"). The Purchaser represented that, instead of paying the purchase consideration upfront, it desired to first launch and commercially exploit the Software, assess its market acceptance, and generate revenue therefrom before discharging the agreed purchase consideration.',
  { noIndent: true }
));

children.push(body(
  '1.7  Upon the Purchaser\u2019s request, the Developer agreed to defer receipt of the Purchase Consideration subject to the Purchaser paying the Developer the agreed Revenue Share from commercialisation of the Software in accordance with this Agreement, and to provide ongoing technical support, software maintenance, AI optimisation, feature enhancements, bug fixes, security updates, and future software development services upon the terms set out herein. The Developer\u2019s agreement to defer the Purchase Consideration is expressly contingent upon the Purchaser complying with the Sunset Date under Clause 9.5.',
  { noIndent: true }
));

children.push(body(
  '1.8  This Agreement sets out the complete terms on which the Developer shall sell, license, and support the Software, and on which the Purchaser shall pay the purchase consideration through deferred revenue share payments and acquire full ownership upon completion.',
  { noIndent: true }
));

// ============================================================================
// 2. DEFINITIONS
// ============================================================================

children.push(sectionHeading('2.  Definitions'));

children.push(body(
  'In this Agreement, the following terms have the meanings set out below:',
  { noIndent: true, after: 240 }
));

children.push(definitionsTable([
  ['Agreement', 'This Software Purchase, Assignment, Exclusive Licence, Revenue Sharing and Technical Services Agreement, including all Schedules attached hereto and any amendments made in writing pursuant to Clause 14.'],
  ['Software', 'The proprietary Artificial Intelligence platform known as "THE OPTIMISM ENGINE", including without limitation all source code, object code, AI models, prompts, prompt libraries, algorithms, workflows, APIs, databases, architecture, software framework, user interface, dashboards, mood tracking systems, gratitude journal module, grounding exercise module, emotional wellbeing tools, analytics engine, progress tracking engine, documentation, technical know-how, future updates, enhancements, derivative works, and every other component forming part of or connected with THE OPTIMISM ENGINE, together with all Intellectual Property Rights subsisting therein.'],
  ['Purchase Consideration', 'The total sum of INR Rs. [INSERT AMOUNT] (the "Purchase Consideration") payable by the Purchaser to the Developer for acquisition of the Software, to be discharged through Revenue Share payments and any top-up payments in accordance with Clause 6.'],
  ['Revenue Share', '[INSERT PERCENT]% of Gross Revenue payable by the Purchaser to the Developer under Clause 6 of this Agreement, applied towards discharge of the Purchase Consideration until paid in full.'],
  ['Gross Revenue', 'All monies, subscription fees, licence fees, service fees, usage charges, implementation fees, and every other amount received by the Purchaser directly or indirectly from commercialisation of the Software, without deduction of operational expenses, marketing costs, or third-party commissions. Net of VAT/GST, payment processing fees, and mandatory refunds actually issued.'],
  ['Commercial Launch', 'The date from which the Purchaser commercially deploys, licenses, sells, markets, subscribes, or otherwise exploits the Software for monetary consideration, whether directly through Verso or through any subsidiary, affiliate, or sub-licensee.'],
  ['Sunset Date', 'The date falling six (6) months after the Effective Date, by which the full Purchase Consideration must be paid in full. If the Purchase Consideration is not paid in full by the Sunset Date, the Developer may terminate the exclusive licence and retain all rights in the Software in accordance with Clause 9.5.'],
  ['Intellectual Property Rights', 'All patents, copyrights, database rights, design rights, trade marks, trade secrets, know-how, source code rights, and every other proprietary right recognised under applicable law, whether registered or unregistered, anywhere in the world.'],
  ['Foreground IP', 'All Intellectual Property Rights created, developed, or arising directly or indirectly from the Technical Services performed under this Agreement after the Effective Date, including enhancements, updates, bug fixes, and new modules delivered by the Developer. Foreground IP vests in the Purchaser only upon acceptance and payment in accordance with Clause 5.4.'],
  ['Background IP', 'The Software and all Intellectual Property Rights subsisting therein as of the Effective Date, being the proprietary intellectual creation of the Developer developed independently and prior to this Agreement.'],
  ['Technical Services', 'The ongoing technical assistance, software maintenance, AI optimisation, feature enhancements, bug fixes, security updates, additional module development, and consultancy services to be provided by the Developer pursuant to Clause 7.'],
  ['Milestone', 'A defined deliverable, phase of work, or service level set out in Schedule 1 or agreed in writing between the Parties from time to time.'],
  ['Late Payment Interest', 'Interest accruing daily at the rate of one and one-half percent (1.5%) per month (or the maximum rate permitted by applicable law, whichever is lower) on any payment not received within fifteen (15) days of its due date, as provided in Clause 6.8.'],
]));

// ============================================================================
// 3. SALE OF SOFTWARE
// ============================================================================

children.push(sectionHeading('3.  Sale of Software'));

children.push(subHeading('Key Principle: Deferred Purchase with Revocable Licence and Sunset Date'));

children.push(body(
  'The Developer agrees to sell and the Purchaser agrees to purchase the Software for a total consideration of INR Rs. [INSERT AMOUNT] (the "Purchase Consideration"). Pending payment of the full Purchase Consideration, the Developer grants the Purchaser a revocable, non-exclusive licence to commercially exploit the Software, subject to timely payment of Revenue Share. The full Purchase Consideration must be paid within six (6) months of the Effective Date (the Sunset Date), failing which the Developer may terminate the licence and retain all rights. Upon payment in full, ownership of the Software and all associated Intellectual Property Rights shall assign to the Purchaser.',
  { noIndent: true }
));

children.push(clause('3.1',
  'Subject to the terms of this Agreement, the Developer agrees to sell and the Purchaser agrees to purchase the Software for a total consideration of INR Rs. [INSERT AMOUNT] (the "Purchase Consideration"), such amount to be agreed in writing between the Parties prior to execution.'
));

children.push(clause('3.2',
  'The Parties acknowledge that the Purchaser has requested deferred payment of the Purchase Consideration owing to its intention to first commercialise the Software and generate business revenue therefrom before discharging the agreed consideration.'
));

children.push(clause('3.3',
  'The Developer has accepted such request solely on the condition that the Purchaser strictly complies with the Revenue Share and payment obligations contained in Clause 6 of this Agreement.'
));

children.push(clause('3.4',
  'Nothing contained in this Agreement shall be construed as a waiver by the Developer of her right to receive the full Purchase Consideration. The Developer retains the right to demand immediate payment of any outstanding balance in the event of material breach by the Purchaser, subject to the remedies in Clause 9.'
));

// ============================================================================
// 4. LIMITED EXCLUSIVE LICENCE
// ============================================================================

children.push(sectionHeading('4.  Limited Exclusive Licence'));

children.push(clause('4.1',
  'Pending payment of the entire Purchase Consideration, the Developer hereby grants the Purchaser a revocable, non-transferable, and non-assignable licence to use the Software solely for the purpose of commercial exploitation through Verso and its authorised channels. The licence is expressly conditional upon the Purchaser\u2019s timely compliance with all payment obligations under Clause 6 and shall suspend or terminate in accordance with Clauses 4.6, 9.3, and 9.5.'
));

children.push(clause('4.2',
  'During the subsistence of this Agreement, the Purchaser shall not assign, sell, sub-license, mortgage, pledge, transfer, or otherwise create any third-party rights over the Software without the prior written consent of the Developer, such consent not to be unreasonably withheld.'
));

children.push(clause('4.3',
  'The licence granted under this Clause 4 shall automatically terminate upon termination of this Agreement due to payment default or any material breach by the Purchaser, whereupon the Purchaser shall cease all commercial exploitation of the Software and return or permanently delete all copies in its possession.'
));

children.push(clause('4.4',
  'Ownership of the Software and all Intellectual Property Rights shall continue to vest exclusively in the Developer until the entire Purchase Consideration has been paid in full, unless otherwise expressly agreed in writing by the Parties.'
));

children.push(clause('4.5',
  'Upon payment of the entire Purchase Consideration, the Developer shall, at the Purchaser\u2019s request and cost, execute all documents and do all things reasonably necessary to assign the Software and all associated Intellectual Property Rights to the Purchaser, subject to any continuing maintenance, royalty, or service obligations expressly agreed between the Parties under Clause 7.'
));

children.push(clause('4.6',
  'Automatic Suspension on Payment Default. In the event that the Purchaser fails to make any payment due under Clause 6 (including the Revenue Share or any top-up payment) within fifteen (15) days of its due date, the exclusive licence granted under Clause 4.1 shall automatically suspend, and the Purchaser shall immediately cease all commercial exploitation of the Software until all outstanding amounts (together with any Late Payment Interest accrued under Clause 6.8) are paid in full. The Developer shall also be entitled, but not obligated, to disable the Software through technical means as expressly permitted under Clause 10.3. The licence shall automatically reinstate upon receipt of all cleared funds, provided that three or more suspensions in any twelve-month period shall entitle the Developer to terminate this Agreement and the licence under Clause 9.3.'
));

// ============================================================================
// 5. INTELLECTUAL PROPERTY - OWNERSHIP AND ASSIGNMENT
// ============================================================================

children.push(sectionHeading('5.  Intellectual Property - Ownership and Assignment'));

children.push(subHeading('Key Principle: Conditional Assignment upon Full Payment'));

children.push(body(
  'The Software (Background IP) remains the sole and exclusive property of the Developer until the entire Purchase Consideration is paid in full (and no later than the Sunset Date). The licence granted to the Purchaser pending full payment is revocable and non-exclusive, and may be suspended or terminated upon payment default or failure to pay by the Sunset Date. Upon full payment, all rights in the Software assign to the Purchaser. All Foreground IP created by the Developer during the Technical Services vests in the Purchaser only upon acceptance and payment for the relevant Milestone, as set out in Clause 5.4.',
  { noIndent: true }
));

children.push(clause('5.1',
  'The Developer hereby irrevocably assigns to the Purchaser, with full title guarantee, all of the Developer\u2019s right, title, and interest in the Software and all associated Intellectual Property Rights, such assignment to take effect automatically upon receipt by the Developer of the full Purchase Consideration in cleared funds.'
));

children.push(clause('5.2',
  'Conditional Licence Pending Full Payment. Pending full payment of the Purchase Consideration, the Developer grants the Purchaser a revocable, non-exclusive licence to use the Software solely for the purpose of commercial exploitation through Verso and its authorised channels. This licence is expressly conditional upon the Purchaser\u2019s timely compliance with all payment obligations under Clause 6, including payment of the Revenue Share. The licence shall automatically terminate upon: (a) any payment default continuing uncured for fifteen (15) days, in accordance with Clause 4.6; (b) failure to pay the full Purchase Consideration by the Sunset Date, in accordance with Clause 9.5; or (c) termination of this Agreement for any reason where the Purchaser has not acquired full ownership. The Developer expressly reserves all rights not granted herein, and no irrevocable or royalty-free licence is granted under any circumstances prior to full payment of the Purchase Consideration.'
));

children.push(clause('5.3',
  'The Developer waives all moral rights in the Software and in all Foreground IP created under this Agreement to the fullest extent permitted by applicable law, save that the Developer retains the right to be identified as the author of the Software in academic, portfolio, and professional contexts where such identification would not disclose Verso\u2019s confidential information or business strategy.'
));

children.push(clause('5.4',
  'Conditional Vesting of Foreground IP. All Foreground IP created by the Developer in the course of providing Technical Services under Clause 7 shall vest in the Purchaser only upon the cumulative satisfaction of both of the following conditions: (a) acceptance of the deliverable containing such Foreground IP by the Purchaser pursuant to the procedure in Clause 7.5; AND (b) payment in full of all fees, Revenue Share, and other amounts due to the Developer for the Milestone or service period to which such Foreground IP relates. Until both conditions are met, Foreground IP remains the sole and exclusive property of the Developer, and the Purchaser shall not use, copy, modify, or commercialise such Foreground IP without the Developer\u2019s prior written consent. Upon satisfaction of both conditions, Foreground IP shall vest in the Purchaser absolutely and free from all encumbrances.'
));

children.push(clause('5.5',
  'The Developer shall promptly execute any further documents or do anything reasonably necessary to perfect or confirm the Purchaser\u2019s ownership of the Software (upon full payment) or of any Foreground IP (upon creation) at the Purchaser\u2019s request and cost.'
));

children.push(clause('5.6',
  'The Developer represents and warrants that: (a) the Software is original and does not infringe any third-party Intellectual Property Rights; (b) no third-party licences, open-source code, or encumbrances are embedded in the Software without prior written disclosure to and approval by the Purchaser; (c) the Developer has full right and authority to enter into this Agreement and to make the assignments and grants herein; and (d) the Developer is the sole and exclusive owner of the Software and there are no outstanding claims, licences, or competing rights in respect thereof.'
));

// ============================================================================
// 6. PURCHASE CONSIDERATION AND REVENUE SHARE
// ============================================================================

children.push(sectionHeading('6.  Purchase Consideration and Revenue Share'));

children.push(clause('6.1',
  'The total Purchase Consideration payable by the Purchaser to the Developer for acquisition of the Software shall be INR Rs. [INSERT AMOUNT] (the "Purchase Consideration"), such amount to be agreed in writing between the Parties prior to execution of this Agreement.'
));

children.push(subHeading('6.2  Revenue Share (Primary Mechanism)'));

children.push(body(
  'In consideration of the Developer agreeing to defer immediate payment of the Purchase Consideration, the Purchaser shall pay the Developer a Revenue Share calculated as follows:',
  { noIndent: true, after: 180 }
));

children.push(compTable([
  ['Revenue Share Rate', '[INSERT PERCENT]% of Gross Revenue received by the Purchaser directly attributable to the Software, including all subscriptions, licence fees, and usage charges'],
  ['Payment Frequency', 'Monthly in arrears, on or before the 7th day of every succeeding calendar month, together with a detailed statement of accounts'],
  ['Currency', 'INR (or USD equivalent at the Reserve Bank of India reference rate on the last business day of the reporting month)'],
  ['Commencement', 'Revenue Share shall become payable immediately upon Commercial Launch of the Software'],
  ['Application', 'Every Revenue Share payment shall be adjusted towards discharge of the Purchase Consideration until the full Purchase Consideration has been paid'],
  ['Sunset Date', 'The full Purchase Consideration must be paid within six (6) months of the Effective Date. If not paid in full by the Sunset Date, the Developer may terminate the exclusive licence and retain all rights in the Software per Clause 9.5.'],
  ['Post-Payment Royalty', 'After the Purchase Consideration is paid in full, the Revenue Share shall cease and the Purchaser shall own the Software outright, subject to ongoing Technical Services fees under Clause 7'],
]));

children.push(clause('6.3',
  '"Gross Revenue" means all monies received by the Purchaser from commercialisation of the Software, less VAT/GST, payment processing fees, and any mandatory refunds actually issued. The Purchaser shall not deduct operational expenses, marketing costs, salaries, or third-party commissions from Gross Revenue.'
));

children.push(clause('6.4',
  'The Purchaser shall provide the Developer with a monthly revenue statement setting out the calculation of amounts due, including gross receipts, applicable deductions, Revenue Share calculation, and cumulative balance of Purchase Consideration outstanding. The Developer shall have the right, on reasonable prior written notice and not more than once per calendar quarter, to audit the Purchaser\u2019s relevant books and records relating to the Software\u2019s commercialisation. If an audit reveals a discrepancy of more than five percent (5%) in favour of the Developer, the Purchaser shall bear the full cost of the audit in addition to paying any shortfall within seven (7) days of the audit report. If the discrepancy is five percent (5%) or less, the Developer shall bear the audit cost.'
));

children.push(clause('6.5',
  'All payments are subject to applicable Indian and UK withholding taxes. Each Party is responsible for their own tax obligations in their respective jurisdiction. The Developer shall provide the Purchaser with any tax documentation (including a completed W-8BEN-E, PAN card, or equivalent form) reasonably required to facilitate payment and minimise withholding.'
));

children.push(subHeading('6.6  Top-Up Payment Option'));

children.push(clause('6.6',
  'Top-Up Payment Option. At any time after Commercial Launch, the Purchaser may, at its sole discretion, pay the outstanding balance of the Purchase Consideration in a single lump-sum payment to accelerate acquisition of full ownership. The Purchaser shall provide the Developer with not less than thirty (30) days\u2019 prior written notice of its intention to exercise this option, to enable the Developer to plan accordingly. Upon receipt of such payment, the Developer shall execute all assignment documents contemplated by Clause 5.1 and the Revenue Share obligation under Clause 6.2 shall cease.'
));

children.push(subHeading('6.7  No Other Upfront Fee'));

children.push(clause('6.7',
  'The Revenue Share under Clause 6.2 constitutes the Developer\u2019s primary compensation until the Purchase Consideration is discharged in full. No other upfront or milestone-based fees are payable under this Agreement except as expressly set out herein or as may be agreed in writing as an additional Schedule.'
));

children.push(subHeading('6.8  Late Payment Interest'));

children.push(clause('6.8',
  'Late Payment Interest. Any amount not paid by the Purchaser within fifteen (15) days of its due date (including the Revenue Share or any top-up payment) shall accrue interest at the rate of one and one-half percent (1.5%) per month, or the maximum rate permitted by applicable law, whichever is lower, calculated daily from the due date until the date of actual payment. Such interest is in addition to, and does not limit, the Developer\u2019s other rights and remedies under this Agreement, including the right to suspend the licence under Clause 4.6 and the right to disable the Software under Clause 10.3.'
));

// ============================================================================
// 7. TECHNICAL SERVICES
// ============================================================================

children.push(sectionHeading('7.  Technical Services'));

children.push(clause('7.1',
  'The Developer agrees to provide ongoing Technical Services to the Purchaser after the Effective Date to ensure the Software remains functional, secure, and competitive. The scope of Technical Services includes: (a) software maintenance and bug fixes; (b) AI model optimisation and prompt library updates; (c) feature enhancements and new module development as mutually agreed; (d) security updates and vulnerability remediation; (e) database management and performance tuning; (f) integration support with Verso\u2019s existing systems; and (g) technical consultancy and knowledge transfer.'
));

children.push(clause('7.2',
  'The Developer shall perform the Technical Services with reasonable skill, care, and diligence, adhering to industry best practices and maintaining clear version control with access to all repositories provided to the Purchaser upon request.'
));

children.push(clause('7.3',
  'The Developer shall not subcontract or delegate any part of the Technical Services without the prior written consent of the Purchaser, such consent not to be unreasonably withheld. The Developer remains personally liable for any work performed by approved subcontractors.'
));

children.push(clause('7.4',
  'The Purchaser shall provide timely feedback, access to relevant materials, and reasonable co-operation to enable the Developer to perform the Technical Services, including access to production environments, user feedback, and analytics data relevant to the Software\u2019s performance.'
));

children.push(subHeading('7.5  Acceptance Testing'));

children.push(letteredClause('a',
  'Upon delivery of each Milestone or enhancement by the Developer, the Purchaser shall have a period of fourteen (14) calendar days (the "Review Period") to test and evaluate the deliverable to ensure it conforms to the agreed specifications.'
));

children.push(letteredClause('b',
  'If the deliverable meets the agreed specifications, the Purchaser shall provide a written notice of acceptance to the Developer.'
));

children.push(letteredClause('c',
  'If the deliverable fails to conform to the agreed specifications, the Purchaser shall provide the Developer with a detailed written statement identifying the specific non-conformities (a "Defect Notice") prior to the expiry of the Review Period.'
));

children.push(letteredClause('d',
  'Upon receipt of a Defect Notice, the Developer shall, at no additional cost to the Purchaser, rectify the specified non-conformities within ten (10) business days (or another timeline agreed in writing) and resubmit the corrected deliverable for testing, whereupon the procedure in this Clause 7.5 shall repeat.'
));

children.push(letteredClause('e',
  'If the Purchaser fails to provide either a written notice of acceptance or a Defect Notice before the Review Period expires, the deliverable shall be deemed accepted by the Purchaser.'
));

children.push(subHeading('7.6  Compensation for Technical Services'));

children.push(clause('7.6',
  'Cap on Free Technical Services. During the period when the Purchase Consideration remains outstanding, the Developer shall provide the Technical Services at no additional charge for a period of six (6) months from the Effective Date, such services being considered part of the overall consideration for the Revenue Share. After the expiry of the six (6) month free period, or after the Purchase Consideration is paid in full (whichever occurs first), the Parties shall agree in writing on a separate monthly retainer or hourly rate for ongoing Technical Services, the terms of which shall be appended as Schedule 2. Until Schedule 2 is agreed, any Technical Services requested by the Purchaser after the free period shall be chargeable at the Developer\u2019s standard hourly rate of INR Rs. 5,000/- (Rupees Five Thousand Only) per hour, invoiced monthly.'
));

// ============================================================================
// 8. CONFIDENTIALITY
// ============================================================================

children.push(sectionHeading('8.  Confidentiality'));

children.push(clause('8.1',
  'Each Party acknowledges that in performing its obligations under this Agreement it will have access to confidential information belonging to the other Party, including but not limited to: proprietary diagnostic methodology, assessment frameworks, scoring matrices, AI prompts and training logic, business plans, commercial data, customer lists, technical architecture, source code, and revenue data.'
));

children.push(clause('8.2',
  'Each Party agrees to: (a) keep all confidential information strictly secret and not disclose it to any third party without the other Party\u2019s prior written consent; (b) use confidential information only for the purpose of performing obligations under this Agreement; and (c) on termination or expiry of this Agreement, promptly return or permanently delete all confidential information and certify such deletion in writing if requested.'
));

children.push(clause('8.3',
  'These obligations survive termination of this Agreement for a period of three (3) years.'
));

// ============================================================================
// 9. TERM AND TERMINATION
// ============================================================================

children.push(sectionHeading('9.  Term and Termination'));

children.push(clause('9.1',
  'This Agreement commences on the Effective Date and continues until the earlier of: (a) payment in full of the Purchase Consideration and completion of all assignment formalities; (b) mutual written agreement of the Parties; or (c) termination pursuant to this Clause 9.'
));

children.push(clause('9.2',
  'Either Party may terminate this Agreement for convenience by giving ninety (90) days\u2019 written notice to the other Party, provided that termination by the Purchaser prior to payment in full of the Purchase Consideration shall not extinguish the Purchaser\u2019s obligation to pay the full outstanding balance within thirty (30) days of the termination notice.'
));

children.push(clause('9.3',
  'Either Party may terminate this Agreement immediately by written notice if the other Party: (a) commits a material breach of this Agreement and (where capable of remedy) fails to remedy it within thirty (30) days of written notice; (b) becomes insolvent, enters into liquidation, or is subject to any analogous insolvency proceedings; or (c) ceases or threatens to cease to carry on business.'
));

children.push(subHeading('9.4  Consequences of Termination'));

children.push(letteredClause('a',
  'All Foreground IP and any enhancements to the Software created up to the termination date remain the property of the Purchaser.'
));

children.push(letteredClause('b',
  'The Developer shall immediately deliver to the Purchaser all source code, documentation, repositories, credentials, and work in progress relating to the Software and any Foreground IP.'
));

children.push(letteredClause('c',
  'Any Revenue Share accrued but unpaid as at the termination date shall be paid within thirty (30) days, and the Purchaser shall pay any outstanding balance of the Purchase Consideration in full within thirty (30) days of termination if it wishes to retain ownership of the Software.'
));

children.push(letteredClause('d',
  'If the Purchaser fails to pay the full outstanding Purchase Consideration within the period in sub-clause (c), the exclusive licence granted under Clause 4 shall automatically terminate, the Purchaser shall cease all commercial exploitation of the Software, and ownership shall remain vested in the Developer.'
));

children.push(letteredClause('e',
  'Source Code Purge. Immediately following the successful delivery and acceptance of the final build, or upon termination of this Agreement for any reason where the Purchaser does not acquire full ownership, the Purchaser shall permanently delete, purge, and destroy all local copies, partial backups, staging builds, and remnants of the source code from all of the Purchaser\u2019s servers, cloud environments, and physical storage media. Within seven (7) business days of such request, the Purchaser shall provide a signed, written certification that a complete system purge has been executed and no source code copies have been retained.'
));

children.push(letteredClause('f',
  'Survival of Developer\u2019s Rights. Termination of this Agreement for any reason shall not affect the Developer\u2019s right to receive all accrued and unpaid amounts, including Revenue Share, Late Payment Interest, and any other sums due. The Developer\u2019s ownership of all Foreground IP not vested in the Purchaser pursuant to Clause 5.4 shall continue notwithstanding termination.'
));

children.push(subHeading('9.5  Sunset Date and Reversion of Rights'));

children.push(clause('9.5',
  'Sunset Date. The Parties acknowledge that the Developer\u2019s deferral of the Purchase Consideration is contingent upon timely payment through Revenue Share and any top-up payments. The full Purchase Consideration must be paid in full by the Sunset Date (being the date falling six (6) months after the Effective Date). If the full Purchase Consideration has not been paid by the Sunset Date, the Developer shall be entitled, at her sole discretion and upon thirty (30) days\u2019 written notice to the Purchaser, to: (a) terminate the exclusive licence granted under Clause 4; (b) terminate this Agreement; (c) retain ownership of the Software and all associated Intellectual Property Rights, free from any claim by the Purchaser; (d) retain all payments received to date as consideration for the licence period; and (e) re-enter into possession of the Software and exploit it independently or with any third party. The Purchaser shall, within fourteen (14) days of such notice, return or permanently delete all copies of the Software and certify such deletion in writing. This Clause 9.5 is in addition to, and does not limit, the Developer\u2019s other rights and remedies.'
));

// ============================================================================
// 10. WARRANTIES AND LIABILITY
// ============================================================================

children.push(sectionHeading('10.  Warranties and Liability'));

children.push(clause('10.1',
  'Each Party warrants that it has full authority to enter into this Agreement and that doing so does not breach any obligation owed to a third party.'
));

children.push(clause('10.2',
  'The Developer warrants that the Software will conform to the description in Schedule 1 and will be free from material defects for a period of ninety (90) days following acceptance. The Developer shall remedy any such defects at no additional cost.'
));

children.push(clause('10.3',
  'Warranty Against Malicious Code; Reservation of Disable Rights. The Developer represents, warrants, and covenants that the Software as delivered is free of any malware, trojan horses, worms, logic bombs, or backdoors that would cause unauthorised damage to the Purchaser\u2019s systems or unauthorised access to user data. The Developer expressly reserves the right to implement usage metering, rate limiting, licence verification, and remote disabling mechanisms (including kill-switches) that activate upon material payment default by the Purchaser, provided that: (a) such mechanisms are disclosed in writing to the Purchaser upon request; (b) such mechanisms do not cause loss of, or unauthorised access to, user data; and (c) such mechanisms are reversible upon cure of the payment default. The Purchaser acknowledges that the Developer\u2019s right to disable the Software upon payment default is a fundamental protection of the Developer\u2019s intellectual property and economic interests, given the deferred payment structure of this Agreement. The Developer shall not be liable for any business losses arising from the legitimate exercise of such disable rights following a payment default.'
));

children.push(clause('10.4',
  'To the maximum extent permitted by law, neither Party shall be liable to the other for any indirect, consequential, special, or punitive loss arising out of or in connection with this Agreement.'
));

children.push(clause('10.5',
  'Liability Cap and Carve-Outs. The Purchaser\u2019s total aggregate liability under this Agreement, other than for payment of the Purchase Consideration, shall not exceed the greater of (a) the total Revenue Share payments actually made to the Developer in the twelve (12) months preceding the event giving rise to the claim, or (b) INR Rs. [INSERT LIABILITY CAP]. The liability cap in this Clause 10.5 shall NOT apply to: (i) the Purchaser\u2019s obligation to pay the Purchase Consideration, Revenue Share, or any top-up payment; (ii) claims arising from the Purchaser\u2019s unauthorised use of the Software or Foreground IP beyond the scope of the licence granted under Clause 4 or 5; (iii) claims arising from breach of the confidentiality obligations under Clause 8; (iv) claims arising from the Purchaser\u2019s infringement of the Developer\u2019s Intellectual Property Rights; (v) the Purchaser\u2019s indemnity obligations under Clause 11; or (vi) claims arising from the Purchaser\u2019s fraud, wilful misconduct, or gross negligence. The Developer\u2019s total aggregate liability under this Agreement shall not exceed the total fees received from the Purchaser in the twelve (12) months preceding the event giving rise to the claim, except for claims arising from the Developer\u2019s fraud, wilful misconduct, or gross negligence.'
));

// ============================================================================
// 11. INDEPENDENT CONTRACTOR & NO EMPLOYMENT STATUS
// ============================================================================

children.push(sectionHeading('11.  Independent Contractor and No Employment Status'));

children.push(clause('11.1',
  'The Developer is an independent contractor, and nothing in this Agreement shall create, or be deemed to create, an employment relationship, partnership, joint venture, or agency between the Parties. The Developer explicitly acknowledges and agrees that:'
));

children.push(letteredClause('a',
  'The Developer is not an employee of the Purchaser and is not entitled to, and hereby waives any claim for, any employee benefits, including but not limited to health insurance, paid annual leave, sick pay, pension contributions, or holiday pay provided by the Purchaser to its employees.'
));

children.push(letteredClause('b',
  'The Developer has no authority to bind the Purchaser, incur liabilities on its behalf, or act as its legal representative in any capacity.'
));

children.push(letteredClause('c',
  'The Developer remains solely responsible for all tax obligations arising from fees received under this Agreement, under the laws of India. The Purchaser shall be solely responsible for any tax obligations arising from its receipt of the Software and Technical Services, including any UK VAT, sales tax, or similar levies. Each Party shall indemnify the other against tax liabilities arising from the indemnifying Party\u2019s failure to comply with its own tax obligations. The Developer\u2019s indemnity under this clause shall be capped at the total fees received from the Purchaser in the twelve (12) months preceding the relevant tax assessment. The Parties acknowledge that the Purchaser\u2019s classification of the Developer as an independent contractor does not bind any tax authority, and that any reclassification by a tax authority shall not constitute a breach of this Agreement by either Party.'
));

// ============================================================================
// 12. NON-SOLICITATION AND NON-COMPETITION
// ============================================================================

children.push(sectionHeading('12.  Non-Solicitation and Non-Competition'));

children.push(clause('12.1',
  'During the term of this Agreement and for twelve (12) months following its expiry or termination, the Developer shall not directly or indirectly solicit, approach, or seek to entice away any employee, client, or customer of Verso with whom the Developer has had material contact during this engagement.'
));

children.push(clause('12.2',
  'Non-Competition and Alternative Exploitation. The Developer acknowledges that during the course of this engagement, the Developer will gain access to Verso\u2019s proprietary diagnostic framework (the Sales Wellbeing Map), scoring matrices, and commercial strategy. The Developer agrees that during the term of this Agreement and for a period of twelve (12) months following its termination or expiry, the Developer shall not \u2014 directly or indirectly, in any country where Verso actively markets or sells the integrated Verso + Optimism Engine product as of the termination date \u2014 develop, market, license, sell, or distribute any software platform that directly competes with the integrated Verso + Optimism Engine product. The Developer shall not utilise any portion of the Foreground IP, Background IP, or Verso\u2019s confidential information to build software for any third party. Nothing in this clause shall prevent the Developer from: (a) developing general-purpose AI tools, mental wellbeing applications, or diagnostic platforms that do not incorporate Verso\u2019s proprietary Sales Wellbeing Map, Foreground IP, or Verso\u2019s confidential information; (b) working for any employer or client in a role that does not involve the direct development of a directly competing sales-wellbeing product; or (c) using general software engineering skills and knowledge acquired prior to this Agreement. The Parties acknowledge that this restriction is reasonable in scope, geography, and duration, and is necessary to protect Verso\u2019s legitimate business interests.'
));

// ============================================================================
// 13. GOVERNING LAW AND DISPUTES
// ============================================================================

children.push(sectionHeading('13.  Governing Law and Disputes'));

children.push(clause('13.1',
  'This Agreement shall be governed by and construed in accordance with the laws of England and Wales.'
));

children.push(clause('13.2',
  'The Parties agree to attempt to resolve any dispute arising under this Agreement through good-faith negotiation within thirty (30) days of written notice of a dispute.'
));

children.push(clause('13.3',
  'If the dispute cannot be resolved by negotiation, the Parties agree to submit to binding arbitration under the Rules of the Singapore International Arbitration Centre (SIAC), with the seat of arbitration in Singapore and proceedings conducted in English. The number of arbitrators shall be one (1), unless the amount in dispute exceeds USD 200,000, in which case the number shall be three (3). The Parties agree that the costs of arbitration (including arbitrator fees and administrative fees) shall be borne equally between the Parties, regardless of outcome. Each Party shall bear its own legal fees, except that the prevailing Party shall be entitled to recover its reasonable legal fees from the non-prevailing Party, capped at the lesser of (a) the amount in dispute or (b) USD 50,000. The award shall be final and binding on the Parties, and may be enforced in any court of competent jurisdiction, including the courts of India and England pursuant to the New York Convention.'
));

children.push(clause('13.4',
  'Nothing in this Clause prevents either Party from seeking urgent injunctive or other interim relief from a court of competent jurisdiction.'
));

children.push(clause('13.5',
  'The Purchaser acknowledges that cross-border enforcement of judgments and arbitral awards against an Indian-resident Developer involves specific procedural steps under Indian law, including the Arbitration and Conciliation Act, 1996. The Parties are advised to seek independent legal counsel on enforcement mechanisms before signing.'
));

// ============================================================================
// 14. GENERAL
// ============================================================================

children.push(sectionHeading('14.  General'));

children.push(clause('14.1',
  'Entire Agreement. This Agreement (including its Schedules) constitutes the entire agreement between the Parties and supersedes all prior discussions, representations, or agreements relating to its subject matter.'
));

children.push(clause('14.2',
  'Variation. No variation of this Agreement is effective unless made in writing and signed by both Parties.'
));

children.push(clause('14.3',
  'Waiver. A failure to exercise or delay in exercising any right under this Agreement does not constitute a waiver of that right.'
));

children.push(clause('14.4',
  'Severability. If any provision of this Agreement is found to be invalid or unenforceable, it shall be modified to the minimum extent necessary to make it valid and enforceable, and the remaining provisions shall continue in full force.'
));

children.push(clause('14.5',
  'Notices. Notices under this Agreement shall be in writing and sent by email with delivery confirmation to the email addresses set out on the cover page.'
));

children.push(clause('14.6',
  'Counterparts. This Agreement may be executed in counterparts (including by electronic signature), each of which shall be an original, and together shall constitute one agreement.'
));

// ============================================================================
// SIGNATURES
// ============================================================================

children.push(sectionHeading('Signatures'));

children.push(body(
  'By signing below, each Party agrees to be bound by the terms of this Agreement.',
  { noIndent: true, after: 240 }
));

children.push(signatureBlock());

// ============================================================================
// SCHEDULE 1 - DESCRIPTION OF THE SOFTWARE
// ============================================================================

children.push(sectionHeading('Schedule 1 \u2014 Description of the Software (THE OPTIMISM ENGINE)'));

children.push(body(
  'The Software is a proprietary Artificial Intelligence-powered emotional wellbeing platform comprising the modules and components set out below. The Developer confirms that all modules listed are fully developed and operational as of the Effective Date, with source code and documentation to be delivered to the Purchaser upon execution of this Agreement and assignment formalities completed in accordance with Clause 5.',
  { noIndent: true, after: 240 }
));

children.push(scheduleTable([
  ['1', 'AI Conversational Engine', 'An Artificial Intelligence conversational engine capable of identifying and reframing negative self-talk into constructive and positive perspectives, supporting multi-turn dialogue with memory of previous questions, reframes, and acknowledgments.'],
  ['2', 'Personalised Emotional Support', 'Personalised emotional support designed to encourage healthier thinking patterns and emotional resilience, adapting to the user\u2019s pressure archetype (Driver, Strategist, Connector, Reactor).'],
  ['3', 'Progress Tracking', 'Intelligent tracking of individual user progress through successive chat sessions, including an iceberg-depth indicator showing surface \u2192 trigger \u2192 emotion \u2192 core belief progression.'],
  ['4', 'Mood Tracking & Analytics', 'Mood tracking and emotional analytics capturing mood, energy, and confidence ratings on a 1\u20135 scale, with seven-day trend visualisation and impact tag frequency analysis.'],
  ['5', 'Grounding Exercises', 'Guided grounding exercises intended to assist users during periods of emotional distress or anxiety, with grounding mode activation when crisis-related language is detected.'],
  ['6', 'Gratitude Journal', 'Gratitude journaling and gratitude entry modules allowing users to record and reflect on daily gratitude, with optional reminder scheduling.'],
  ['7', 'Mood Board & Reflection', 'Mood board and emotional reflection features enabling users to visually map their emotional state over time and correlate patterns with external events.'],
  ['8', 'Engagement Analytics', 'User engagement analytics, behavioural insights, and personalised recommendations delivered to both the individual user (via dashboard) and to Verso administrators (via admin panel).'],
  ['9', 'Crisis Detection', 'Crisis keyword detection layer that triggers a dedicated crisis response protocol, displaying supportive messaging and helpline resources (US 988, UK Samaritans 116 123, Crisis Text Line 741741).'],
  ['10', 'Multi-Provider AI Fallback', 'Multi-provider AI service layer with automatic fallback chain (Mistral \u2192 Anthropic \u2192 OpenAI \u2192 Groq) ensuring continuous service availability even when individual providers experience outages.'],
  ['11', 'Sales Wellbeing Map Integration', 'Integration layer connecting the Optimism Engine to Verso\u2019s proprietary 16-question Sales Wellbeing Map diagnostic, enabling archetype-personalised coaching responses.'],
  ['12', 'Source Code & Documentation', 'Complete source code, object code, software architecture documentation, API specifications, database schemas, deployment guides, and technical manuals for all modules listed above.'],
]));

children.push(blankLine());

children.push(body(
  'Note: This Schedule forms an integral part of the Agreement. The modules listed above are the components of the Software being purchased under Clause 3 and licensed under Clause 4. Any future modules, enhancements, or derivative works developed by the Developer under the Technical Services in Clause 7 shall be treated as Foreground IP and shall vest in the Purchaser in accordance with Clause 5.4 (conditional upon acceptance and payment). The Purchaser and Developer shall, prior to signing, confirm in writing that the Software as delivered matches the description in this Schedule.',
  { noIndent: false, after: 240 }
));

// ============================================================================
// DOCUMENT ASSEMBLY
// ============================================================================

const doc = new Document({
  creator: 'Verso',
  title: 'Software Purchase, Assignment, Exclusive Licence, Revenue Sharing and Technical Services Agreement',
  subject: 'Verso x Developer - Optimism Engine Acquisition',
  description: 'Legal agreement for the purchase and assignment of THE OPTIMISM ENGINE AI platform from the Developer to Verso, with deferred payment via revenue share, 6-month sunset date, and ongoing technical services. Revised to protect the Developer\u2019s rights, time, and money. Material commercial terms (Purchase Consideration amount, Revenue Share percentage, liability cap) to be filled in prior to execution.',
  styles: {
    default: {
      document: {
        run: {
          font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
          size: 24, color: BLACK,
        },
        paragraph: { spacing: { line: 360 } },
      },
      heading1: {
        run: {
          font: { eastAsia: 'SimHei', ascii: 'Times New Roman' },
          size: 30, bold: true, color: BLACK,
        },
        paragraph: { spacing: { before: 360, after: 180, line: 360 } },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { line: 360 },
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 20, color: MUTED,
                  font: { eastAsia: 'SimSun', ascii: 'Times New Roman' },
                }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

const outputPath = '/home/z/my-project/download/Verso_Developer_Agreement_Optimism_Engine.docx';

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outputPath, buf);
  console.log(`✅ Generated: ${outputPath}`);
  console.log(`   Size: ${(buf.length / 1024).toFixed(1)} KB`);
}).catch(err => {
  console.error('❌ Generation failed:', err);
  process.exit(1);
});
