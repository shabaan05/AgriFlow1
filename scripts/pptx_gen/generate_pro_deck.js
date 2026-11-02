const pptxgen = require('pptxgenjs');
const path = require('path');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10.0 x 5.625 inches
pres.author = 'Shabaan Satarkar, Aryan Mhetre, Om Khade, Prathmesh Sargar';
pres.company = 'D.Y Patil College Of Engineering And Technology';
pres.title = 'AgriFlow AI – Smart Agricultural Supply Chain SaaS Platform';
pres.subject = 'B.Tech Final Year Major Project Presentation (2026-2027)';

// ── Refined Professional Academic Theme Palette ──────────────────────────────
const T = {
  // Backgrounds
  canvasBg:       'F8FAFC', // Slate 50 (Ultra clean modern off-white)
  cardWhite:      'FFFFFF', // Pure White for elevated cards
  cardTintGreen:  'F0FDF4', // Emerald 50
  cardTintBlue:   'F0F9FF', // Sky 50
  cardTintAmber:  'FFFBEB', // Amber 50
  darkBg:         '06281B', // Deep Luxury Forest / Emerald (Title slide)
  darkCard:       '0A3D29', // Card on dark background
  codeBg:         '0F172A', // Slate 900 for terminal / JSON boxes

  // Primary & Accent Brand Colors
  brandGreen:     '0D6938', // Deep Agri Green (Authoritative & Professional)
  brandLightGreen:'10B981', // Emerald 500 (Vibrant accent)
  brandDarkGreen: '064E2B', // Forest 900
  brandMint:      'DCFCE7', // Emerald 100 for tag pills
  accentBlue:     '0284C7', // Sky 600
  accentBluePill: 'E0F2FE', // Sky 100
  accentAmber:    'D97706', // Amber 600
  accentAmberPill:'FEF3C7', // Amber 100
  accentRed:      'DC2626', // Red 600
  accentRedPill:  'FEE2E2', // Red 100
  accentPurple:   '7C3AED', // Violet 600
  accentPurplePill:'EDE9FE',// Violet 100

  // Text Hierarchy
  textTitle:      '0F172A', // Slate 900 (High-contrast, crisp heading)
  textSub:        '475569', // Slate 600
  textBody:       '334155', // Slate 700
  textMuted:      '64748B', // Slate 500
  textLight:      '94A3B8', // Slate 400

  // Borders & Lines
  borderSubtle:   'E2E8F0', // Slate 200
  borderMedium:   'CBD5E1', // Slate 300
  borderGreen:    'A7F3D0', // Emerald 200
  borderBlue:     'BAE6FD', // Sky 200
  borderAmber:    'FDE68A', // Amber 200

  // Typography
  fontMain:       'Segoe UI',
  fontMono:       'Consolas'
};

