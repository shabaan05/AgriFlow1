const pptxgen = require('pptxgenjs');
const path = require('path');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10.0 x 5.625 inches
pres.author = 'B.Tech CSE Project Student';
pres.company = 'Department of Computer Science & Engineering';
pres.title = 'AgriFlow AI – Smart Agricultural Supply Chain SaaS Platform';
pres.subject = 'B.Tech Final Year Major Project Presentation';

// ── Clean Academic Palette ───────────────────────────────────────────────────
const C = {
  bg:           'FFFFFF', // Pure clean white
  cardBg:       'F8FAFC', // Very light slate card
  cardGreenBg:  'F0FDF4', // Very light mint card
  border:       'E2E8F0', // Subtle clean border
  borderGreen:  '86EFAC', // Subtle green border
  primary:      '15803D', // Deep Agriculture Green
  primaryDark:  '0F172A', // Slate 900 for crisp text
  bodyText:     '334155', // Slate 700 for body
  mutedText:    '64748B', // Slate 500 for subtext
  accentBlue:   '2563EB', // Blue for data/routing
  accentAmber:  'D97706', // Amber for perishability
  white:        'FFFFFF'
};

// ── Standard Clean Slide Layout Helper ────────────────────────────────────────
function addCleanHeader(slide, slideNum, title, subtitle) {
  slide.background = { color: C.bg };

  // Category Tag / Tracker
  slide.addText(`AGRIFLOW AI  |  B.TECH FINAL-YEAR PROJECT  |  SLIDE ${slideNum}/15`, {
    x: 0.8, y: 0.4, w: 8.4, h: 0.25,
    fontSize: 9, bold: true, color: C.primary, fontFace: 'Calibri'
  });

  // Main Slide Title
  slide.addText(title, {
    x: 0.8, y: 0.65, w: 8.4, h: 0.5,
    fontSize: 22, bold: true, color: C.primaryDark, fontFace: 'Calibri', valign: 'middle'
  });

  // Optional Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8, y: 1.15, w: 8.4, h: 0.3,
      fontSize: 12, color: C.mutedText, fontFace: 'Calibri', valign: 'middle'
    });
  }

  // Thin clean dividing rule
  slide.addShape('line', {
    x: 0.8, y: 1.5, w: 8.4, h: 0,
    line: { color: C.border, width: 1 }
  });

  // Footer
  slide.addText('AgriFlow AI — Smart Agricultural Supply Chain SaaS Platform', {
    x: 0.8, y: 5.2, w: 5.0, h: 0.3,
    fontSize: 8.5, color: C.mutedText, fontFace: 'Calibri'
  });
  slide.addText(`Slide ${slideNum} of 15`, {
    x: 6.2, y: 5.2, w: 3.0, h: 0.3,
    fontSize: 8.5, bold: true, color: C.primary, align: 'right', fontFace: 'Calibri'
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 01: TITLE SLIDE (Clean Academic Style)
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bg };

  // Green Top Bar Accent
  s.addShape('rect', {
    x: 0.8, y: 0.6, w: 8.4, h: 0.1,
    fill: { color: C.primary }
  });

  // Academic Sub-tag
  s.addText('B.TECH MAJOR PROJECT FINAL DEFENSE', {
    x: 0.8, y: 0.9, w: 8.4, h: 0.3,
    fontSize: 11, bold: true, color: C.primary, fontFace: 'Calibri'
  });

  // Project Title
  s.addText('AgriFlow AI', {
    x: 0.8, y: 1.25, w: 8.4, h: 0.7,
    fontSize: 36, bold: true, color: C.primaryDark, fontFace: 'Calibri'
  });

  // Project Subtitle
  s.addText('Smart Agricultural Supply Chain SaaS Platform', {
    x: 0.8, y: 1.95, w: 8.4, h: 0.45,
    fontSize: 18, bold: true, color: C.primary, fontFace: 'Calibri'
  });

  s.addText('An integrated B2B multi-stakeholder platform connecting Farmers, Buyers, and Transporters with explainable decision support.', {
    x: 0.8, y: 2.45, w: 8.4, h: 0.4,
    fontSize: 12, color: C.bodyText, fontFace: 'Calibri'
  });

  // Two Clean Info Boxes
  // Left: Student Candidates
  s.addShape('roundRect', {
    x: 0.8, y: 3.1, w: 4.0, h: 1.6,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText('PROJECT CANDIDATES', {
    x: 1.0, y: 3.25, w: 3.6, h: 0.25,
    fontSize: 10, bold: true, color: C.primaryDark, fontFace: 'Calibri'
  });
  s.addText('• [Student Name 1] (Roll No: XXXXXX)\n• [Student Name 2] (Roll No: XXXXXX)\n• [Student Name 3] (Roll No: XXXXXX)\nB.Tech in Computer Science & Engineering', {
    x: 1.0, y: 3.55, w: 3.6, h: 1.0,
    fontSize: 11, color: C.bodyText, fontFace: 'Calibri', lineSpacingMultiple: 1.2
  });

  // Right: Project Guide & Institution
  s.addShape('roundRect', {
    x: 5.2, y: 3.1, w: 4.0, h: 1.6,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText('PROJECT SUPERVISOR & INSTITUTION', {
    x: 5.4, y: 3.25, w: 3.6, h: 0.25,
    fontSize: 10, bold: true, color: C.primaryDark, fontFace: 'Calibri'
  });
  s.addText('• Project Guide: Prof. [Guide Name]\n• Department of Computer Science & Engineering\n• [College / University Name, Location]\n• Academic Year: 2025 – 2026', {
    x: 5.4, y: 3.55, w: 3.6, h: 1.0,
    fontSize: 11, color: C.bodyText, fontFace: 'Calibri', lineSpacingMultiple: 1.2
  });

  s.addNotes('Respected guide and examiners, good morning. Today we present our B.Tech major project: AgriFlow AI, a smart agricultural supply chain platform connecting farmers, buyers, and transporters with explainable decision-support tools.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 02: PROBLEM STATEMENT
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addCleanHeader(s, '02', 'Problem Statement', 'Major challenges in the current agricultural supply chain');

  // Left side: Bullet points (maximum 5 clear points)
  s.addText([
    { text: '• Demand Uncertainty: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Farmers sow crops without knowing future commercial demand, causing gluts and price crashes.\n\n', options: { color: C.bodyText } },
    { text: '• Buyer Discovery: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Difficulty finding direct wholesale buyers; 4–6 middleman tiers capture 35%–50% margins.\n\n', options: { color: C.bodyText } },
    { text: '• Food Wastage: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Perishable crops spoil quickly without shelf-life tracking or timely buyer matching.\n\n', options: { color: C.bodyText } },
    { text: '• Transport Inefficiency: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Rural farm-gate transport is fragmented, uncoordinated, and runs empty return trips.\n\n', options: { color: C.bodyText } },
    { text: '• Lack of Traceability: ', options: { bold: true, color: C.primaryDark } },
    { text: 'No verified origin, quality, or transit records between farm gate and buyer warehouse.', options: { color: C.bodyText } }
  ], {
    x: 0.8, y: 1.7, w: 5.2, h: 3.3,
    fontSize: 11.5, fontFace: 'Calibri', lineSpacingMultiple: 1.15
  });

  // Right side: Clean visual flow diagram
  s.addShape('roundRect', {
    x: 6.3, y: 1.7, w: 2.9, h: 3.3,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText('CURRENT SUPPLY-CHAIN BOTTLENECKS', {
    x: 6.45, y: 1.85, w: 2.6, h: 0.25,
    fontSize: 8.5, bold: true, color: C.primary, align: 'center', fontFace: 'Calibri'
  });

  const pFlow = [
    'Blind Cultivation',
    'Middleman Opaque Pricing',
    'Post-Harvest Spoilage',
    'Unorganized Rural Transport',
    'Zero End-to-End Traceability'
  ];
  pFlow.forEach((step, idx) => {
    const py = 2.2 + idx * 0.52;
    s.addShape('roundRect', {
      x: 6.55, y: py, w: 2.4, h: 0.36,
      fill: { color: C.white },
      line: { color: C.border, width: 1 },
      rectRadius: 0.05
    });
    s.addText(step, {
      x: 6.55, y: py, w: 2.4, h: 0.36,
      fontSize: 9.5, color: C.primaryDark, bold: true, align: 'center', valign: 'middle', fontFace: 'Calibri'
    });
  });

  s.addNotes('Agricultural supply chains face five core issues: farmers cultivate crops without forward demand signals, middlemen capture 35-50% margins, perishable crops suffer heavy post-harvest wastage, transport is fragmented, and there is no verified traceability.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 03: PROPOSED SOLUTION
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addCleanHeader(s, '03', 'Proposed Solution', 'AgriFlow AI: An integrated multi-stakeholder platform');

  // Top: Clean Visual Architecture Diagram
  // Center Box: AgriFlow AI
  s.addShape('roundRect', {
    x: 3.5, y: 1.75, w: 3.0, h: 1.25,
    fill: { color: C.cardGreenBg },
    line: { color: C.primary, width: 2 },
    rectRadius: 0.1
  });
  s.addText('AGRIFLOW AI PLATFORM\n(Core SaaS & Decision Engine)', {
    x: 3.5, y: 1.75, w: 3.0, h: 1.25,
    fontSize: 12, bold: true, color: C.primary, align: 'center', valign: 'middle', fontFace: 'Calibri'
  });

  // Left Box: Farmer
  s.addShape('roundRect', {
    x: 0.8, y: 1.95, w: 2.0, h: 0.85,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText('FARMER\nCrops & Fulfillment', {
    x: 0.8, y: 1.95, w: 2.0, h: 0.85,
    fontSize: 11, bold: true, color: C.primaryDark, align: 'center', valign: 'middle', fontFace: 'Calibri'
  });
  s.addText('◄────►', {
    x: 2.8, y: 2.2, w: 0.7, h: 0.3,
    fontSize: 14, color: C.primary, align: 'center', valign: 'middle'
  });

  // Right Box: Buyer
  s.addShape('roundRect', {
    x: 7.2, y: 1.95, w: 2.0, h: 0.85,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText('BUYER\nDemand & Bookings', {
    x: 7.2, y: 1.95, w: 2.0, h: 0.85,
    fontSize: 11, bold: true, color: C.primaryDark, align: 'center', valign: 'middle', fontFace: 'Calibri'
  });
  s.addText('◄────►', {
    x: 6.5, y: 2.2, w: 0.7, h: 0.3,
    fontSize: 14, color: C.primary, align: 'center', valign: 'middle'
  });

  // Bottom-Left Box: Transporter
  s.addShape('roundRect', {
    x: 1.8, y: 3.3, w: 2.8, h: 0.7,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText('TRANSPORTER\nPickups & Route Optimization', {
    x: 1.8, y: 3.3, w: 2.8, h: 0.7,
    fontSize: 10, bold: true, color: C.primaryDark, align: 'center', valign: 'middle', fontFace: 'Calibri'
  });
  s.addText('▲\n│', {
    x: 3.0, y: 3.0, w: 0.4, h: 0.3,
    fontSize: 10, color: C.primary, align: 'center', valign: 'middle'
  });

  // Bottom-Right Box: Admin
  s.addShape('roundRect', {
    x: 5.4, y: 3.3, w: 2.8, h: 0.7,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText('ADMINISTRATOR\nPlatform Governance & Audit', {
    x: 5.4, y: 3.3, w: 2.8, h: 0.7,
    fontSize: 10, bold: true, color: C.primaryDark, align: 'center', valign: 'middle', fontFace: 'Calibri'
  });
  s.addText('▲\n│', {
    x: 6.6, y: 3.0, w: 0.4, h: 0.3,
    fontSize: 10, color: C.primary, align: 'center', valign: 'middle'
  });

  // Bottom: 3-4 Key Solution Points
  s.addText([
    { text: '• Direct Market Connection: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Enables direct transactions between farmers and wholesale buyers, bypassing opaque middleman cartels.\n', options: { color: C.bodyText } },
    { text: '• Explainable Decision Support: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Provides transparent, multi-factor matching and shelf-life urgency scoring rather than black-box models.\n', options: { color: C.bodyText } },
    { text: '• Integrated Logistics & Traceability: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Connects verified transporters for farm pickups while recording chronological milestone logs.', options: { color: C.bodyText } }
  ], {
    x: 0.8, y: 4.25, w: 8.4, h: 0.9,
    fontSize: 11, fontFace: 'Calibri', lineSpacingMultiple: 1.15
  });

  s.addNotes('Our solution integrates all four stakeholders. Farmers list produce and see demand; buyers broadcast needs and book crops; transporters claim pickups; and admins oversee the system. Everything is connected through an explainable decision engine.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 04: OBJECTIVES
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addCleanHeader(s, '04', 'Project Objectives', 'Key engineering goals of the platform');

  const objList = [
    { num: '1', title: 'Connect Stakeholders', desc: 'Build a secure, role-based platform for Farmers, Buyers, Transporters, and Admins.' },
    { num: '2', title: 'Improve Matching', desc: 'Develop an explainable weighted scoring model (0–100) to pair buyer needs with crops.' },
    { num: '3', title: 'Forecast Demand', desc: 'Provide forward demand and price visibility using historical market and mandi trends.' },
    { num: '4', title: 'Reduce Food Wastage', desc: 'Monitor crop shelf-life decay and alert farmers to at-risk batches before spoilage.' },
    { num: '5', title: 'Optimize Logistics', desc: 'Automate farm-gate pickup dispatch with multi-stop vehicle capacity checks.' },
    { num: '6', title: 'Ensure Traceability', desc: 'Establish an immutable milestone audit trail from harvest to warehouse delivery.' }
  ];

  objList.forEach((o, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const ox = 0.8 + col * 4.4;
    const oy = 1.75 + row * 1.05;

    s.addShape('roundRect', {
      x: ox, y: oy, w: 4.1, h: 0.9,
      fill: { color: C.cardBg },
      line: { color: C.border, width: 1 },
      rectRadius: 0.08
    });

    s.addShape('oval', {
      x: ox + 0.15, y: oy + 0.22, w: 0.45, h: 0.45,
      fill: { color: C.cardGreenBg },
      line: { color: C.primary, width: 1 }
    });
    s.addText(o.num, {
      x: ox + 0.15, y: oy + 0.22, w: 0.45, h: 0.45,
      fontSize: 12, bold: true, color: C.primary, align: 'center', valign: 'middle', fontFace: 'Calibri'
    });

    s.addText(o.title, {
      x: ox + 0.75, y: oy + 0.12, w: 3.2, h: 0.28,
      fontSize: 12, bold: true, color: C.primaryDark, fontFace: 'Calibri'
    });
    s.addText(o.desc, {
      x: ox + 0.75, y: oy + 0.42, w: 3.2, h: 0.42,
      fontSize: 10, color: C.bodyText, fontFace: 'Calibri', lineSpacingMultiple: 1.1
    });
  });

  s.addNotes('We defined six clear objectives: connecting all four stakeholders, implementing explainable matching, forecasting demand, monitoring shelf-life to prevent waste, optimizing transport, and recording complete milestone traceability.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 05: SYSTEM ARCHITECTURE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addCleanHeader(s, '05', 'System Architecture', 'Modern 3-tier full-stack decoupled architecture');

  // Simple 3-tier diagram
  // Tier 1: Frontend
  s.addShape('roundRect', {
    x: 0.8, y: 1.75, w: 2.4, h: 2.2,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText('FRONTEND (CLIENT)', {
    x: 0.9, y: 1.9, w: 2.2, h: 0.25,
    fontSize: 10, bold: true, color: C.primary, fontFace: 'Calibri'
  });
  s.addText('• React 18 Single Page App\n• Vite Build Tool\n• Tailwind CSS Styling\n• React Router v6\n• Role-Protected Routes\n• Auth & Orders Context', {
    x: 0.9, y: 2.25, w: 2.2, h: 1.5,
    fontSize: 10.5, color: C.bodyText, fontFace: 'Calibri', lineSpacingMultiple: 1.2
  });

  // Connector 1
  s.addText('REST API\n(JWT Auth)\n────►', {
    x: 3.25, y: 2.45, w: 0.95, h: 0.8,
    fontSize: 9, bold: true, color: C.mutedText, align: 'center', fontFace: 'Calibri'
  });

  // Tier 2: Backend
  s.addShape('roundRect', {
    x: 4.25, y: 1.75, w: 2.6, h: 2.2,
    fill: { color: C.cardGreenBg },
    line: { color: C.primary, width: 1.5 },
    rectRadius: 0.08
  });
  s.addText('BACKEND (API SERVER)', {
    x: 4.35, y: 1.9, w: 2.4, h: 0.25,
    fontSize: 10, bold: true, color: C.primary, fontFace: 'Calibri'
  });
  s.addText('• Node.js & Express.js\n• JWT Auth Middleware\n• Role-Based Access Control\n• Order State Machine\n• Decision Engines (AI)\n• Traceability Service', {
    x: 4.35, y: 2.25, w: 2.4, h: 1.5,
    fontSize: 10.5, color: C.bodyText, fontFace: 'Calibri', lineSpacingMultiple: 1.2
  });

  // Connector 2
  s.addText('Mongoose\nODM\n────►', {
    x: 6.9, y: 2.45, w: 0.85, h: 0.8,
    fontSize: 9, bold: true, color: C.mutedText, align: 'center', fontFace: 'Calibri'
  });

  // Tier 3: Database
  s.addShape('roundRect', {
    x: 7.8, y: 1.75, w: 1.4, h: 2.2,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText('DATABASE', {
    x: 7.85, y: 1.9, w: 1.3, h: 0.25,
    fontSize: 9.5, bold: true, color: C.primaryDark, align: 'center', fontFace: 'Calibri'
  });
  s.addText('MongoDB\nAtlas\n(Cloud)\n\n• Users\n• Crops\n• Demands\n• Bookings\n• Orders\n• Trips', {
    x: 7.85, y: 2.2, w: 1.3, h: 1.6,
    fontSize: 9.5, color: C.bodyText, align: 'center', fontFace: 'Calibri', lineSpacingMultiple: 1.15
  });

  // Bottom Summary Box
  s.addShape('roundRect', {
    x: 0.8, y: 4.2, w: 8.4, h: 0.8,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText([
    { text: 'Deployment Architecture: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Frontend hosted on Vercel SPA  •  Backend deployed on Render  •  Database on MongoDB Atlas.\n', options: { color: C.bodyText } },
    { text: 'Stateless Security: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Every API request is validated via Bearer JWT tokens, ensuring strict role-based access.', options: { color: C.bodyText } }
  ], {
    x: 1.0, y: 4.3, w: 8.0, h: 0.6,
    fontSize: 10, fontFace: 'Calibri', lineSpacingMultiple: 1.15
  });

  s.addNotes('The system follows a clean 3-tier architecture. React 18 on the frontend communicates with Node.js and Express over REST APIs using JWT authentication. MongoDB Atlas stores structured documents, and our decision engines run directly inside the backend.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 06: USER ROLES & MODULES
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addCleanHeader(s, '06', 'User Roles & Modules', 'Four dedicated modules tailored to each supply-chain actor');

  const modules = [
    {
      role: 'Farmer Module',
      points: [
        'Crop management (CRUD)',
        'Market demand board',
        'AI decision centre',
        'Bookings & orders',
        'Farm profile & payments'
      ]
    },
    {
      role: 'Buyer Module',
      points: [
        'Marketplace discovery',
        'Post requirements',
        'Buyer–farmer matching',
        'Direct crop booking',
        'Delivery tracking & history'
      ]
    },
    {
      role: 'Transporter Module',
      points: [
        'Open pickup requests',
        'Atomic trip claiming',
        'My Trips management',
        'Route optimization',
        'Freight earnings ledger'
      ]
    },
    {
      role: 'Admin Module',
      points: [
        'User verification (KYC)',
        'System analytics & KPIs',
        'Order & payment monitoring',
        'Traceability audit ledger',
        'Platform dispute review'
      ]
    }
  ];

  modules.forEach((m, idx) => {
    const mx = 0.8 + idx * 2.15;
    s.addShape('roundRect', {
      x: mx, y: 1.75, w: 2.0, h: 3.2,
      fill: { color: C.cardBg },
      line: { color: C.border, width: 1 },
      rectRadius: 0.08
    });

    s.addShape('roundRect', {
      x: mx + 0.1, y: 1.9, w: 1.8, h: 0.4,
      fill: { color: C.cardGreenBg },
      line: { color: C.primary, width: 1 },
      rectRadius: 0.06
    });
    s.addText(m.role, {
      x: mx + 0.1, y: 1.9, w: 1.8, h: 0.4,
      fontSize: 10.5, bold: true, color: C.primary, align: 'center', valign: 'middle', fontFace: 'Calibri'
    });

    const pText = m.points.map(pt => `• ${pt}\n`).join('\n');
    s.addText(pText, {
      x: mx + 0.15, y: 2.45, w: 1.7, h: 2.3,
      fontSize: 10, color: C.bodyText, fontFace: 'Calibri', lineSpacingMultiple: 1.1
    });
  });

  s.addNotes('AgriFlow AI partitions features into four clear modules. Farmers manage inventory and fulfill orders; buyers discover crops and track deliveries; transporters claim pickups and manage trips; and admins monitor platform health.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 07: FARMER MODULE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addCleanHeader(s, '07', 'Farmer Module', 'Features supporting farmers from cultivation to dispatch');

  s.addText([
    { text: '• Crop Management: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Add, update, and manage crop listings with harvest dates, expected quantity, price, and quality grade.\n\n', options: { color: C.bodyText } },
    { text: '• Demand Explorer: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Browse active buyer requirements and current mandi price bands before selling.\n\n', options: { color: C.bodyText } },
    { text: '• AI Decision Centre: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Access recommendations for matched buyers, optimal harvest dates, and shelf-life urgency.\n\n', options: { color: C.bodyText } },
    { text: '• Order Fulfillment Pipeline: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Accept or reject incoming bookings; advance accepted orders from Confirmed ➔ Preparing ➔ Ready for Pickup.\n\n', options: { color: C.bodyText } },
    { text: '• Farm Profile & Bank Details: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Maintain verified farm location coordinates and payout settlement details.', options: { color: C.bodyText } }
  ], {
    x: 0.8, y: 1.75, w: 5.4, h: 3.2,
    fontSize: 11.5, fontFace: 'Calibri', lineSpacingMultiple: 1.15
  });

  // Right Side: Simple Staging Workflow Box
  s.addShape('roundRect', {
    x: 6.5, y: 1.75, w: 2.7, h: 3.2,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText('FARMER ORDER STAGING FLOW', {
    x: 6.6, y: 1.9, w: 2.5, h: 0.25,
    fontSize: 9, bold: true, color: C.primary, align: 'center', fontFace: 'Calibri'
  });

  const fStages = [
    { title: '1. Booking Received', desc: 'Buyer reserves quantity' },
    { title: '2. Farmer Accepts', desc: 'Order confirmed' },
    { title: '3. Preparing Crop', desc: 'Harvesting & packing' },
    { title: '4. Ready for Pickup', desc: 'Auto-triggers transporter' }
  ];
  fStages.forEach((st, idx) => {
    const sy = 2.3 + idx * 0.62;
    s.addShape('roundRect', {
      x: 6.7, y: sy, w: 2.3, h: 0.48,
      fill: { color: C.white },
      line: { color: C.border, width: 1 },
      rectRadius: 0.05
    });
    s.addText(st.title, {
      x: 6.75, y: sy + 0.04, w: 2.2, h: 0.2,
      fontSize: 9.5, bold: true, color: C.primaryDark, fontFace: 'Calibri'
    });
    s.addText(st.desc, {
      x: 6.75, y: sy + 0.24, w: 2.2, h: 0.18,
      fontSize: 8, color: C.mutedText, fontFace: 'Calibri'
    });
  });

  s.addNotes('In the Farmer Module, producers manage crops, inspect buyer demand, review AI recommendations, and progress orders from booking acceptance to Ready for Pickup.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 08: BUYER MODULE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addCleanHeader(s, '08', 'Buyer Module', 'Streamlined produce procurement and delivery tracking');

  s.addText([
    { text: '• Marketplace Discovery: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Browse active crop batches with filters for category, grade, location radius, and target price.\n\n', options: { color: C.bodyText } },
    { text: '• Post Requirements: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Broadcast procurement needs (crop type, volume, target price, required deadline) to farmers.\n\n', options: { color: C.bodyText } },
    { text: '• Direct Crop Booking: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Reserve crops directly with instant quantity validation to prevent overselling.\n\n', options: { color: C.bodyText } },
    { text: '• Order & Delivery Tracking: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Monitor real-time order status milestones from farm pickup to warehouse delivery.\n\n', options: { color: C.bodyText } },
    { text: '• Payments & Traceability: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Track invoice settlements and verify complete farm-to-fork batch traceability.', options: { color: C.bodyText } }
  ], {
    x: 0.8, y: 1.75, w: 5.4, h: 3.2,
    fontSize: 11.5, fontFace: 'Calibri', lineSpacingMultiple: 1.15
  });

  // Right Side: Simple Procurement Flow
  s.addShape('roundRect', {
    x: 6.5, y: 1.75, w: 2.7, h: 3.2,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText('BUYER PROCUREMENT FLOW', {
    x: 6.6, y: 1.9, w: 2.5, h: 0.25,
    fontSize: 9, bold: true, color: C.primary, align: 'center', fontFace: 'Calibri'
  });

  const bStages = [
    { title: '1. Search / Post', desc: 'Browse crops or broadcast need' },
    { title: '2. Reserve Quantity', desc: 'BookingModal locks stock' },
    { title: '3. Track Dispatch', desc: 'Monitor transporter transit' },
    { title: '4. Receive & Settle', desc: 'Confirm delivery & payment' }
  ];
  bStages.forEach((st, idx) => {
    const sy = 2.3 + idx * 0.62;
    s.addShape('roundRect', {
      x: 6.7, y: sy, w: 2.3, h: 0.48,
      fill: { color: C.white },
      line: { color: C.border, width: 1 },
      rectRadius: 0.05
    });
    s.addText(st.title, {
      x: 6.75, y: sy + 0.04, w: 2.2, h: 0.2,
      fontSize: 9.5, bold: true, color: C.primaryDark, fontFace: 'Calibri'
    });
    s.addText(st.desc, {
      x: 6.75, y: sy + 0.24, w: 2.2, h: 0.18,
      fontSize: 8, color: C.mutedText, fontFace: 'Calibri'
    });
  });

  s.addNotes('The Buyer Module allows wholesale buyers to search verified produce, broadcast procurement requirements, place immediate bookings, track delivery milestones, and inspect batch traceability.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 09: TRANSPORTER MODULE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addCleanHeader(s, '09', 'Transporter Module', 'Automating farm-gate pickups and delivery tracking');

  s.addText([
    { text: '• Automated Pickup Requests: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Orders reaching "Ready for Pickup" automatically appear on the transporter job board.\n\n', options: { color: C.bodyText } },
    { text: '• Atomic Job Acceptance: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Transporters accept jobs with atomic database locking, preventing multiple drivers from claiming the same pickup.\n\n', options: { color: C.bodyText } },
    { text: '• Delivery Lifecycle Management: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Drivers update trip milestones: Picked Up ➔ In Transit ➔ Delivered.\n\n', options: { color: C.bodyText } },
    { text: '• Freight Earnings Ledger: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Automatically generates earnings records based on consignment weight and transit distance.\n\n', options: { color: C.bodyText } },
    { text: '• Fleet & Vehicle Profile: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Maintains vehicle payload capacity and driver verification details.', options: { color: C.bodyText } }
  ], {
    x: 0.8, y: 1.75, w: 5.4, h: 3.2,
    fontSize: 11.5, fontFace: 'Calibri', lineSpacingMultiple: 1.15
  });

  // Right Side: Simple Delivery Stages Box
  s.addShape('roundRect', {
    x: 6.5, y: 1.75, w: 2.7, h: 3.2,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText('TRANSPORTER WORKFLOW', {
    x: 6.6, y: 1.9, w: 2.5, h: 0.25,
    fontSize: 9, bold: true, color: C.primary, align: 'center', fontFace: 'Calibri'
  });

  const tStages = [
    { title: '1. Pickup Request', desc: 'Order marked ready' },
    { title: '2. Accept Job', desc: 'Atomic database lock' },
    { title: '3. Picked Up', desc: 'Farm-gate loading' },
    { title: '4. In Transit ➔ Delivered', desc: 'Warehouse receipt & payout' }
  ];
  tStages.forEach((st, idx) => {
    const sy = 2.3 + idx * 0.62;
    s.addShape('roundRect', {
      x: 6.7, y: sy, w: 2.3, h: 0.48,
      fill: { color: C.white },
      line: { color: C.border, width: 1 },
      rectRadius: 0.05
    });
    s.addText(st.title, {
      x: 6.75, y: sy + 0.04, w: 2.2, h: 0.2,
      fontSize: 9.5, bold: true, color: C.primaryDark, fontFace: 'Calibri'
    });
    s.addText(st.desc, {
      x: 6.75, y: sy + 0.24, w: 2.2, h: 0.18,
      fontSize: 8, color: C.mutedText, fontFace: 'Calibri'
    });
  });

  s.addNotes('The Transporter Module bridges the first-mile gap. When an order is ready, a pickup request is automatically created. Drivers accept jobs atomically, update trip milestones, and track freight earnings.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 10: AI DECISION-SUPPORT FEATURES
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addCleanHeader(s, '10', 'AI Decision-Support Engines', 'Deterministic and explainable algorithms assisting supply-chain decisions');

  const aiCards = [
    {
      num: '1',
      title: 'Buyer–Farmer Matching',
      desc: 'Ranks buyer requirements against farmer crops using an explainable multi-factor scoring model (0–100).'
    },
    {
      num: '2',
      title: 'Demand Forecasting',
      desc: 'Analyzes historical mandi arrival data and price trends using weighted moving averages to project future demand.'
    },
    {
      num: '3',
      title: 'Shelf-Life & Wastage Prevention',
      desc: 'Calculates remaining freshness based on crop perishability, classifying risk into Fresh, Attention, and Critical.'
    },
    {
      num: '4',
      title: 'Route & Pickup Optimization',
      desc: 'Clusters farm pickup requests to maximize truck capacity while prioritizing urgent perishable batches.'
    }
  ];

  aiCards.forEach((c, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cx = 0.8 + col * 4.4;
    const cy = 1.75 + row * 1.35;

    s.addShape('roundRect', {
      x: cx, y: cy, w: 4.1, h: 1.2,
      fill: { color: C.cardBg },
      line: { color: C.border, width: 1 },
      rectRadius: 0.08
    });

    s.addShape('oval', {
      x: cx + 0.15, y: cy + 0.15, w: 0.35, h: 0.35,
      fill: { color: C.cardGreenBg },
      line: { color: C.primary, width: 1 }
    });
    s.addText(c.num, {
      x: cx + 0.15, y: cy + 0.15, w: 0.35, h: 0.35,
      fontSize: 11, bold: true, color: C.primary, align: 'center', valign: 'middle', fontFace: 'Calibri'
    });

    s.addText(c.title, {
      x: cx + 0.65, y: cy + 0.15, w: 3.3, h: 0.3,
      fontSize: 12, bold: true, color: C.primaryDark, fontFace: 'Calibri'
    });
    s.addText(c.desc, {
      x: cx + 0.65, y: cy + 0.48, w: 3.3, h: 0.62,
      fontSize: 10, color: C.bodyText, fontFace: 'Calibri', lineSpacingMultiple: 1.15
    });
  });

  // Bottom Key Note
  s.addShape('roundRect', {
    x: 0.8, y: 4.55, w: 8.4, h: 0.5,
    fill: { color: C.cardGreenBg },
    line: { color: C.primary, width: 1 },
    rectRadius: 0.06
  });
  s.addText('Key Design Decision: We use explainable mathematical scoring rather than generative chatbots, ensuring deterministic, auditable decisions for agricultural commerce.', {
    x: 0.9, y: 4.55, w: 8.2, h: 0.5,
    fontSize: 10, bold: true, color: C.primary, align: 'center', valign: 'middle', fontFace: 'Calibri'
  });

  s.addNotes('We designed four specialized decision engines for matching, demand forecasting, shelf-life monitoring, and route optimization. We deliberately avoid black-box chatbots so that every recommendation has clear, auditable reasoning.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 11: BUYER-FARMER MATCHING ENGINE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addCleanHeader(s, '11', 'Buyer–Farmer Matching', 'Explainable multi-criteria scoring model');

  // Left Side: Clean Scoring Breakdown Table
  s.addShape('roundRect', {
    x: 0.8, y: 1.75, w: 4.8, h: 3.3,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText('WEIGHTED MATCHING FACTORS (SUM = 100%)', {
    x: 0.95, y: 1.9, w: 4.5, h: 0.25,
    fontSize: 9.5, bold: true, color: C.primary, fontFace: 'Calibri'
  });

  const factors = [
    { name: 'Price Compatibility', weight: '25%', rule: 'Buyer offer vs farmer minimum price' },
    { name: 'Quality Grade Match', weight: '20%', rule: 'Exact or compatible quality grade' },
    { name: 'Quantity Fulfillment', weight: '20%', rule: 'Proportion of buyer order satisfied' },
    { name: 'Location Proximity', weight: '15%', rule: 'Haversine distance between farm and buyer' },
    { name: 'Date Suitability', weight: '10%', rule: 'Harvest readiness vs delivery deadline' },
    { name: 'Farmer Reliability', weight: '10%', rule: 'Historical fulfillment track record' }
  ];

  factors.forEach((f, idx) => {
    const fy = 2.25 + idx * 0.44;
    s.addText(`• ${f.name} (${f.weight}): `, {
      x: 0.95, y: fy, w: 2.2, h: 0.35,
      fontSize: 10, bold: true, color: C.primaryDark, fontFace: 'Calibri'
    });
    s.addText(f.rule, {
      x: 3.15, y: fy, w: 2.3, h: 0.35,
      fontSize: 9.5, color: C.bodyText, fontFace: 'Calibri'
    });
  });

  // Right Side: Simple Explainable Output Box
  s.addShape('roundRect', {
    x: 5.9, y: 1.75, w: 3.3, h: 3.3,
    fill: { color: C.white },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText('EXPLAINABLE RECOMMENDATION OUTPUT', {
    x: 6.05, y: 1.9, w: 3.0, h: 0.25,
    fontSize: 9.5, bold: true, color: C.primary, fontFace: 'Calibri'
  });

  s.addShape('roundRect', {
    x: 6.1, y: 2.25, w: 2.9, h: 0.55,
    fill: { color: C.cardGreenBg },
    line: { color: C.primary, width: 1 },
    rectRadius: 0.06
  });
  s.addText('Match Score: 92 / 100\nCrop: Tomato  •  Buyer: FreshMart Pvt Ltd', {
    x: 6.1, y: 2.25, w: 2.9, h: 0.55,
    fontSize: 9.5, bold: true, color: C.primary, align: 'center', valign: 'middle', fontFace: 'Calibri'
  });

  s.addText('Explanation Provided to Farmer:', {
    x: 6.1, y: 2.95, w: 2.9, h: 0.25,
    fontSize: 9, bold: true, color: C.primaryDark, fontFace: 'Calibri'
  });
  s.addText('✔ Crop grade matches requirement (Grade A)\n✔ Location within 50 km of buyer hub\n✔ Batch satisfies 100% of order volume\n✔ Offered price (₹30) exceeds min price (₹25)', {
    x: 6.1, y: 3.25, w: 2.9, h: 1.5,
    fontSize: 9.5, color: C.bodyText, fontFace: 'Calibri', lineSpacingMultiple: 1.2
  });

  s.addNotes('Our matching algorithm combines six weighted factors totaling 100%. The system outputs both a match score and clear, understandable explanations so farmers know why a buyer was recommended.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 12: DEMAND FORECASTING & SHELF-LIFE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addCleanHeader(s, '12', 'Demand Forecast & Shelf-Life', 'Predicting market trends and preventing post-harvest wastage');

  // Left Column: Demand Forecasting Flow
  s.addShape('roundRect', {
    x: 0.8, y: 1.75, w: 4.0, h: 3.3,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText('DEMAND FORECASTING FLOW', {
    x: 1.0, y: 1.9, w: 3.6, h: 0.25,
    fontSize: 10, bold: true, color: C.primary, fontFace: 'Calibri'
  });

  const dSteps = [
    '1. Historical Mandi & Order Data',
    '2. Weighted Moving Average & Trend Slope',
    '3. Projected Demand Level (Rising / Stable / Falling)',
    '4. Expected Price Bands (Min – Max ₹/kg)'
  ];
  dSteps.forEach((st, idx) => {
    const dy = 2.25 + idx * 0.55;
    s.addShape('roundRect', {
      x: 1.0, y: dy, w: 3.6, h: 0.42,
      fill: { color: C.white },
      line: { color: C.border, width: 1 },
      rectRadius: 0.05
    });
    s.addText(st, {
      x: 1.0, y: dy, w: 3.6, h: 0.42,
      fontSize: 9.5, color: C.primaryDark, bold: true, align: 'center', valign: 'middle', fontFace: 'Calibri'
    });
  });
  s.addText('Outcome: Helps farmers plant crops backed by commercial demand signals.', {
    x: 1.0, y: 4.55, w: 3.6, h: 0.4,
    fontSize: 9, color: C.mutedText, fontFace: 'Calibri'
  });

  // Right Column: Shelf-Life Spoilage Flow
  s.addShape('roundRect', {
    x: 5.2, y: 1.75, w: 4.0, h: 3.3,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText('SHELF-LIFE & SPOILAGE PREVENTION', {
    x: 5.4, y: 1.9, w: 3.6, h: 0.25,
    fontSize: 10, bold: true, color: C.primary, fontFace: 'Calibri'
  });

  const sSteps = [
    '1. Harvest Date + Commodity Shelf-Life Rules',
    '2. Calculate Remaining Shelf Life (RSL %)',
    '3. Risk Classification: Fresh / Attention / Critical',
    '4. Action: Markdown / Instant Buyer Match / Pickup'
  ];
  sSteps.forEach((st, idx) => {
    const sy = 2.25 + idx * 0.55;
    s.addShape('roundRect', {
      x: 5.4, y: sy, w: 3.6, h: 0.42,
      fill: { color: C.white },
      line: { color: C.border, width: 1 },
      rectRadius: 0.05
    });
    s.addText(st, {
      x: 5.4, y: sy, w: 3.6, h: 0.42,
      fontSize: 9.5, color: C.primaryDark, bold: true, align: 'center', valign: 'middle', fontFace: 'Calibri'
    });
  });
  s.addText('Outcome: Prevents crop spoilage by triggering early sales interventions.', {
    x: 5.4, y: 4.55, w: 3.6, h: 0.4,
    fontSize: 9, color: C.mutedText, fontFace: 'Calibri'
  });

  s.addNotes('This slide shows our dual analytics: the Demand Forecasting flow projects future volume and price bands from historical data, while the Shelf-Life flow calculates freshness decay to trigger discounts and urgent pickups before crops spoil.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 13: ROUTE OPTIMIZATION
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addCleanHeader(s, '13', 'Route & Pickup Optimization', 'Heuristic multi-stop pickup planning for rural transporters');

  // Top Process Pipeline
  const rStages = [
    { title: '1. Open Pickups', sub: 'Ready orders pooled' },
    { title: '2. Capacity Check', sub: 'Truck payload limit' },
    { title: '3. Urgency Weighting', sub: 'Perishable crops first' },
    { title: '4. Optimized Stops', sub: 'Shortest transit path' },
    { title: '5. Hub Delivery', sub: 'Single consolidated trip' }
  ];

  rStages.forEach((rs, idx) => {
    const rx = 0.8 + idx * 1.72;
    s.addShape('roundRect', {
      x: rx, y: 1.75, w: 1.55, h: 0.95,
      fill: { color: C.cardBg },
      line: { color: C.border, width: 1 },
      rectRadius: 0.06
    });
    s.addText(rs.title, {
      x: rx + 0.05, y: 1.88, w: 1.45, h: 0.28,
      fontSize: 9, bold: true, color: C.primaryDark, align: 'center', fontFace: 'Calibri'
    });
    s.addText(rs.sub, {
      x: rx + 0.05, y: 2.2, w: 1.45, h: 0.25,
      fontSize: 8, color: C.mutedText, align: 'center', fontFace: 'Calibri'
    });
  });

  // Middle Content: Key Principles
  s.addText([
    { text: '• Multi-Stop Pickup Planning: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Combines multiple small farm orders along the same transit corridor into a single consolidated trip.\n\n', options: { color: C.bodyText } },
    { text: '• Vehicle Capacity Constraint: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Ensures total cargo load across stops does not exceed rated vehicle payload capacity (∑ Q_i ≤ C_truck).\n\n', options: { color: C.bodyText } },
    { text: '• Perishability Priority: ', options: { bold: true, color: C.primaryDark } },
    { text: 'Batches flagged as "Critical" by the Shelf-Life Agent are scheduled for earlier pickup to avoid transit spoilage.', options: { color: C.bodyText } }
  ], {
    x: 0.8, y: 2.95, w: 8.4, h: 1.5,
    fontSize: 11, fontFace: 'Calibri', lineSpacingMultiple: 1.15
  });

  // Bottom Trip Example Banner
  s.addShape('roundRect', {
    x: 0.8, y: 4.4, w: 8.4, h: 0.65,
    fill: { color: C.cardGreenBg },
    line: { color: C.primary, width: 1 },
    rectRadius: 0.06
  });
  s.addText('Consolidated Trip Example: Depot ➔ Farm A (800 kg, High Urgency) ➔ Farm B (1,200 kg) ➔ Buyer Warehouse (2,000 kg total, 84 km)', {
    x: 0.9, y: 4.4, w: 8.2, h: 0.65,
    fontSize: 10, bold: true, color: C.primary, align: 'center', valign: 'middle', fontFace: 'Calibri'
  });

  s.addNotes('Our route optimization groups farm orders into multi-stop trips while checking truck weight limits. Crucially, orders marked as perishable or critical are given pickup priority to reduce post-harvest losses.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 14: END-TO-END WORKFLOW & TRACEABILITY
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addCleanHeader(s, '14', 'End-to-End Workflow & Traceability', 'Complete transaction lifecycle linking all entities and milestones');

  // Step Chain: 8 clean horizontal blocks
  const steps = [
    { num: '1', name: 'Crop\nListed' },
    { num: '2', name: 'Booking\nPlaced' },
    { num: '3', name: 'Farmer\nAccepts' },
    { num: '4', name: 'Ready for\nPickup' },
    { num: '5', name: 'Transporter\nAccepts' },
    { num: '6', name: 'In\nTransit' },
    { num: '7', name: 'Delivered\nConfirmed' },
    { num: '8', name: 'Payment &\nTrace Log' }
  ];

  steps.forEach((st, idx) => {
    const sx = 0.8 + idx * 1.07;
    s.addShape('roundRect', {
      x: sx, y: 1.75, w: 0.95, h: 1.05,
      fill: { color: C.cardBg },
      line: { color: C.border, width: 1 },
      rectRadius: 0.06
    });
    s.addShape('oval', {
      x: sx + 0.35, y: 1.85, w: 0.25, h: 0.25,
      fill: { color: C.cardGreenBg },
      line: { color: C.primary, width: 1 }
    });
    s.addText(st.num, {
      x: sx + 0.35, y: 1.85, w: 0.25, h: 0.25,
      fontSize: 9, bold: true, color: C.primary, align: 'center', valign: 'middle', fontFace: 'Calibri'
    });
    s.addText(st.name, {
      x: sx + 0.05, y: 2.15, w: 0.85, h: 0.55,
      fontSize: 8.5, bold: true, color: C.primaryDark, align: 'center', valign: 'middle', fontFace: 'Calibri'
    });
  });

  // Lower Section: 2 Clean Explanatory Boxes
  // Left: Entity Connection
  s.addShape('roundRect', {
    x: 0.8, y: 3.05, w: 4.1, h: 1.95,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText('RELATIONAL ENTITY LINKAGE', {
    x: 0.95, y: 3.2, w: 3.8, h: 0.25,
    fontSize: 10, bold: true, color: C.primary, fontFace: 'Calibri'
  });
  s.addText('• Crop ID ➔ Stored batch and available quantity\n• Booking ID ➔ Linked buyer reservation\n• Order ID ➔ Fulfillment status and timeline\n• PickupRequest ID ➔ Assigned driver\n• Payment ID ➔ Settlement record\n• All entities remain connected across the lifecycle.', {
    x: 0.95, y: 3.5, w: 3.8, h: 1.35,
    fontSize: 9.5, color: C.bodyText, fontFace: 'Calibri', lineSpacingMultiple: 1.15
  });

  // Right: Traceability Log
  s.addShape('roundRect', {
    x: 5.1, y: 3.05, w: 4.1, h: 1.95,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText('AUDIT TRACEABILITY LEDGER', {
    x: 5.25, y: 3.2, w: 3.8, h: 0.25,
    fontSize: 10, bold: true, color: C.primary, fontFace: 'Calibri'
  });
  s.addText('• Events logged: HARVESTED, QUALITY_CHECKED, BOOKED, PICKUP_SCHEDULED, IN_TRANSIT, DELIVERED, PAID.\n• Idempotent event creation via traceabilityService.js.\n• Records exact timestamp, actor ID, and location.\n• Guarantees provenance and transparency for buyers.', {
    x: 5.25, y: 3.5, w: 3.8, h: 1.35,
    fontSize: 9.5, color: C.bodyText, fontFace: 'Calibri', lineSpacingMultiple: 1.15
  });

  s.addNotes('This slide illustrates the full transaction lifecycle. From crop listing to payment, every stage updates connected database models and commits milestone events to our traceability log.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 15: CONCLUSION & FUTURE SCOPE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addCleanHeader(s, '15', 'Conclusion & Future Scope', 'Summary of implemented achievements and planned enhancements');

  // Left Side: Implemented Achievements
  s.addShape('roundRect', {
    x: 0.8, y: 1.75, w: 4.1, h: 2.3,
    fill: { color: C.cardBg },
    line: { color: C.primary, width: 1 },
    rectRadius: 0.08
  });
  s.addText('CURRENT IMPLEMENTED ACHIEVEMENTS', {
    x: 1.0, y: 1.9, w: 3.7, h: 0.25,
    fontSize: 10, bold: true, color: C.primary, fontFace: 'Calibri'
  });
  s.addText('✔ Unified full-stack SaaS platform (React 18 + Node/Express)\n✔ JWT-based Role-Based Access Control for all roles\n✔ Complete Order-to-Pickup state machine with atomic locks\n✔ Explainable multi-factor scoring for buyer-crop matching\n✔ Shelf-life perishability risk monitoring and alerts\n✔ Milestone-based audit traceability logging in MongoDB', {
    x: 1.0, y: 2.2, w: 3.7, h: 1.7,
    fontSize: 9.5, color: C.bodyText, fontFace: 'Calibri', lineSpacingMultiple: 1.2
  });

  // Right Side: Future Scope
  s.addShape('roundRect', {
    x: 5.1, y: 1.75, w: 4.1, h: 2.3,
    fill: { color: C.cardBg },
    line: { color: C.border, width: 1 },
    rectRadius: 0.08
  });
  s.addText('PLANNED FUTURE ENHANCEMENTS', {
    x: 5.3, y: 1.9, w: 3.7, h: 0.25,
    fontSize: 10, bold: true, color: C.primaryDark, fontFace: 'Calibri'
  });
  s.addText('➤ Machine Learning: Train LSTM / ARIMA models on national mandi price datasets\n➤ Real-Time GPS Tracking: Integrate hardware telematics and live map routing APIs\n➤ Blockchain Anchoring: Store traceability hashes on public smart contracts\n➤ Payment Gateway: Escrow processing with automated release on verified delivery\n➤ Mobile Application: Offline-first PWA with regional languages', {
    x: 5.3, y: 2.2, w: 3.7, h: 1.7,
    fontSize: 9.5, color: C.bodyText, fontFace: 'Calibri', lineSpacingMultiple: 1.2
  });

  // Bottom Conclusion
  s.addShape('roundRect', {
    x: 0.8, y: 4.25, w: 8.4, h: 0.8,
    fill: { color: C.cardGreenBg },
    line: { color: C.primary, width: 1 },
    rectRadius: 0.08
  });
  s.addText([
    { text: 'Final Conclusion: ', options: { bold: true, color: C.primary } },
    { text: 'AgriFlow AI demonstrates a functional, practical engineering solution that bridges agricultural supply-chain silos. By pairing direct commerce with explainable decision support and coordinated logistics, the platform reduces food wastage and empowers rural farmers.', options: { color: C.primaryDark } }
  ], {
    x: 1.0, y: 4.35, w: 8.0, h: 0.6,
    fontSize: 10, fontFace: 'Calibri', lineSpacingMultiple: 1.15
  });

  s.addNotes('To conclude, AgriFlow AI provides a viable engineering blueprint for agricultural logistics. We have built the complete full-stack foundation, state machine, and explainable decision stubs. In our future scope, we plan to incorporate ML models, live GPS, and blockchain anchoring. Thank you, and we welcome your questions.');
}

// ── Output Generation ────────────────────────────────────────────────────────
const path1 = path.resolve(__dirname, '../../AgriFlow_AI_Smart_Agricultural_Supply_Chain_Platform.pptx');
const path2 = path.resolve(__dirname, '../../AgriFlow_AI_Presentation_Updated.pptx');

Promise.all([
  pres.writeFile({ fileName: path1 }),
  pres.writeFile({ fileName: path2 })
])
  .then(() => {
    console.log(`SUCCESS: Both PowerPoint presentations generated successfully!`);
    console.log(`File 1: ${path1}`);
    console.log(`File 2: ${path2}`);
  })
  .catch(err => {
    console.error('ERROR generating presentations:', err);
    process.exit(1);
  });