// ── Standard Master Slide Frame ──────────────────────────────────────────────
function addMasterFrame(slide, slideNum, category, title, subtitle) {
  slide.background = { color: T.canvasBg };

  // Top Category Pill
  slide.addShape('roundRect', {
    x: 0.8, y: 0.38, w: 2.6, h: 0.26,
    fill: { color: T.brandMint },
    line: { color: T.brandGreen, width: 1 },
    rectRadius: 0.06
  });
  slide.addText(`AGRIFLOW AI  •  ${category.toUpperCase()}`, {
    x: 0.8, y: 0.38, w: 2.6, h: 0.26,
    fontSize: 7.5, bold: true, color: T.brandDarkGreen, align: 'center', valign: 'middle', fontFace: T.fontMain
  });

  // Slide Number Counter Pill (Top-Right)
  slide.addShape('roundRect', {
    x: 8.1, y: 0.38, w: 1.1, h: 0.26,
    fill: { color: T.cardWhite },
    line: { color: T.borderMedium, width: 1 },
    rectRadius: 0.06
  });
  slide.addText(`SLIDE ${slideNum}/15`, {
    x: 8.1, y: 0.38, w: 1.1, h: 0.26,
    fontSize: 7.5, bold: true, color: T.textSub, align: 'center', valign: 'middle', fontFace: T.fontMain
  });

  // Main Slide Title
  slide.addText(title, {
    x: 0.8, y: 0.68, w: 8.4, h: 0.45,
    fontSize: 20, bold: true, color: T.textTitle, fontFace: T.fontMain, valign: 'middle'
  });

  // Technical Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8, y: 1.12, w: 8.4, h: 0.28,
      fontSize: 10.5, color: T.textSub, fontFace: T.fontMain, valign: 'middle'
    });
  }

  // Accent Horizontal Divider
  slide.addShape('line', {
    x: 0.8, y: 1.44, w: 8.4, h: 0,
    line: { color: T.borderSubtle, width: 1.2 }
  });

  // Bottom Footer
  slide.addShape('line', {
    x: 0.8, y: 5.22, w: 8.4, h: 0,
    line: { color: T.borderSubtle, width: 1 }
  });
  slide.addText('AgriFlow AI — Smart Agricultural Supply Chain SaaS Platform', {
    x: 0.8, y: 5.26, w: 4.2, h: 0.25,
    fontSize: 8, color: T.textMuted, fontFace: T.fontMain
  });
  slide.addText('D.Y Patil College Of Engineering And Technology  •  Dept. of CSE', {
    x: 4.8, y: 5.26, w: 4.4, h: 0.25,
    fontSize: 8, color: T.textMuted, align: 'right', fontFace: T.fontMain
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 01: TITLE SLIDE (Executive Academic Dark Forest Theme)
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: T.darkBg };

  // Subtle Header Pill
  s.addShape('roundRect', {
    x: 0.8, y: 0.50, w: 2.8, h: 0.26,
    fill: { color: '0A422D' },
    line: { color: T.brandLightGreen, width: 1 },
    rectRadius: 0.08
  });
  s.addText('B.TECH MAJOR PROJECT DEFENSE', {
    x: 0.8, y: 0.50, w: 2.8, h: 0.26,
    fontSize: 8.5, bold: true, color: '6EE7B7', align: 'center', valign: 'middle', fontFace: T.fontMain
  });

  // Main Project Title
  s.addText('AgriFlow AI', {
    x: 0.8, y: 0.82, w: 8.4, h: 0.65,
    fontSize: 34, bold: true, color: T.cardWhite, fontFace: T.fontMain
  });

  // Subtitle
  s.addText('Smart Agricultural Supply Chain SaaS Platform', {
    x: 0.8, y: 1.48, w: 8.4, h: 0.38,
    fontSize: 17, bold: true, color: 'A7F3D0', fontFace: T.fontMain
  });

  // Tagline
  s.addText('An Integrated Multi-Stakeholder B2B Logistics & Decision-Support System', {
    x: 0.8, y: 1.88, w: 8.4, h: 0.30,
    fontSize: 10.5, color: 'D1FAE5', fontFace: T.fontMain
  });

  // 4 Stakeholder Badges
  const badges = [
    { name: 'Farmer Portal', icon: '🌾' },
    { name: 'Buyer Marketplace', icon: '🏢' },
    { name: 'Transporter Logistics', icon: '🚛' },
    { name: 'System Admin', icon: '⚙️' }
  ];
  badges.forEach((b, i) => {
    const bx = 0.8 + i * 2.15;
    s.addShape('roundRect', {
      x: bx, y: 2.28, w: 2.05, h: 0.34,
      fill: { color: '0E4E35' },
      line: { color: '34D399', width: 1 },
      rectRadius: 0.06
    });
    s.addText(`${b.icon}  ${b.name}`, {
      x: bx, y: 2.28, w: 2.05, h: 0.34,
      fontSize: 8.5, bold: true, color: T.cardWhite, align: 'center', valign: 'middle', fontFace: T.fontMain
    });
  });

  // Left Card: Candidates (All 4 Students)
  s.addShape('roundRect', {
    x: 0.8, y: 2.78, w: 4.15, h: 2.05,
    fill: { color: T.darkCard },
    line: { color: '10B981', width: 1 },
    rectRadius: 0.08
  });
  s.addText('PROJECT CANDIDATES', {
    x: 1.0, y: 2.88, w: 3.75, h: 0.22,
    fontSize: 9, bold: true, color: '6EE7B7', fontFace: T.fontMain
  });
  s.addText([
    { text: '1. Shabaan Ramjan Satarkar\n', options: { color: T.cardWhite, bold: true } },
    { text: '2. Aryan Sunil Mhetre\n', options: { color: T.cardWhite, bold: true } },
    { text: '3. Om Rajeshwar Khade\n', options: { color: T.cardWhite, bold: true } },
    { text: '4. Prathmesh Devappa Sargar\n', options: { color: T.cardWhite, bold: true } },
    { text: 'Degree: ', options: { color: 'A7F3D0', bold: true } },
    { text: 'B.Tech in Computer Science & Engineering', options: { color: 'E2E8F0' } }
  ], {
    x: 1.0, y: 3.12, w: 3.75, h: 1.62,
    fontSize: 9, fontFace: T.fontMain, lineSpacingMultiple: 1.15
  });

  // Right Card: Guide, College & Session
  s.addShape('roundRect', {
    x: 5.05, y: 2.78, w: 4.15, h: 2.05,
    fill: { color: T.darkCard },
    line: { color: '10B981', width: 1 },
    rectRadius: 0.08
  });
  s.addText('SUPERVISION & INSTITUTION', {
    x: 5.25, y: 2.88, w: 3.75, h: 0.22,
    fontSize: 9, bold: true, color: '6EE7B7', fontFace: T.fontMain
  });
  s.addText([
    { text: '• Project Guide: ', options: { color: 'A7F3D0', bold: true } },
    { text: 'Prof. G.V. Patil\n', options: { color: T.cardWhite, bold: true } },
    { text: '• Department: ', options: { color: 'A7F3D0', bold: true } },
    { text: 'Computer Science & Engineering\n', options: { color: 'E2E8F0' } },
    { text: '• College: ', options: { color: 'A7F3D0', bold: true } },
    { text: 'D.Y Patil College Of Engineering And Technology\n', options: { color: T.cardWhite, bold: true } },
    { text: '• Academic Session: ', options: { color: 'A7F3D0', bold: true } },
    { text: '2026 – 2027', options: { color: '6EE7B7', bold: true } }
  ], {
    x: 5.25, y: 3.12, w: 3.75, h: 1.62,
    fontSize: 8.8, fontFace: T.fontMain, lineSpacingMultiple: 1.15
  });

  // Footer Tech Bar
  s.addText('React 18  •  Node.js  •  Express.js  •  MongoDB Atlas  •  JWT RBAC  •  Explainable Decision Support', {
    x: 0.8, y: 4.98, w: 8.4, h: 0.25,
    fontSize: 8, color: '94A3B8', align: 'center', fontFace: T.fontMain
  });

  s.addNotes('Respected project guide Prof. G.V. Patil and external examiners, good morning. We are final-year B.Tech students from D.Y Patil College Of Engineering And Technology. Today we present our major project: AgriFlow AI, a smart agricultural supply chain platform connecting farmers, buyers, and transporters with explainable decision-support algorithms.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 02: PROBLEM STATEMENT
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addMasterFrame(s, '02', 'Problem Analysis', 'Problem Statement: Agricultural Supply Chain Inefficiencies', 'Structural vulnerabilities across demand forecasting, farm-gate logistics, and price discovery');

  // Left Side: 5 Structured Points in a Clean Card
  s.addShape('roundRect', {
    x: 0.8, y: 1.62, w: 5.3, h: 3.42,
    fill: { color: T.cardWhite },
    line: { color: T.borderSubtle, width: 1 },
    rectRadius: 0.08
  });

  s.addText([
    { text: '• Demand Uncertainty: ', options: { bold: true, color: T.textTitle } },
    { text: 'Farmers cultivate crops based on intuition without commercial demand signals, leading to gluts and price crashes.\n\n', options: { color: T.textBody } },
    { text: '• Buyer Discovery: ', options: { bold: true, color: T.textTitle } },
    { text: 'Producers struggle to access bulk buyers directly; 4–6 tiers of middlemen capture 35%–50% profit margins.\n\n', options: { color: T.textBody } },
    { text: '• High Food Wastage: ', options: { bold: true, color: T.textTitle } },
    { text: 'Perishable commodities spoil rapidly without freshness monitoring or synchronized dispatch.\n\n', options: { color: T.textBody } },
    { text: '• Transport Inefficiency: ', options: { bold: true, color: T.textTitle } },
    { text: 'Rural logistics is unorganized, lacks route coordination, and suffers from empty return legs.\n\n', options: { color: T.textBody } },
    { text: '• Traceability Deficit: ', options: { bold: true, color: T.textTitle } },
    { text: 'No tamper-evident provenance or milestone records from farm gate to buyer warehouse.', options: { color: T.textBody } }
  ], {
    x: 1.0, y: 1.78, w: 4.9, h: 3.10,
    fontSize: 10, fontFace: T.fontMain, lineSpacingMultiple: 1.15
  });

  // Right Side: Visual Flow Box
  s.addShape('roundRect', {
    x: 6.3, y: 1.62, w: 2.9, h: 3.42,
    fill: { color: T.cardWhite },
    line: { color: T.borderSubtle, width: 1 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 6.45, y: 1.78, w: 2.6, h: 0.28,
    fill: { color: T.accentRedPill },
    rectRadius: 0.05
  });
  s.addText('CURRENT FAILURE CYCLE', {
    x: 6.45, y: 1.78, w: 2.6, h: 0.28,
    fontSize: 7.5, bold: true, color: T.accentRed, align: 'center', valign: 'middle', fontFace: T.fontMain
  });

  const failureChain = [
    { title: 'Speculative Sowing', sub: 'Zero forward visibility' },
    { title: 'Opaque Middlemen', sub: '35-50% value extracted' },
    { title: 'Post-Harvest Spoilage', sub: 'Perishability losses' },
    { title: 'Unplanned Transport', sub: 'Delayed pickup & high cost' },
    { title: 'Zero Traceability', sub: 'Opaque provenance history' }
  ];

  failureChain.forEach((step, idx) => {
    const fy = 2.18 + idx * 0.54;
    s.addShape('roundRect', {
      x: 6.45, y: fy, w: 2.6, h: 0.44,
      fill: { color: T.canvasBg },
      line: { color: T.borderSubtle, width: 1 },
      rectRadius: 0.05
    });
    s.addText(step.title, {
      x: 6.5, y: fy + 0.04, w: 2.5, h: 0.20,
      fontSize: 9, bold: true, color: T.textTitle, align: 'center', fontFace: T.fontMain
    });
    s.addText(step.sub, {
      x: 6.5, y: fy + 0.24, w: 2.5, h: 0.16,
      fontSize: 7.5, color: T.textMuted, align: 'center', fontFace: T.fontMain
    });
  });

  s.addNotes('Agricultural supply chains face five core issues: farmers cultivate crops without forward demand signals, middlemen capture 35-50% margins, perishable crops suffer heavy post-harvest wastage, transport is fragmented, and there is no verified traceability.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 03: PROPOSED SOLUTION
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addMasterFrame(s, '03', 'Proposed Architecture', 'Proposed Solution: The AgriFlow AI Platform Paradigm', 'A closed-loop, data-driven B2B ecosystem connecting supply, demand, logistics, and intelligence');

  // Architectural Network Diagram
  s.addShape('roundRect', {
    x: 3.5, y: 1.65, w: 3.0, h: 1.35,
    fill: { color: T.cardTintGreen },
    line: { color: T.brandGreen, width: 2 },
    rectRadius: 0.1
  });
  s.addText('AGRIFLOW AI CORE PLATFORM', {
    x: 3.6, y: 1.80, w: 2.8, h: 0.3,
    fontSize: 11, bold: true, color: T.brandDarkGreen, align: 'center', fontFace: T.fontMain
  });
  s.addText('• Multi-Criteria Matching Engine\n• Demand Trend Aggregator\n• Shelf-Life Decay Monitor\n• Farm-Gate Route Planner', {
    x: 3.6, y: 2.15, w: 2.8, h: 0.75,
    fontSize: 8.5, color: T.textBody, align: 'center', fontFace: T.fontMain, lineSpacingMultiple: 1.15
  });

  // Left: Farmer
  s.addShape('roundRect', {
    x: 0.8, y: 1.85, w: 2.0, h: 0.95,
    fill: { color: T.cardWhite },
    line: { color: T.borderMedium, width: 1.2 },
    rectRadius: 0.08
  });
  s.addText('🌾 FARMER', {
    x: 0.8, y: 1.95, w: 2.0, h: 0.3,
    fontSize: 11, bold: true, color: T.brandGreen, align: 'center', fontFace: T.fontMain
  });
  s.addText('Crop Inventory & Staging', {
    x: 0.8, y: 2.30, w: 2.0, h: 0.35,
    fontSize: 8.5, color: T.textMuted, align: 'center', fontFace: T.fontMain
  });
  s.addText('◄──────►', {
    x: 2.8, y: 2.20, w: 0.7, h: 0.3,
    fontSize: 11, bold: true, color: T.brandGreen, align: 'center', valign: 'middle'
  });

  // Right: Buyer
  s.addShape('roundRect', {
    x: 7.2, y: 1.85, w: 2.0, h: 0.95,
    fill: { color: T.cardWhite },
    line: { color: T.borderMedium, width: 1.2 },
    rectRadius: 0.08
  });
  s.addText('🏢 BUYER', {
    x: 7.2, y: 1.95, w: 2.0, h: 0.3,
    fontSize: 11, bold: true, color: T.accentBlue, align: 'center', fontFace: T.fontMain
  });
  s.addText('Demands & Bookings', {
    x: 7.2, y: 2.30, w: 2.0, h: 0.35,
    fontSize: 8.5, color: T.textMuted, align: 'center', fontFace: T.fontMain
  });
  s.addText('◄──────►', {
    x: 6.5, y: 2.20, w: 0.7, h: 0.3,
    fontSize: 11, bold: true, color: T.accentBlue, align: 'center', valign: 'middle'
  });

  // Bottom-Left: Transporter
  s.addShape('roundRect', {
    x: 1.7, y: 3.25, w: 3.1, h: 0.75,
    fill: { color: T.cardWhite },
    line: { color: T.borderMedium, width: 1.2 },
    rectRadius: 0.08
  });
  s.addText('🚛 TRANSPORTER (LOGISTICS)', {
    x: 1.7, y: 3.32, w: 3.1, h: 0.25,
    fontSize: 9.5, bold: true, color: T.accentAmber, align: 'center', fontFace: T.fontMain
  });
  s.addText('Pickup Requests & Route Optimization', {
    x: 1.7, y: 3.58, w: 3.1, h: 0.3,
    fontSize: 8, color: T.textMuted, align: 'center', fontFace: T.fontMain
  });
  s.addText('▲\n│', {
    x: 3.1, y: 3.0, w: 0.4, h: 0.25,
    fontSize: 9, bold: true, color: T.brandGreen, align: 'center', valign: 'middle'
  });

  // Bottom-Right: Admin
  s.addShape('roundRect', {
    x: 5.2, y: 3.25, w: 3.1, h: 0.75,
    fill: { color: T.cardWhite },
    line: { color: T.borderMedium, width: 1.2 },
    rectRadius: 0.08
  });
  s.addText('⚙️ SYSTEM ADMINISTRATOR', {
    x: 5.2, y: 3.32, w: 3.1, h: 0.25,
    fontSize: 9.5, bold: true, color: T.accentPurple, align: 'center', fontFace: T.fontMain
  });
  s.addText('KYC Verification, Audit & Traceability', {
    x: 5.2, y: 3.58, w: 3.1, h: 0.3,
    fontSize: 8, color: T.textMuted, align: 'center', fontFace: T.fontMain
  });
  s.addText('▲\n│', {
    x: 6.5, y: 3.0, w: 0.4, h: 0.25,
    fontSize: 9, bold: true, color: T.accentBlue, align: 'center', valign: 'middle'
  });

  // Bottom 3 Strategic Value Pillars
  const pillars = [
    { title: 'Direct Market Access', desc: 'Disintermediates trade; enables wholesale buyers and farmers to contract directly.' },
    { title: 'Explainable AI Core', desc: 'Transparent mathematical ranking with explicit rationale for matching and urgency.' },
    { title: 'Synchronized Logistics', desc: 'Event-driven pickup dispatch and tamper-evident milestone traceability.' }
  ];

  pillars.forEach((p, idx) => {
    const px = 0.8 + idx * 2.88;
    s.addShape('roundRect', {
      x: px, y: 4.18, w: 2.64, h: 0.88,
      fill: { color: T.cardWhite },
      line: { color: T.borderSubtle, width: 1 },
      rectRadius: 0.06
    });
    s.addText(p.title, {
      x: px + 0.1, y: 4.26, w: 2.44, h: 0.22,
      fontSize: 9, bold: true, color: T.brandGreen, fontFace: T.fontMain
    });
    s.addText(p.desc, {
      x: px + 0.1, y: 4.50, w: 2.44, h: 0.50,
      fontSize: 7.8, color: T.textSub, fontFace: T.fontMain, lineSpacingMultiple: 1.15
    });
  });

  s.addNotes('Our solution integrates all four stakeholders. Farmers list produce and see demand; buyers broadcast needs and book crops; transporters claim pickups; and admins oversee the system. Everything is connected through an explainable decision engine.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 04: OBJECTIVES
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addMasterFrame(s, '04', 'Engineering Scope', 'Project Objectives: Technical & Research Goals', 'Specific software engineering and decision-support targets formulated for academic capstone execution');

  const objList = [
    { num: '01', title: 'Multi-Tenant Architecture', desc: 'Build a secure, role-based platform for Farmers, Buyers, Transporters, and Admins under a unified JWT auth umbrella.' },
    { num: '02', title: 'Explainable Matching Algorithm', desc: 'Develop a 0–100 multi-criteria weighted scoring model evaluating price, quality, volume, proximity, and timeline compatibility.' },
    { num: '03', title: 'Predictive Demand Signaling', desc: 'Provide forward demand volume and price band visibility utilizing historical mandi spot prices and trend slopes.' },
    { num: '04', title: 'Shelf-Life Decay Monitoring', desc: 'Construct a freshness decay index categorizing crops into Fresh, Attention, and Critical tiers with actionable triggers.' },
    { num: '05', title: 'Automated Logistics Dispatch', desc: 'Engineer an event-driven logistics pipeline automatically spawning atomic pickup requests when orders are marked Ready.' },
    { num: '06', title: 'Audit-Grade Traceability', desc: 'Establish an immutable milestone event ledger tracking physical crop states from harvesting to delivery and settlement.' }
  ];

  objList.forEach((o, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const ox = 0.8 + col * 4.35;
    const oy = 1.62 + row * 1.12;

    s.addShape('roundRect', {
      x: ox, y: oy, w: 4.05, h: 0.98,
      fill: { color: T.cardWhite },
      line: { color: T.borderSubtle, width: 1 },
      rectRadius: 0.08
    });

    s.addShape('roundRect', {
      x: ox + 0.15, y: oy + 0.22, w: 0.50, h: 0.45,
      fill: { color: T.brandMint },
      line: { color: T.brandGreen, width: 1 },
      rectRadius: 0.06
    });
    s.addText(o.num, {
      x: ox + 0.15, y: oy + 0.22, w: 0.50, h: 0.45,
      fontSize: 11, bold: true, color: T.brandDarkGreen, align: 'center', valign: 'middle', fontFace: T.fontMain
    });

    s.addText(o.title, {
      x: ox + 0.75, y: oy + 0.12, w: 3.15, h: 0.25,
      fontSize: 10.5, bold: true, color: T.textTitle, fontFace: T.fontMain
    });
    s.addText(o.desc, {
      x: ox + 0.75, y: oy + 0.38, w: 3.15, h: 0.52,
      fontSize: 8.5, color: T.textSub, fontFace: T.fontMain, lineSpacingMultiple: 1.15
    });
  });

  s.addNotes('We defined six clear objectives: connecting all four stakeholders, implementing explainable matching, forecasting demand, monitoring shelf-life to prevent waste, optimizing transport, and recording complete milestone traceability.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 05: SYSTEM ARCHITECTURE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addMasterFrame(s, '05', 'System Architecture', 'System Architecture: 3-Tier Full-Stack Decoupled Design', 'Presentation, API routing, deterministic decision engines, and persistent document storage');

  // Tier 1: Frontend
  s.addShape('roundRect', {
    x: 0.8, y: 1.65, w: 2.45, h: 2.30,
    fill: { color: T.cardWhite },
    line: { color: T.brandGreen, width: 1.5 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 0.95, y: 1.80, w: 2.15, h: 0.30,
    fill: { color: T.brandMint },
    rectRadius: 0.05
  });
  s.addText('PRESENTATION TIER (SPA)', {
    x: 0.95, y: 1.80, w: 2.15, h: 0.30,
    fontSize: 8, bold: true, color: T.brandDarkGreen, align: 'center', valign: 'middle', fontFace: T.fontMain
  });
  s.addText('• React 18 Single Page App\n• Vite Fast Bundler\n• Tailwind CSS Utility Classes\n• React Router v6 Routing\n• Role-Protected Routes\n• Auth & Orders Context APIs', {
    x: 0.95, y: 2.22, w: 2.15, h: 1.60,
    fontSize: 9, color: T.textBody, fontFace: T.fontMain, lineSpacingMultiple: 1.2
  });

  // Connector 1
  s.addText('REST API\n(Bearer JWT)\n──────►', {
    x: 3.25, y: 2.40, w: 0.95, h: 0.8,
    fontSize: 8, bold: true, color: T.textMuted, align: 'center', fontFace: T.fontMain
  });

  // Tier 2: Backend & Decision Engines
  s.addShape('roundRect', {
    x: 4.25, y: 1.65, w: 2.65, h: 2.30,
    fill: { color: T.cardWhite },
    line: { color: T.accentBlue, width: 1.5 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 4.40, y: 1.80, w: 2.35, h: 0.30,
    fill: { color: T.accentBluePill },
    rectRadius: 0.05
  });
  s.addText('APPLICATION & API TIER', {
    x: 4.40, y: 1.80, w: 2.35, h: 0.30,
    fontSize: 8, bold: true, color: T.accentBlue, align: 'center', valign: 'middle', fontFace: T.fontMain
  });
  s.addText('• Node.js & Express.js Server\n• Stateless JWT Authentication\n• Role-Based Access Control\n• Order State Machine\n• Decision Engines (Rule Stubs)\n• Idempotent Traceability Service', {
    x: 4.40, y: 2.22, w: 2.35, h: 1.60,
    fontSize: 9, color: T.textBody, fontFace: T.fontMain, lineSpacingMultiple: 1.2
  });

  // Connector 2
  s.addText('Mongoose\nODM\n──────►', {
    x: 6.9, y: 2.40, w: 0.85, h: 0.8,
    fontSize: 8, bold: true, color: T.textMuted, align: 'center', fontFace: T.fontMain
  });

  // Tier 3: Database
  s.addShape('roundRect', {
    x: 7.8, y: 1.65, w: 1.40, h: 2.30,
    fill: { color: T.cardWhite },
    line: { color: T.accentPurple, width: 1.5 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 7.90, y: 1.80, w: 1.20, h: 0.30,
    fill: { color: T.accentPurplePill },
    rectRadius: 0.05
  });
  s.addText('DATA TIER', {
    x: 7.90, y: 1.80, w: 1.20, h: 0.30,
    fontSize: 8, bold: true, color: T.accentPurple, align: 'center', valign: 'middle', fontFace: T.fontMain
  });
  s.addText('MongoDB Atlas\nCloud Store\n\n• Users\n• Crops\n• Demands\n• Bookings\n• Orders\n• Trips\n• TraceEvents', {
    x: 7.85, y: 2.20, w: 1.30, h: 1.65,
    fontSize: 8.5, color: T.textBody, align: 'center', fontFace: T.fontMain, lineSpacingMultiple: 1.15
  });

  // Bottom Summary Box
  s.addShape('roundRect', {
    x: 0.8, y: 4.15, w: 8.4, h: 0.90,
    fill: { color: T.cardWhite },
    line: { color: T.borderSubtle, width: 1 },
    rectRadius: 0.08
  });
  s.addText([
    { text: '• Cloud Deployment Infrastructure: ', options: { bold: true, color: T.brandGreen } },
    { text: 'Frontend hosted on Vercel SPA  •  Backend deployed on Render  •  Database on MongoDB Atlas Distributed Replica Set.\n', options: { color: T.textBody } },
    { text: '• Security Architecture: ', options: { bold: true, color: T.brandGreen } },
    { text: 'Every API request is validated via Bearer JWT tokens with bcrypt password hashing and granular role enforcement.', options: { color: T.textBody } }
  ], {
    x: 1.0, y: 4.25, w: 8.0, h: 0.70,
    fontSize: 9, fontFace: T.fontMain, lineSpacingMultiple: 1.15
  });

  s.addNotes('The system follows a clean 3-tier architecture. React 18 on the frontend communicates with Node.js and Express over REST APIs using JWT authentication. MongoDB Atlas stores structured documents, and our decision engines run directly inside the backend.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 06: USER ROLES & MODULES
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addMasterFrame(s, '06', 'Role Matrix', 'User Roles & Functional Module Matrix', 'Granular access control and feature partitioning tailored to specific supply-chain workflows');

  const modules = [
    {
      role: 'Farmer Module',
      icon: '🌾',
      tag: 'ROLE: FARMER',
      tagColor: T.brandGreen, tagBg: T.brandMint,
      points: [
        'Crop inventory CRUD & batches',
        'Market demand board & prices',
        'AI Centre (Buyer match, plan)',
        'Shelf-life spoilage monitoring',
        'Order fulfillment (Ready stage)'
      ]
    },
    {
      role: 'Buyer Module',
      icon: '🏢',
      tag: 'ROLE: BUYER',
      tagColor: T.accentBlue, tagBg: T.accentBluePill,
      points: [
        'Marketplace produce discovery',
        'Broadcast procurement needs',
        'Algorithmic match recommendations',
        'Direct farm booking modal',
        'Order delivery milestone tracking'
      ]
    },
    {
      role: 'Transporter Module',
      icon: '🚛',
      tag: 'ROLE: TRANSPORTER',
      tagColor: T.accentAmber, tagBg: T.accentAmberPill,
      points: [
        'Open pickup request job board',
        'Atomic single-driver job lock',
        'Active Trips delivery pipeline',
        'Route heuristics & capacity',
        'Trip freight earnings ledger'
      ]
    },
    {
      role: 'Admin Module',
      icon: '⚙️',
      tag: 'ROLE: ADMIN',
      tagColor: T.accentPurple, tagBg: T.accentPurplePill,
      points: [
        'User KYC & farm verification',
        'System analytics & KPI metrics',
        'Order & payment audit trail',
        'Traceability ledger explorer',
        'Platform dispute resolution'
      ]
    }
  ];

  modules.forEach((m, idx) => {
    const mx = 0.8 + idx * 2.15;
    s.addShape('roundRect', {
      x: mx, y: 1.65, w: 2.05, h: 3.40,
      fill: { color: T.cardWhite },
      line: { color: T.borderSubtle, width: 1 },
      rectRadius: 0.08
    });

    s.addShape('roundRect', {
      x: mx + 0.1, y: 1.78, w: 1.85, h: 0.50,
      fill: { color: m.tagBg },
      rectRadius: 0.06
    });
    s.addText(`${m.icon} ${m.role}`, {
      x: mx + 0.1, y: 1.82, w: 1.85, h: 0.22,
      fontSize: 8.5, bold: true, color: m.tagColor, align: 'center', fontFace: T.fontMain
    });
    s.addText(m.tag, {
      x: mx + 0.1, y: 2.04, w: 1.85, h: 0.20,
      fontSize: 6.8, color: T.textMuted, align: 'center', fontFace: T.fontMain
    });

    const pText = m.points.map(pt => `• ${pt}\n`).join('\n');
    s.addText(pText, {
      x: mx + 0.15, y: 2.40, w: 1.75, h: 2.50,
      fontSize: 8.8, color: T.textBody, fontFace: T.fontMain, lineSpacingMultiple: 1.15
    });
  });

  s.addNotes('AgriFlow AI partitions features into four clear modules. Farmers manage inventory and fulfill orders; buyers discover crops and track deliveries; transporters claim pickups and manage trips; and admins monitor platform health.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 07: FARMER MODULE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addMasterFrame(s, '07', 'Stakeholder Module', 'Farmer Module: Crop Management & Demand-Linked Fulfillment', 'Empowering agricultural producers with inventory control, demand visibility, and order staging');

  s.addShape('roundRect', {
    x: 0.8, y: 1.62, w: 5.3, h: 3.42,
    fill: { color: T.cardWhite },
    line: { color: T.borderSubtle, width: 1 },
    rectRadius: 0.08
  });

  s.addText([
    { text: '• Crop Management: ', options: { bold: true, color: T.textTitle } },
    { text: 'Add, edit, and catalog crop listings with harvest dates, expected quantities, quality grades, and target prices.\n\n', options: { color: T.textBody } },
    { text: '• Market Demand Explorer: ', options: { bold: true, color: T.textTitle } },
    { text: 'Inspect forward buyer requirements and current mandi price bands before harvesting.\n\n', options: { color: T.textBody } },
    { text: '• AI Decision Centre: ', options: { bold: true, color: T.textTitle } },
    { text: 'Access explainable recommendations for matched buyers, harvest planning, and shelf-life alerts.\n\n', options: { color: T.textBody } },
    { text: '• Order Fulfillment Pipeline: ', options: { bold: true, color: T.textTitle } },
    { text: 'Review and accept buyer bookings; advance accepted orders from Confirmed ➔ Preparing ➔ Ready for Pickup.\n\n', options: { color: T.textBody } },
    { text: '• Farm Profile & Settlement Info: ', options: { bold: true, color: T.textTitle } },
    { text: 'Maintain verified farm coordinates, bank accounts, and payout notification settings.', options: { color: T.textBody } }
  ], {
    x: 1.0, y: 1.78, w: 4.9, h: 3.10,
    fontSize: 9.8, fontFace: T.fontMain, lineSpacingMultiple: 1.15
  });

  // Right Side: Staging Flow
  s.addShape('roundRect', {
    x: 6.3, y: 1.62, w: 2.9, h: 3.42,
    fill: { color: T.cardWhite },
    line: { color: T.borderSubtle, width: 1 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 6.45, y: 1.78, w: 2.6, h: 0.28,
    fill: { color: T.brandMint },
    rectRadius: 0.05
  });
  s.addText('FARMER STAGING LIFECYCLE', {
    x: 6.45, y: 1.78, w: 2.6, h: 0.28,
    fontSize: 7.5, bold: true, color: T.brandDarkGreen, align: 'center', valign: 'middle', fontFace: T.fontMain
  });

  const fStages = [
    { title: '1. Booking Placed', desc: 'Buyer reserves quantity' },
    { title: '2. Farmer Accepts', desc: 'Order confirmed & locked' },
    { title: '3. Preparing Crop', desc: 'Harvesting & packing' },
    { title: '4. Ready for Pickup', desc: 'Auto-triggers transporter job' }
  ];
  fStages.forEach((st, idx) => {
    const sy = 2.22 + idx * 0.65;
    s.addShape('roundRect', {
      x: 6.45, y: sy, w: 2.6, h: 0.52,
      fill: { color: T.canvasBg },
      line: { color: T.borderSubtle, width: 1 },
      rectRadius: 0.06
    });
    s.addText(st.title, {
      x: 6.55, y: sy + 0.06, w: 2.4, h: 0.20,
      fontSize: 9, bold: true, color: T.brandGreen, fontFace: T.fontMain
    });
    s.addText(st.desc, {
      x: 6.55, y: sy + 0.28, w: 2.4, h: 0.18,
      fontSize: 7.5, color: T.textMuted, fontFace: T.fontMain
    });
  });

  s.addNotes('In the Farmer Module, producers manage crops, inspect buyer demand, review AI recommendations, and progress orders from booking acceptance to Ready for Pickup.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 08: BUYER MODULE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addMasterFrame(s, '08', 'Stakeholder Module', 'Buyer Module: Discovery, Procurement & Delivery Tracking', 'Streamlining institutional procurement from verified farm gates with full milestone visibility');

  s.addShape('roundRect', {
    x: 0.8, y: 1.62, w: 5.3, h: 3.42,
    fill: { color: T.cardWhite },
    line: { color: T.borderSubtle, width: 1 },
    rectRadius: 0.08
  });

  s.addText([
    { text: '• Marketplace Discovery: ', options: { bold: true, color: T.textTitle } },
    { text: 'Browse active crop batches with multi-parameter filters for category, grade, location radius, and target price.\n\n', options: { color: T.textBody } },
    { text: '• Requirements Broadcasting: ', options: { bold: true, color: T.textTitle } },
    { text: 'Broadcast procurement needs (crop type, volume, target price, required deadline) to verified farmers.\n\n', options: { color: T.textBody } },
    { text: '• Direct Crop Booking: ', options: { bold: true, color: T.textTitle } },
    { text: 'Reserve crops directly with instant quantity validation to prevent overselling.\n\n', options: { color: T.textBody } },
    { text: '• Order & Delivery Tracking: ', options: { bold: true, color: T.textTitle } },
    { text: 'Monitor real-time transit status milestones from farm pickup to warehouse dock arrival.\n\n', options: { color: T.textBody } },
    { text: '• Payments & Traceability: ', options: { bold: true, color: T.textTitle } },
    { text: 'Track invoice settlements and verify complete farm-to-fork batch traceability.', options: { color: T.textBody } }
  ], {
    x: 1.0, y: 1.78, w: 4.9, h: 3.10,
    fontSize: 9.8, fontFace: T.fontMain, lineSpacingMultiple: 1.15
  });

  // Right Side: Procurement Flow
  s.addShape('roundRect', {
    x: 6.3, y: 1.62, w: 2.9, h: 3.42,
    fill: { color: T.cardWhite },
    line: { color: T.borderSubtle, width: 1 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 6.45, y: 1.78, w: 2.6, h: 0.28,
    fill: { color: T.accentBluePill },
    rectRadius: 0.05
  });
  s.addText('BUYER PROCUREMENT STAGES', {
    x: 6.45, y: 1.78, w: 2.6, h: 0.28,
    fontSize: 7.5, bold: true, color: T.accentBlue, align: 'center', valign: 'middle', fontFace: T.fontMain
  });

  const bStages = [
    { title: '1. Discover / Post', desc: 'Browse crops or broadcast need' },
    { title: '2. Reserve Quantity', desc: 'BookingModal locks stock' },
    { title: '3. Track Dispatch', desc: 'Monitor transporter transit' },
    { title: '4. Receive & Settle', desc: 'Verify batch & release payment' }
  ];
  bStages.forEach((st, idx) => {
    const sy = 2.22 + idx * 0.65;
    s.addShape('roundRect', {
      x: 6.45, y: sy, w: 2.6, h: 0.52,
      fill: { color: T.canvasBg },
      line: { color: T.borderSubtle, width: 1 },
      rectRadius: 0.06
    });
    s.addText(st.title, {
      x: 6.55, y: sy + 0.06, w: 2.4, h: 0.20,
      fontSize: 9, bold: true, color: T.accentBlue, fontFace: T.fontMain
    });
    s.addText(st.desc, {
      x: 6.55, y: sy + 0.28, w: 2.4, h: 0.18,
      fontSize: 7.5, color: T.textMuted, fontFace: T.fontMain
    });
  });

  s.addNotes('The Buyer Module allows wholesale buyers to search verified produce, broadcast procurement requirements, place immediate bookings, track delivery milestones, and inspect batch traceability.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 09: TRANSPORTER MODULE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addMasterFrame(s, '09', 'Stakeholder Module', 'Transporter Module: Rural Logistics & Trip Execution', 'Closing the first-mile and mid-mile gap through automated pickup dispatch and delivery tracking');

  s.addShape('roundRect', {
    x: 0.8, y: 1.62, w: 5.3, h: 3.42,
    fill: { color: T.cardWhite },
    line: { color: T.borderSubtle, width: 1 },
    rectRadius: 0.08
  });

  s.addText([
    { text: '• Automated Pickup Requests: ', options: { bold: true, color: T.textTitle } },
    { text: 'Orders reaching "Ready for Pickup" automatically appear on the transporter job board.\n\n', options: { color: T.textBody } },
    { text: '• Atomic Job Acceptance: ', options: { bold: true, color: T.textTitle } },
    { text: 'Transporters accept jobs with atomic database locking, preventing multiple drivers from claiming the same pickup.\n\n', options: { color: T.textBody } },
    { text: '• Delivery Lifecycle Management: ', options: { bold: true, color: T.textTitle } },
    { text: 'Drivers update trip milestones: Picked Up ➔ In Transit ➔ Delivered.\n\n', options: { color: T.textBody } },
    { text: '• Freight Earnings Ledger: ', options: { bold: true, color: T.textTitle } },
    { text: 'Automatically generates earnings records based on consignment weight and transit distance.\n\n', options: { color: T.textBody } },
    { text: '• Fleet & Vehicle Profile: ', options: { bold: true, color: T.textTitle } },
    { text: 'Maintains vehicle payload capacity and driver verification details.', options: { color: T.textBody } }
  ], {
    x: 1.0, y: 1.78, w: 4.9, h: 3.10,
    fontSize: 9.8, fontFace: T.fontMain, lineSpacingMultiple: 1.15
  });

  // Right Side: Delivery Stages
  s.addShape('roundRect', {
    x: 6.3, y: 1.62, w: 2.9, h: 3.42,
    fill: { color: T.cardWhite },
    line: { color: T.borderSubtle, width: 1 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 6.45, y: 1.78, w: 2.6, h: 0.28,
    fill: { color: T.accentAmberPill },
    rectRadius: 0.05
  });
  s.addText('TRANSPORTER WORKFLOW', {
    x: 6.45, y: 1.78, w: 2.6, h: 0.28,
    fontSize: 7.5, bold: true, color: T.accentAmber, align: 'center', valign: 'middle', fontFace: T.fontMain
  });

  const tStages = [
    { title: '1. Pickup Request', desc: 'Order marked ready by farmer' },
    { title: '2. Accept Job', desc: 'Atomic concurrency lock' },
    { title: '3. Picked Up', desc: 'Farm-gate loading confirmed' },
    { title: '4. Delivered', desc: 'Warehouse receipt & freight fee' }
  ];
  tStages.forEach((st, idx) => {
    const sy = 2.22 + idx * 0.65;
    s.addShape('roundRect', {
      x: 6.45, y: sy, w: 2.6, h: 0.52,
      fill: { color: T.canvasBg },
      line: { color: T.borderSubtle, width: 1 },
      rectRadius: 0.06
    });
    s.addText(st.title, {
      x: 6.55, y: sy + 0.06, w: 2.4, h: 0.20,
      fontSize: 9, bold: true, color: T.accentAmber, fontFace: T.fontMain
    });
    s.addText(st.desc, {
      x: 6.55, y: sy + 0.28, w: 2.4, h: 0.18,
      fontSize: 7.5, color: T.textMuted, fontFace: T.fontMain
    });
  });

  s.addNotes('The Transporter Module bridges the first-mile gap. When an order is ready, a pickup request is automatically created. Drivers accept jobs atomically, update trip milestones, and track freight earnings.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 10: AI DECISION-SUPPORT FEATURES
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addMasterFrame(s, '10', 'Intelligence Architecture', 'AI Decision-Support Architecture: Explainability by Design', 'Deterministic and explainable algorithms assisting supply-chain decisions without black-box risk');

  const aiCards = [
    {
      num: '01',
      title: 'Buyer–Farmer Matching',
      color: T.brandGreen, bg: T.brandMint,
      desc: 'Ranks buyer requirements against farmer crops using an explainable multi-factor scoring model (0–100) with explicit reasoning vectors.'
    },
    {
      num: '02',
      title: 'Demand Forecasting',
      color: T.accentBlue, bg: T.accentBluePill,
      desc: 'Analyzes historical mandi arrival data and price trends using weighted moving averages to project future volume and price bands.'
    },
    {
      num: '03',
      title: 'Shelf-Life & Wastage Prevention',
      color: T.accentAmber, bg: T.accentAmberPill,
      desc: 'Calculates remaining freshness based on crop perishability, classifying risk into Fresh, Attention, and Critical with action triggers.'
    },
    {
      num: '04',
      title: 'Route & Pickup Optimization',
      color: T.accentPurple, bg: T.accentPurplePill,
      desc: 'Clusters farm pickup requests to maximize truck capacity while prioritizing urgent perishable batches for earliest collection.'
    }
  ];

  aiCards.forEach((c, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const cx = 0.8 + col * 4.35;
    const cy = 1.62 + row * 1.32;

    s.addShape('roundRect', {
      x: cx, y: cy, w: 4.05, h: 1.18,
      fill: { color: T.cardWhite },
      line: { color: T.borderSubtle, width: 1 },
      rectRadius: 0.08
    });

    s.addShape('roundRect', {
      x: cx + 0.15, y: cy + 0.15, w: 0.45, h: 0.40,
      fill: { color: c.bg },
      rectRadius: 0.05
    });
    s.addText(c.num, {
      x: cx + 0.15, y: cy + 0.15, w: 0.45, h: 0.40,
      fontSize: 10, bold: true, color: c.color, align: 'center', valign: 'middle', fontFace: T.fontMain
    });

    s.addText(c.title, {
      x: cx + 0.70, y: cy + 0.15, w: 3.20, h: 0.28,
      fontSize: 11, bold: true, color: T.textTitle, fontFace: T.fontMain
    });
    s.addText(c.desc, {
      x: cx + 0.70, y: cy + 0.45, w: 3.20, h: 0.62,
      fontSize: 8.5, color: T.textSub, fontFace: T.fontMain, lineSpacingMultiple: 1.15
    });
  });

  // Bottom Key Callout
  s.addShape('roundRect', {
    x: 0.8, y: 4.40, w: 8.4, h: 0.65,
    fill: { color: T.cardTintGreen },
    line: { color: T.borderGreen, width: 1 },
    rectRadius: 0.06
  });
  s.addText('Core Engineering Principle: We deliberately employ explainable mathematical scoring rather than generative chatbots. In B2B agricultural trade, stakeholders require deterministic, auditable decisions rather than non-deterministic text generation.', {
    x: 1.0, y: 4.42, w: 8.0, h: 0.60,
    fontSize: 8.5, bold: true, color: T.brandDarkGreen, align: 'center', valign: 'middle', fontFace: T.fontMain
  });

  s.addNotes('We designed four specialized decision engines for matching, demand forecasting, shelf-life monitoring, and route optimization. We deliberately avoid black-box chatbots so that every recommendation has clear, auditable reasoning.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 11: BUYER-FARMER MATCHING ENGINE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addMasterFrame(s, '11', 'Decision Engine 1', 'Buyer–Farmer Matching: Multi-Criteria Weighted Model', 'Formal mathematical formulation for ranking produce compatibility against procurement specifications');

  // Left Side: Weight Breakdown Table
  s.addShape('roundRect', {
    x: 0.8, y: 1.62, w: 4.9, h: 3.42,
    fill: { color: T.cardWhite },
    line: { color: T.borderSubtle, width: 1 },
    rectRadius: 0.08
  });
  s.addText('COMPOSITE MATCH FORMULATION: S = ∑ ( w_i • s_i )', {
    x: 1.0, y: 1.76, w: 4.5, h: 0.25,
    fontSize: 9, bold: true, color: T.brandGreen, fontFace: T.fontMain
  });

  const factors = [
    { name: 'Price Compatibility', weight: '25%', rule: 'Buyer offer vs farmer minimum acceptable price' },
    { name: 'Quality Grade Match', weight: '20%', rule: 'Exact or compatible quality grade alignment' },
    { name: 'Quantity Fulfillment', weight: '20%', rule: 'Proportion of buyer order volume satisfied' },
    { name: 'Location Proximity', weight: '15%', rule: 'Haversine distance between farm and buyer hub' },
    { name: 'Date Suitability', weight: '10%', rule: 'Harvest readiness date vs delivery deadline' },
    { name: 'Farmer Reliability', weight: '10%', rule: 'Historical fulfillment track record & verification' }
  ];

  factors.forEach((f, idx) => {
    const fy = 2.12 + idx * 0.46;
    s.addText(`• ${f.name} (${f.weight}):`, {
      x: 1.0, y: fy, w: 2.1, h: 0.35,
      fontSize: 9.5, bold: true, color: T.textTitle, fontFace: T.fontMain
    });
    s.addText(f.rule, {
      x: 3.1, y: fy, w: 2.5, h: 0.35,
      fontSize: 8.8, color: T.textSub, fontFace: T.fontMain
    });
  });

  // Right Side: Recommendation Box
  s.addShape('roundRect', {
    x: 5.9, y: 1.62, w: 3.3, h: 3.42,
    fill: { color: T.cardWhite },
    line: { color: T.borderSubtle, width: 1 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 6.05, y: 1.78, w: 3.0, h: 0.28,
    fill: { color: T.brandMint },
    rectRadius: 0.05
  });
  s.addText('EXPLAINABLE RECOMMENDATION OUTPUT', {
    x: 6.05, y: 1.78, w: 3.0, h: 0.28,
    fontSize: 7.5, bold: true, color: T.brandDarkGreen, align: 'center', valign: 'middle', fontFace: T.fontMain
  });

  s.addShape('roundRect', {
    x: 6.05, y: 2.18, w: 3.0, h: 0.60,
    fill: { color: T.canvasBg },
    line: { color: T.brandGreen, width: 1 },
    rectRadius: 0.06
  });
  s.addText('Match Score: 92 / 100\nCrop: Tomato  •  Buyer: FreshMart Pvt Ltd', {
    x: 6.05, y: 2.18, w: 3.0, h: 0.60,
    fontSize: 9.5, bold: true, color: T.brandGreen, align: 'center', valign: 'middle', fontFace: T.fontMain
  });

  s.addText('Explicit Rationale Provided to Farmer:', {
    x: 6.05, y: 2.90, w: 3.0, h: 0.25,
    fontSize: 8.5, bold: true, color: T.textTitle, fontFace: T.fontMain
  });
  s.addText('✔ Crop grade matches requirement (Grade A)\n✔ Farm within 50 km of buyer hub (Nashik ➔ Pune)\n✔ Batch satisfies 100% of order consignment\n✔ Offered price (₹30) exceeds min price (₹25)', {
    x: 6.05, y: 3.20, w: 3.0, h: 1.60,
    fontSize: 9, color: T.textBody, fontFace: T.fontMain, lineSpacingMultiple: 1.25
  });

  s.addNotes('Our matching algorithm combines six weighted factors totaling 100%. The system outputs both a match score and clear, understandable explanations so farmers know why a buyer was recommended.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 12: DEMAND FORECASTING & SHELF-LIFE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addMasterFrame(s, '12', 'Decision Engines 2 & 3', 'Demand Forecasting & Shelf-Life Decay Engines', 'Twin analytical models balancing forward market intelligence with post-harvest perishability');

  // Left Column: Demand Forecasting Flow
  s.addShape('roundRect', {
    x: 0.8, y: 1.62, w: 4.05, h: 3.42,
    fill: { color: T.cardWhite },
    line: { color: T.borderSubtle, width: 1 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 0.95, y: 1.78, w: 3.75, h: 0.28,
    fill: { color: T.accentBluePill },
    rectRadius: 0.05
  });
  s.addText('A. DEMAND FORECASTING FLOW', {
    x: 0.95, y: 1.78, w: 3.75, h: 0.28,
    fontSize: 7.5, bold: true, color: T.accentBlue, align: 'center', valign: 'middle', fontFace: T.fontMain
  });

  const dSteps = [
    { title: '1. Historical Mandi Arrivals', desc: 'Wholesale price series & arrival volumes' },
    { title: '2. Weighted Moving Average', desc: 'D̂_t = ∑ ( α_i • D_t-i ) with recent emphasis' },
    { title: '3. Trend Slope Classification', desc: 'Rising (> +5%), Stable (±5%), Falling (< -5%)' },
    { title: '4. Decision Output for Farmer', desc: 'Projected demand volume & target price bands' }
  ];
  dSteps.forEach((st, idx) => {
    const dy = 2.18 + idx * 0.58;
    s.addShape('roundRect', {
      x: 0.95, y: dy, w: 3.75, h: 0.48,
      fill: { color: T.canvasBg },
      line: { color: T.borderSubtle, width: 1 },
      rectRadius: 0.05
    });
    s.addText(st.title, {
      x: 1.05, y: dy + 0.04, w: 3.55, h: 0.20,
      fontSize: 8.8, bold: true, color: T.textTitle, fontFace: T.fontMain
    });
    s.addText(st.desc, {
      x: 1.05, y: dy + 0.26, w: 3.55, h: 0.18,
      fontSize: 7.5, color: T.textMuted, fontFace: T.fontMain
    });
  });

  // Right Column: Shelf-Life Spoilage Flow
  s.addShape('roundRect', {
    x: 5.15, y: 1.62, w: 4.05, h: 3.42,
    fill: { color: T.cardWhite },
    line: { color: T.borderSubtle, width: 1 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 5.30, y: 1.78, w: 3.75, h: 0.28,
    fill: { color: T.accentAmberPill },
    rectRadius: 0.05
  });
  s.addText('B. SHELF-LIFE & SPOILAGE PREVENTION', {
    x: 5.30, y: 1.78, w: 3.75, h: 0.28,
    fontSize: 7.5, bold: true, color: T.accentAmber, align: 'center', valign: 'middle', fontFace: T.fontMain
  });

  const sSteps = [
    { title: '1. Commodity Shelf-Life Rules', desc: 'Harvest date + baseline perishability decay' },
    { title: '2. Remaining Shelf Life (RSL%)', desc: 'RSL = [ (T_shelf - t_elapsed) / T_shelf ] × 100%' },
    { title: '3. Risk Classification', desc: 'Fresh (> 50%), Attention (25–50%), Critical (< 25%)' },
    { title: '4. Prescriptive Action Trigger', desc: 'Dynamic markdown & expedited pickup dispatch' }
  ];
  sSteps.forEach((st, idx) => {
    const sy = 2.18 + idx * 0.58;
    s.addShape('roundRect', {
      x: 5.30, y: sy, w: 3.75, h: 0.48,
      fill: { color: T.canvasBg },
      line: { color: T.borderSubtle, width: 1 },
      rectRadius: 0.05
    });
    s.addText(st.title, {
      x: 5.40, y: sy + 0.04, w: 3.55, h: 0.20,
      fontSize: 8.8, bold: true, color: T.textTitle, fontFace: T.fontMain
    });
    s.addText(st.desc, {
      x: 5.40, y: sy + 0.26, w: 3.55, h: 0.18,
      fontSize: 7.5, color: T.textMuted, fontFace: T.fontMain
    });
  });

  s.addNotes('This slide shows our dual analytics: the Demand Forecasting flow projects future volume and price bands from historical data, while the Shelf-Life flow calculates freshness decay to trigger discounts and urgent pickups before crops spoil.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 13: ROUTE OPTIMIZATION
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addMasterFrame(s, '13', 'Decision Engine 4', 'Farm-Gate Route & Pickup Optimization', 'Heuristic multi-stop pickup scheduling considering vehicle payload, distance, and perishability');

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
      x: rx, y: 1.62, w: 1.55, h: 0.90,
      fill: { color: T.cardWhite },
      line: { color: T.borderSubtle, width: 1 },
      rectRadius: 0.06
    });
    s.addText(rs.title, {
      x: rx + 0.05, y: 1.72, w: 1.45, h: 0.24,
      fontSize: 8.5, bold: true, color: T.brandGreen, align: 'center', fontFace: T.fontMain
    });
    s.addText(rs.sub, {
      x: rx + 0.05, y: 2.02, w: 1.45, h: 0.22,
      fontSize: 7.5, color: T.textMuted, align: 'center', fontFace: T.fontMain
    });
  });

  s.addShape('roundRect', {
    x: 0.8, y: 2.68, w: 8.4, h: 1.55,
    fill: { color: T.cardWhite },
    line: { color: T.borderSubtle, width: 1 },
    rectRadius: 0.08
  });

  s.addText([
    { text: '• Multi-Stop Pickup Planning: ', options: { bold: true, color: T.textTitle } },
    { text: 'Combines multiple small farm orders along the same transit corridor into a single consolidated trip, eliminating deadhead miles.\n\n', options: { color: T.textBody } },
    { text: '• Vehicle Capacity Constraint: ', options: { bold: true, color: T.textTitle } },
    { text: 'Ensures total cargo load across stops does not exceed rated vehicle payload capacity (∑ Q_i ≤ C_truck).\n\n', options: { color: T.textBody } },
    { text: '• Perishability Urgency Penalty: ', options: { bold: true, color: T.textTitle } },
    { text: 'Batches flagged as "Critical" by the Shelf-Life Agent are scheduled for earlier pickup to avoid transit spoilage.', options: { color: T.textBody } }
  ], {
    x: 1.0, y: 2.80, w: 8.0, h: 1.35,
    fontSize: 9.8, fontFace: T.fontMain, lineSpacingMultiple: 1.15
  });

  // Bottom Trip Example Banner
  s.addShape('roundRect', {
    x: 0.8, y: 4.38, w: 8.4, h: 0.68,
    fill: { color: T.cardTintGreen },
    line: { color: T.borderGreen, width: 1 },
    rectRadius: 0.06
  });
  s.addText('Multi-Stop Trip Manifest Example: Transporter Depot ➔ Farm Stop A (800 kg Tomatoes, Critical Urgency) ➔ Farm Stop B (1,200 kg Onions) ➔ Central Buyer Terminal (2,000 kg Consignment, 84 km)', {
    x: 0.9, y: 4.40, w: 8.2, h: 0.64,
    fontSize: 9, bold: true, color: T.brandDarkGreen, align: 'center', valign: 'middle', fontFace: T.fontMain
  });

  s.addNotes('Our route optimization groups farm orders into multi-stop trips while checking truck weight limits. Crucially, orders marked as perishable or critical are given pickup priority to reduce post-harvest losses.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 14: END-TO-END WORKFLOW & TRACEABILITY
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addMasterFrame(s, '14', 'Workflow & Provenance', 'End-to-End Business Workflow & Traceability Lifecycle', 'Unified data flow connecting crops, bookings, orders, pickups, payments, and audit logs');

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
      x: sx, y: 1.62, w: 0.95, h: 1.00,
      fill: { color: T.cardWhite },
      line: { color: T.borderSubtle, width: 1 },
      rectRadius: 0.06
    });
    s.addShape('oval', {
      x: sx + 0.35, y: 1.70, w: 0.25, h: 0.25,
      fill: { color: T.brandMint },
      line: { color: T.brandGreen, width: 1 }
    });
    s.addText(st.num, {
      x: sx + 0.35, y: 1.70, w: 0.25, h: 0.25,
      fontSize: 8.5, bold: true, color: T.brandDarkGreen, align: 'center', valign: 'middle', fontFace: T.fontMain
    });
    s.addText(st.name, {
      x: sx + 0.05, y: 1.98, w: 0.85, h: 0.55,
      fontSize: 8, bold: true, color: T.textTitle, align: 'center', valign: 'middle', fontFace: T.fontMain
    });
  });

  // Left: Entity Connection
  s.addShape('roundRect', {
    x: 0.8, y: 2.80, w: 4.10, h: 2.25,
    fill: { color: T.cardWhite },
    line: { color: T.borderSubtle, width: 1 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 0.95, y: 2.92, w: 3.80, h: 0.25,
    fill: { color: T.brandMint },
    rectRadius: 0.05
  });
  s.addText('RELATIONAL ENTITY LINKAGE IN MONGODB', {
    x: 0.95, y: 2.92, w: 3.80, h: 0.25,
    fontSize: 7.5, bold: true, color: T.brandDarkGreen, align: 'center', valign: 'middle', fontFace: T.fontMain
  });
  s.addText('• Crop Document ➔ Root harvest batch & availableQty\n• Booking Document ➔ Linked buyer reservation\n• Order Document ➔ Fulfillment status & timeline[]\n• PickupRequest Document ➔ Assigned transporterId lock\n• Payment Document ➔ Settlement record (Pending ➔ Paid)\n• All documents remain linked across the transaction lifecycle.', {
    x: 0.95, y: 3.25, w: 3.80, h: 1.65,
    fontSize: 8.5, color: T.textBody, fontFace: T.fontMain, lineSpacingMultiple: 1.2
  });

  // Right: Traceability Log
  s.addShape('roundRect', {
    x: 5.10, y: 2.80, w: 4.10, h: 2.25,
    fill: { color: T.codeBg },
    line: { color: '334155', width: 1 },
    rectRadius: 0.08
  });
  s.addText('AUDIT TRACEABILITY LEDGER (EVENT SOURCING)', {
    x: 5.25, y: 2.92, w: 3.80, h: 0.25,
    fontSize: 7.5, bold: true, color: '38BDF8', fontFace: T.fontMain
  });
  const tLog = [
    '[HARVESTED]          Loc: Nashik Farm A     | Actor: Farmer',
    '[QUALITY_CHECKED]    Grade: Grade A         | Actor: Quality Agent',
    '[BOOKED]             Buyer: FreshMart       | Ref: Booking #B-108',
    '[PICKUP_SCHEDULED]   Truck: MH-15-AB1234    | Ref: Pickup #P-402',
    '[IN_TRANSIT]         Route: Nashik -> Pune  | Actor: Transporter',
    '[DELIVERED]          Loc: Pune Warehouse    | Actor: Buyer',
    '[PAYMENT_RECEIVED]   Amount: ₹24,000        | Ref: Pay #TX-902'
  ];
  s.addText(tLog.join('\n'), {
    x: 5.25, y: 3.25, w: 3.80, h: 1.65,
    fontSize: 7.2, color: 'A7F3D0', fontFace: T.fontMono, lineSpacingMultiple: 1.15
  });

  s.addNotes('This slide illustrates the full transaction lifecycle. From crop listing to payment, every stage updates connected database models and commits milestone events to our traceability log.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 15: CONCLUSION & FUTURE SCOPE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addMasterFrame(s, '15', 'Evaluation & Roadmap', 'Project Results, Future Scope & Academic Conclusion', 'Summary of verified engineering achievements, production roadmap, and technical conclusions');

  // Left Side: Implemented Achievements
  s.addShape('roundRect', {
    x: 0.8, y: 1.62, w: 4.05, h: 2.50,
    fill: { color: T.cardWhite },
    line: { color: T.brandGreen, width: 1.5 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 0.95, y: 1.76, w: 3.75, h: 0.28,
    fill: { color: T.brandMint },
    rectRadius: 0.05
  });
  s.addText('IMPLEMENTED & VERIFIED ACHIEVEMENTS', {
    x: 0.95, y: 1.76, w: 3.75, h: 0.28,
    fontSize: 7.5, bold: true, color: T.brandDarkGreen, align: 'center', valign: 'middle', fontFace: T.fontMain
  });
  s.addText([
    { text: '✔ Full-Stack MERN Platform: ', options: { bold: true, color: T.textTitle } },
    { text: 'React 18 SPA, Node/Express REST API.\n', options: { color: T.textBody } },
    { text: '✔ Role-Based Access Control: ', options: { bold: true, color: T.textTitle } },
    { text: 'JWT middleware for Farmer, Buyer, Transporter.\n', options: { color: T.textBody } },
    { text: '✔ Transactional State Machine: ', options: { bold: true, color: T.textTitle } },
    { text: 'Booking ➔ Order ➔ PickupRequest with atomic locks.\n', options: { color: T.textBody } },
    { text: '✔ Explainable Decision Engines: ', options: { bold: true, color: T.textTitle } },
    { text: 'Multi-criteria matching and shelf-life decay monitoring.\n', options: { color: T.textBody } },
    { text: '✔ Milestone Audit Logging: ', options: { bold: true, color: T.textTitle } },
    { text: 'Idempotent traceability event logger in MongoDB.\n', options: { color: T.textBody } },
    { text: '✔ Cloud Deployment: ', options: { bold: true, color: T.textTitle } },
    { text: 'Vercel (Frontend), Render (Backend), MongoDB Atlas.', options: { color: T.textBody } }
  ], {
    x: 0.95, y: 2.12, w: 3.75, h: 1.90,
    fontSize: 8.5, fontFace: T.fontMain, lineSpacingMultiple: 1.15
  });

  // Right Side: Future Scope
  s.addShape('roundRect', {
    x: 5.15, y: 1.62, w: 4.05, h: 2.50,
    fill: { color: T.cardWhite },
    line: { color: T.accentBlue, width: 1.5 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 5.30, y: 1.76, w: 3.75, h: 0.28,
    fill: { color: T.accentBluePill },
    rectRadius: 0.05
  });
  s.addText('PLANNED FUTURE ENHANCEMENTS', {
    x: 5.30, y: 1.76, w: 3.75, h: 0.28,
    fontSize: 7.5, bold: true, color: T.accentBlue, align: 'center', valign: 'middle', fontFace: T.fontMain
  });
  s.addText([
    { text: '➤ Production Machine Learning: ', options: { bold: true, color: T.textTitle } },
    { text: 'Train LSTM / ARIMA models on national mandi price datasets.\n', options: { color: T.textBody } },
    { text: '➤ Real-Time IoT Telematics: ', options: { bold: true, color: T.textTitle } },
    { text: 'Hardware GPS trackers and live Google Maps/Mapbox routing.\n', options: { color: T.textBody } },
    { text: '➤ Enterprise Blockchain: ', options: { bold: true, color: T.textTitle } },
    { text: 'Anchor traceability event hashes on Polygon/Ethereum.\n', options: { color: T.textBody } },
    { text: '➤ Automated Payment Escrow: ', options: { bold: true, color: T.textTitle } },
    { text: 'Razorpay / Stripe webhooks releasing funds on delivery.\n', options: { color: T.textBody } },
    { text: '➤ Multilingual PWA: ', options: { bold: true, color: T.textTitle } },
    { text: 'Offline-first mobile PWA with Indian regional languages.', options: { color: T.textBody } }
  ], {
    x: 5.30, y: 2.12, w: 3.75, h: 1.90,
    fontSize: 8.5, fontFace: T.fontMain, lineSpacingMultiple: 1.15
  });

  // Bottom Conclusion
  s.addShape('roundRect', {
    x: 0.8, y: 4.28, w: 8.4, h: 0.78,
    fill: { color: T.cardTintGreen },
    line: { color: T.brandGreen, width: 1.2 },
    rectRadius: 0.08
  });
  s.addText([
    { text: 'Final Academic Conclusion: ', options: { bold: true, color: T.brandDarkGreen } },
    { text: 'AgriFlow AI successfully establishes a functional, scalable engineering blueprint modernizing agricultural commerce. By pairing direct commerce with explainable decision support and coordinated logistics, the platform minimizes food spoilage and empowers rural producers.', options: { color: T.textTitle } }
  ], {
    x: 1.0, y: 4.34, w: 8.0, h: 0.65,
    fontSize: 9, fontFace: T.fontMain, lineSpacingMultiple: 1.15
  });

  s.addNotes('Respected project guide Prof. G.V. Patil and examiners, to conclude, AgriFlow AI provides a viable engineering blueprint for agricultural logistics. We have built the complete full-stack foundation, state machine, and explainable decision stubs. In our future scope, we plan to incorporate ML models, live GPS, and blockchain anchoring. Thank you, and we welcome your questions.');
}

// ── Output Generation ────────────────────────────────────────────────────────
const pathCanonical = path.resolve(__dirname, '../../AgriFlow_AI_Smart_Agricultural_Supply_Chain_Platform.pptx');
const pathUpdated   = path.resolve(__dirname, '../../AgriFlow_AI_Presentation_Updated.pptx');

Promise.all([
  pres.writeFile({ fileName: pathCanonical }),
  pres.writeFile({ fileName: pathUpdated })
])
  .then(() => {
    console.log(`SUCCESS: Personalized PowerPoint presentations generated successfully!`);
    console.log(`File 1: ${pathCanonical}`);
    console.log(`File 2: ${pathUpdated}`);
  })
  .catch(err => {
    console.error('ERROR generating personalized presentations:', err);
    process.exit(1);
  });
