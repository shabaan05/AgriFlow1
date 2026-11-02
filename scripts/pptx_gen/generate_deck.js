const pptxgen = require('pptxgenjs');
const path = require('path');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches
pres.author = 'AgriFlow AI Engineering Team';
pres.company = 'Department of Computer Science & Engineering';
pres.title = 'AgriFlow AI – Smart Agricultural Supply Chain SaaS Platform';
pres.subject = 'B.Tech Major Project Final Presentation';

// ── Color Palette Definitions ────────────────────────────────────────────────
const C = {
  forestDark:   '0D3D22', // Primary Dark Accent
  forestGreen:  '1A6B3C', // Primary Green
  emerald:      '2D9E5F', // Accent Green
  mintLight:    'E8F5E9', // Light Green Background Pill
  sageBg:       'F4F9F5', // Soft Background
  white:        'FFFFFF',
  slateDark:    '1E293B', // Primary Text
  slateMuted:   '475569', // Secondary Text
  slateLight:   '94A3B8', // Muted / Captions
  borderLight:  'E2E8F0', // Border Grey
  borderMuted:  'CBD5E1',
  amberDark:    'B45309', // Warning / Perishability
  amberLight:   'FEF3C7',
  redDark:      'DC2626', // Critical / Spoilage
  redLight:     'FEE2E2',
  blueDark:     '1D4ED8', // Logistics / Tech
  blueLight:    'EFF6FF',
  purpleDark:   '6D28D9', // Traceability / Blockchain
  purpleLight:  'F5F3FF',
};

// ── Helper: Add Header & Footer to Standard Slides ───────────────────────────
function addSlideChrome(slide, slideNum, category, title, subtitle) {
  slide.background = { color: 'F8FAF9' };

  // Top Category Pill
  slide.addShape('roundRect', {
    x: 0.6, y: 0.35, w: 2.8, h: 0.24,
    fill: { color: C.mintLight },
    line: { color: C.emerald, width: 1 },
    rectRadius: 0.1,
  });
  slide.addText(`AGRIFLOW AI  |  ${category.toUpperCase()}`, {
    x: 0.6, y: 0.35, w: 2.8, h: 0.24,
    fontSize: 7.5, bold: true, color: C.forestGreen, align: 'center', valign: 'middle'
  });

  // Slide Number Pill Top-Right
  slide.addShape('roundRect', {
    x: 8.3, y: 0.35, w: 1.1, h: 0.24,
    fill: { color: C.white },
    line: { color: C.borderMuted, width: 1 },
    rectRadius: 0.1,
  });
  slide.addText(`SLIDE ${slideNum}/15`, {
    x: 8.3, y: 0.35, w: 1.1, h: 0.24,
    fontSize: 7.5, bold: true, color: C.slateMuted, align: 'center', valign: 'middle'
  });

  // Main Title
  slide.addText(title, {
    x: 0.6, y: 0.62, w: 8.8, h: 0.42,
    fontSize: 18, bold: true, color: C.forestDark, valign: 'middle'
  });

  // Subtitle / Context
  slide.addText(subtitle, {
    x: 0.6, y: 1.02, w: 8.8, h: 0.24,
    fontSize: 9.5, color: C.slateMuted, valign: 'middle'
  });

  // Accent Dividing Line
  slide.addShape('line', {
    x: 0.6, y: 1.28, w: 8.8, h: 0,
    line: { color: C.borderLight, width: 1.5 }
  });

  // Footer Line & Text
  slide.addShape('line', {
    x: 0.6, y: 5.25, w: 8.8, h: 0,
    line: { color: C.borderLight, width: 1 }
  });
  slide.addText('AgriFlow AI — Smart Agricultural Supply Chain SaaS Platform', {
    x: 0.6, y: 5.30, w: 4.5, h: 0.25,
    fontSize: 7.5, color: C.slateLight, valign: 'middle'
  });
  slide.addText('B.Tech Final Year Major Project  |  Dept. of Computer Science & Engineering', {
    x: 4.5, y: 5.30, w: 4.9, h: 0.25,
    fontSize: 7.5, color: C.slateLight, align: 'right', valign: 'middle'
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 01: TITLE & PROJECT OVERVIEW (Dark Theme)
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.forestDark };

  // Decorative Accent Box
  s.addShape('roundRect', {
    x: 0.8, y: 0.6, w: 2.6, h: 0.28,
    fill: { color: '14532D' },
    line: { color: C.emerald, width: 1 },
    rectRadius: 0.12,
  });
  s.addText('B.TECH MAJOR PROJECT DEFENSE', {
    x: 0.8, y: 0.6, w: 2.6, h: 0.28,
    fontSize: 8.5, bold: true, color: '86EFAC', align: 'center', valign: 'middle'
  });

  // Main Title
  s.addText('AgriFlow AI', {
    x: 0.8, y: 0.95, w: 8.4, h: 0.75,
    fontSize: 34, bold: true, color: C.white, valign: 'middle'
  });

  // Subtitle
  s.addText('Smart Agricultural Supply Chain SaaS Platform', {
    x: 0.8, y: 1.70, w: 8.4, h: 0.45,
    fontSize: 18, bold: true, color: '6EE7B7', valign: 'middle'
  });

  // Tagline
  s.addText('An Integrated Multi-Stakeholder B2B Logistics & Decision-Support System', {
    x: 0.8, y: 2.15, w: 8.4, h: 0.35,
    fontSize: 11, color: 'D1FAE5', valign: 'middle'
  });

  // 4 Stakeholder Badges
  const roles = [
    { name: 'Farmer Portal', icon: '🌾' },
    { name: 'Buyer Marketplace', icon: '🏢' },
    { name: 'Transporter Logistics', icon: '🚛' },
    { name: 'System Admin', icon: '⚙️' },
  ];
  roles.forEach((r, i) => {
    const rx = 0.8 + i * 2.15;
    s.addShape('roundRect', {
      x: rx, y: 2.65, w: 2.05, h: 0.38,
      fill: { color: '166534' },
      line: { color: '22C55E', width: 1 },
      rectRadius: 0.08,
    });
    s.addText(`${r.icon}  ${r.name}`, {
      x: rx, y: 2.65, w: 2.05, h: 0.38,
      fontSize: 9, bold: true, color: C.white, align: 'center', valign: 'middle'
    });
  });

  // Left Card: Student Presenters
  s.addShape('roundRect', {
    x: 0.8, y: 3.25, w: 4.15, h: 1.65,
    fill: { color: '14532D' },
    line: { color: '22C55E', width: 1 },
    rectRadius: 0.1,
  });
  s.addText('PROJECT CANDIDATES', {
    x: 1.0, y: 3.35, w: 3.75, h: 0.25,
    fontSize: 8.5, bold: true, color: '86EFAC'
  });
  s.addText([
    { text: '• Candidate 1: ', options: { bold: true, color: C.white } },
    { text: '[Student Name 1] (Roll No: XXXXXX)\n', options: { color: 'E2E8F0' } },
    { text: '• Candidate 2: ', options: { bold: true, color: C.white } },
    { text: '[Student Name 2] (Roll No: XXXXXX)\n', options: { color: 'E2E8F0' } },
    { text: '• Candidate 3: ', options: { bold: true, color: C.white } },
    { text: '[Student Name 3] (Roll No: XXXXXX)\n', options: { color: 'E2E8F0' } },
    { text: 'Degree / Branch: ', options: { bold: true, color: 'A7F3D0' } },
    { text: 'B.Tech in Computer Science & Engineering', options: { color: 'E2E8F0' } },
  ], {
    x: 1.0, y: 3.65, w: 3.75, h: 1.15,
    fontSize: 8.5, lineSpacingMultiple: 1.15
  });

  // Right Card: Academic Supervisor & Institution
  s.addShape('roundRect', {
    x: 5.05, y: 3.25, w: 4.15, h: 1.65,
    fill: { color: '14532D' },
    line: { color: '22C55E', width: 1 },
    rectRadius: 0.1,
  });
  s.addText('ACADEMIC SUPERVISION & INSTITUTION', {
    x: 5.25, y: 3.35, w: 3.75, h: 0.25,
    fontSize: 8.5, bold: true, color: '86EFAC'
  });
  s.addText([
    { text: '• Project Supervisor: ', options: { bold: true, color: C.white } },
    { text: 'Prof. [Supervisor Name]\n', options: { color: 'E2E8F0' } },
    { text: '• Designation: ', options: { bold: true, color: C.white } },
    { text: 'Assistant Professor, Dept. of CSE\n', options: { color: 'E2E8F0' } },
    { text: '• Institution: ', options: { bold: true, color: C.white } },
    { text: '[College / University Name, City]\n', options: { color: 'E2E8F0' } },
    { text: '• Academic Session: ', options: { bold: true, color: 'A7F3D0' } },
    { text: '2025 – 2026', options: { color: 'E2E8F0' } },
  ], {
    x: 5.25, y: 3.65, w: 3.75, h: 1.15,
    fontSize: 8.5, lineSpacingMultiple: 1.15
  });

  // Bottom Tech Bar
  s.addText('MERN Stack (React 18, Node.js, Express, MongoDB Atlas)  •  JWT RBAC  •  Explainable Multi-Criteria Decision Core', {
    x: 0.8, y: 5.05, w: 8.4, h: 0.3,
    fontSize: 8, color: '94A3B8', align: 'center'
  });

  s.addNotes('Respected guide and members of the evaluation committee, good morning. Today we present our B.Tech final-year major project: AgriFlow AI. Traditional agricultural supply chains suffer from severe market opacity, lack of demand visibility, post-harvest perishability losses, and uncoordinated logistics. AgriFlow AI addresses these systemic challenges through a unified multi-tenant architecture backed by explainable, deterministic decision-support algorithms.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 02: PROBLEM STATEMENT
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addSlideChrome(s, '02', 'Problem Analysis', 'Problem Statement: Agricultural Supply Chain Inefficiencies', 'Structural bottlenecks that degrade farm income, cause severe food loss, and inflate consumer prices');

  const problems = [
    {
      num: '01',
      title: 'Demand Uncertainty & Gluts',
      tag: 'PRODUCTION ASYMMETRY',
      tagBg: C.redLight, tagColor: C.redDark,
      desc: 'Farmers cultivate crops based on intuition rather than forward commercial demand signals. This leads to cyclical overproduction, local mandi gluts, and severe price crashes during harvest peaks.',
      stat: 'Lack of forward price & volume visibility'
    },
    {
      num: '02',
      title: 'Intermediary Exploitation',
      tag: 'RENT-SEEKING CARTELS',
      tagBg: C.amberLight, tagColor: C.amberDark,
      desc: 'Opaque multi-tier commission agent chains (4 to 6 layers) capture 35% to 50% of final retail margins. Producers are price-takers and receive a disproportionately small fraction of consumer spend.',
      stat: '35% – 50% value captured by middle tiers'
    },
    {
      num: '03',
      title: 'Logistics Delays & Spoilage',
      tag: 'PERISHABILITY VALUE LOSS',
      tagBg: C.redLight, tagColor: C.redDark,
      desc: 'Rural farm-gate logistics is fragmented and uncoordinated. Perishable crops lack shelf-life monitoring, resulting in delayed transit, high deadhead miles, and staggering post-harvest wastage.',
      stat: '25% – 35% perishable crop spoilage'
    }
  ];

  problems.forEach((p, i) => {
    const x = 0.6 + i * 2.98;
    s.addShape('roundRect', {
      x: x, y: 1.45, w: 2.84, h: 2.50,
      fill: { color: C.white },
      line: { color: C.borderMuted, width: 1 },
      rectRadius: 0.1,
    });

    // Number Circle Pill
    s.addShape('ellipse', {
      x: x + 0.15, y: 1.60, w: 0.35, h: 0.35,
      fill: { color: C.mintLight },
      line: { color: C.emerald, width: 1 }
    });
    s.addText(p.num, {
      x: x + 0.15, y: 1.60, w: 0.35, h: 0.35,
      fontSize: 8.5, bold: true, color: C.forestGreen, align: 'center', valign: 'middle'
    });

    // Tag
    s.addShape('roundRect', {
      x: x + 0.60, y: 1.63, w: 2.05, h: 0.28,
      fill: { color: p.tagBg },
      rectRadius: 0.05
    });
    s.addText(p.tag, {
      x: x + 0.60, y: 1.63, w: 2.05, h: 0.28,
      fontSize: 7, bold: true, color: p.tagColor, align: 'center', valign: 'middle'
    });

    // Title
    s.addText(p.title, {
      x: x + 0.15, y: 2.05, w: 2.54, h: 0.35,
      fontSize: 10.5, bold: true, color: C.forestDark, valign: 'middle'
    });

    // Description
    s.addText(p.desc, {
      x: x + 0.15, y: 2.45, w: 2.54, h: 1.05,
      fontSize: 8, color: C.slateMuted, lineSpacingMultiple: 1.15
    });

    // Stat Footnote
    s.addShape('line', {
      x: x + 0.15, y: 3.55, w: 2.54, h: 0,
      line: { color: C.borderLight, width: 1 }
    });
    s.addText(`Impact: ${p.stat}`, {
      x: x + 0.15, y: 3.60, w: 2.54, h: 0.25,
      fontSize: 7.5, bold: true, color: p.tagColor
    });
  });

  // Bottom Visual Problem Flow Banner
  s.addShape('roundRect', {
    x: 0.6, y: 4.10, w: 8.8, h: 1.00,
    fill: { color: 'FFF5F5' },
    line: { color: 'FCA5A5', width: 1 },
    rectRadius: 0.1,
  });
  s.addText('THE RECURRING AGRICULTURAL VALUE DESTRUCTION PIPELINE:', {
    x: 0.8, y: 4.18, w: 8.4, h: 0.22,
    fontSize: 7.5, bold: true, color: C.redDark
  });

  const steps = [
    'Speculative Sowing', 'Mandi Oversupply', 'Price Collapses',
    'Middleman Markups', 'Uncoordinated Pickup', 'Severe Spoilage'
  ];
  steps.forEach((st, idx) => {
    const sx = 0.8 + idx * 1.40;
    s.addShape('roundRect', {
      x: sx, y: 4.45, w: 1.25, h: 0.45,
      fill: { color: C.white },
      line: { color: 'F87171', width: 1 },
      rectRadius: 0.06
    });
    s.addText(st, {
      x: sx, y: 4.45, w: 1.25, h: 0.45,
      fontSize: 7, bold: true, color: C.slateDark, align: 'center', valign: 'middle'
    });
    if (idx < steps.length - 1) {
      s.addText('➔', {
        x: sx + 1.25, y: 4.45, w: 0.15, h: 0.45,
        fontSize: 8, color: C.redDark, align: 'center', valign: 'middle'
      });
    }
  });

  s.addNotes('The agricultural problem space is five-fold: farmers sow blindly without forward market demand, intermediaries capture the bulk of value, post-harvest losses claim up to a third of perishable yields, rural transport is unorganized, and there is zero audit-grade traceability. Our goal is to replace this fragmented chain with a connected digital ecosystem.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 03: PROPOSED SOLUTION
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addSlideChrome(s, '03', 'Proposed Architecture', 'Proposed Solution: The AgriFlow AI Platform Paradigm', 'A closed-loop, data-driven B2B ecosystem connecting supply, demand, logistics, and intelligence');

  const pillars = [
    {
      title: 'Direct B2B Commerce',
      tag: 'DISINTERMEDIATION',
      color: C.forestGreen, bg: C.mintLight,
      points: [
        'Connects verified farmers directly with wholesale buyers',
        'Transparent digital marketplace for active and pre-harvest crops',
        'Direct booking with quantity locking to prevent double-selling',
        'Eliminates uncoordinated commission agent rent-seeking'
      ]
    },
    {
      title: 'Explainable Decision AI',
      tag: 'DETERMINISTIC RANKING',
      color: C.blueDark, bg: C.blueLight,
      points: [
        'Multi-factor matching: Price, Quality, Volume, Proximity, Date',
        'Outputs normalized 0–100 scores with explicit reasoning',
        'Trend & seasonality demand signaling from mandi historicals',
        'Replaces opaque black-box LLMs with verifiable math'
      ]
    },
    {
      title: 'Perishability Logistics',
      tag: 'SPOILAGE PREVENTION',
      color: C.amberDark, bg: C.amberLight,
      points: [
        'Shelf-life decay tracking (Fresh, Attention, Critical tiers)',
        'Event-driven auto-generation of transporter pickup requests',
        'Multi-stop route planning and vehicle payload optimization',
        'Urgency penalties force high-perishability crops to head of queue'
      ]
    },
    {
      title: 'Milestone Traceability',
      tag: 'VERIFIABLE AUDIT TRAIL',
      color: C.purpleDark, bg: C.purpleLight,
      points: [
        'Idempotent event logging across critical supply milestones',
        'Tracks Harvested ➔ Booked ➔ Picked Up ➔ Delivered ➔ Paid',
        'Entity linkage: Crop ID ➔ Booking ID ➔ Order ID ➔ Payment ID',
        'Pre-architected schema for future public blockchain anchoring'
      ]
    }
  ];

  pillars.forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.6 + col * 4.45;
    const y = 1.45 + row * 1.80;

    s.addShape('roundRect', {
      x: x, y: y, w: 4.35, h: 1.70,
      fill: { color: C.white },
      line: { color: C.borderMuted, width: 1 },
      rectRadius: 0.1,
    });

    // Header Pill
    s.addShape('roundRect', {
      x: x + 0.15, y: y + 0.15, w: 1.6, h: 0.24,
      fill: { color: p.bg },
      rectRadius: 0.05
    });
    s.addText(p.tag, {
      x: x + 0.15, y: y + 0.15, w: 1.6, h: 0.24,
      fontSize: 6.5, bold: true, color: p.color, align: 'center', valign: 'middle'
    });

    s.addText(p.title, {
      x: x + 1.85, y: y + 0.15, w: 2.35, h: 0.24,
      fontSize: 10, bold: true, color: C.forestDark, valign: 'middle'
    });

    // Bullet points
    const bulletText = p.points.map(pt => `• ${pt}\n`).join('');
    s.addText(bulletText, {
      x: x + 0.15, y: y + 0.45, w: 4.05, h: 1.15,
      fontSize: 8, color: C.slateMuted, lineSpacingMultiple: 1.15
    });
  });

  s.addNotes('Our solution, AgriFlow AI, is not a simple marketplace or a generic chatbot. It is a full-lifecycle operational SaaS platform. It integrates institutional demand broadcasting, direct booking, automated logistics dispatch, and milestone-based provenance tracking. All decisions are backed by deterministic, explainable mathematical scoring so that both farmers and buyers understand exactly why a match or action is recommended.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 04: PROJECT OBJECTIVES
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addSlideChrome(s, '04', 'Engineering Scope', 'Project Objectives: Technical & Research Goals', 'Rigorous software engineering and decision-support targets formulated for academic capstone execution');

  const objs = [
    {
      id: 'OBJ-1',
      title: 'Unified Multi-Tenant Platform',
      desc: 'Architect a secure web application supporting Farmers, Buyers, Transporters, and Platform Admins under a unified JWT auth and RBAC system.',
      tech: 'React 18 SPA + Express + MongoDB Atlas'
    },
    {
      id: 'OBJ-2',
      title: 'Explainable Matching Algorithm',
      desc: 'Formulate an explainable multi-factor scoring model (0–100) evaluating price compatibility, quality grade, quantity, and proximity.',
      tech: 'Deterministic Multi-Criteria Weighted Model'
    },
    {
      id: 'OBJ-3',
      title: 'Forward Demand Signaling',
      desc: 'Develop a demand aggregation and forecasting module displaying forward buyer needs, volume targets, and mandi price ranges.',
      tech: 'Weighted Moving Averages & Trend Slopes'
    },
    {
      id: 'OBJ-4',
      title: 'Shelf-Life Decay Monitoring',
      desc: 'Design a perishability risk evaluator (Fresh, Attention, Critical) tracking elapsed shelf-life and triggering automated mitigation.',
      tech: 'Remaining Shelf-Life Decay Curves'
    },
    {
      id: 'OBJ-5',
      title: 'Automated Logistics Dispatch',
      desc: 'Engineer an event-driven logistics pipeline automatically spawning atomic pickup requests when orders are marked Ready for Pickup.',
      tech: 'Concurrency-Controlled State Machine'
    },
    {
      id: 'OBJ-6',
      title: 'Immutable Milestone Audit Ledger',
      desc: 'Establish an idempotent event logging service recording chronological transaction milestones from harvest to delivery and payout.',
      tech: 'Audit-Grade MongoDB Event Sourcing'
    }
  ];

  objs.forEach((o, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.6 + col * 2.98;
    const y = 1.45 + row * 1.80;

    s.addShape('roundRect', {
      x: x, y: y, w: 2.84, h: 1.70,
      fill: { color: C.white },
      line: { color: C.borderMuted, width: 1 },
      rectRadius: 0.1,
    });

    // ID Badge
    s.addShape('roundRect', {
      x: x + 0.15, y: y + 0.15, w: 0.8, h: 0.24,
      fill: { color: C.mintLight },
      line: { color: C.emerald, width: 1 },
      rectRadius: 0.05
    });
    s.addText(o.id, {
      x: x + 0.15, y: y + 0.15, w: 0.8, h: 0.24,
      fontSize: 7.5, bold: true, color: C.forestGreen, align: 'center', valign: 'middle'
    });

    s.addText(o.title, {
      x: x + 1.05, y: y + 0.15, w: 1.64, h: 0.24,
      fontSize: 9, bold: true, color: C.forestDark, valign: 'middle'
    });

    s.addText(o.desc, {
      x: x + 0.15, y: y + 0.45, w: 2.54, h: 0.80,
      fontSize: 7.5, color: C.slateMuted, lineSpacingMultiple: 1.15
    });

    s.addShape('line', {
      x: x + 0.15, y: y + 1.30, w: 2.54, h: 0,
      line: { color: C.borderLight, width: 1 }
    });
    s.addText(`Core Stack: ${o.tech}`, {
      x: x + 0.15, y: y + 1.35, w: 2.54, h: 0.25,
      fontSize: 7, bold: true, color: C.forestGreen
    });
  });

  s.addNotes('We defined six engineering objectives for this project. These encompass full-stack multi-tenancy, algorithmic matching, predictive demand signaling, shelf-life spoilage calculation, automated logistics dispatch, and audit-grade traceability. Each objective has been mapped directly to functional code in our repository.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 05: SYSTEM ARCHITECTURE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addSlideChrome(s, '05', 'System Design', 'System Architecture: 4-Tier Full-Stack Decoupled Design', 'Presentation, API routing, deterministic decision engines, and persistent document storage');

  // Tier 1: Presentation Tier
  s.addShape('roundRect', {
    x: 0.6, y: 1.45, w: 8.8, h: 0.85,
    fill: { color: C.white },
    line: { color: C.emerald, width: 1.5 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 0.75, y: 1.55, w: 1.8, h: 0.22,
    fill: { color: C.mintLight },
    rectRadius: 0.05
  });
  s.addText('PRESENTATION TIER', {
    x: 0.75, y: 1.55, w: 1.8, h: 0.22,
    fontSize: 7, bold: true, color: C.forestGreen, align: 'center', valign: 'middle'
  });
  s.addText('React 18 Single Page Application (Vite Bundler + Tailwind CSS v3 + React Router v6)', {
    x: 2.65, y: 1.55, w: 6.6, h: 0.22,
    fontSize: 8.5, bold: true, color: C.forestDark, valign: 'middle'
  });

  const uiModules = ['Farmer Portal (Crops/Demand/AI)', 'Buyer Marketplace (Discovery/Orders)', 'Transporter Trips (Dispatch/Earnings)', 'Admin Core (Oversight/Audit)'];
  uiModules.forEach((m, i) => {
    const mx = 0.75 + i * 2.15;
    s.addShape('roundRect', {
      x: mx, y: 1.85, w: 2.05, h: 0.35,
      fill: { color: C.sageBg },
      line: { color: C.borderLight, width: 1 },
      rectRadius: 0.05
    });
    s.addText(m, {
      x: mx, y: 1.85, w: 2.05, h: 0.35,
      fontSize: 7, color: C.slateDark, align: 'center', valign: 'middle'
    });
  });

  // Protocol Connector Arrow
  s.addText('▼  HTTPS / RESTful JSON Protocol (JWT Authorization Bearer Header)  ▼', {
    x: 0.6, y: 2.33, w: 8.8, h: 0.20,
    fontSize: 7.5, bold: true, color: C.slateLight, align: 'center', valign: 'middle'
  });

  // Tier 2: Application / API Tier
  s.addShape('roundRect', {
    x: 0.6, y: 2.55, w: 8.8, h: 0.85,
    fill: { color: C.white },
    line: { color: C.blueDark, width: 1.5 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 0.75, y: 2.65, w: 1.8, h: 0.22,
    fill: { color: C.blueLight },
    rectRadius: 0.05
  });
  s.addText('APPLICATION & API TIER', {
    x: 0.75, y: 2.65, w: 1.8, h: 0.22,
    fontSize: 7, bold: true, color: C.blueDark, align: 'center', valign: 'middle'
  });
  s.addText('Node.js & Express.js REST API Server @ Port 5000  •  Stateless JWT Auth  •  RBAC Middleware', {
    x: 2.65, y: 2.65, w: 6.6, h: 0.22,
    fontSize: 8.5, bold: true, color: C.forestDark, valign: 'middle'
  });

  const apiModules = ['Auth & Profile Controller', 'Crop & Demand Controller', 'Booking & Order State Machine', 'Pickup & Transporter Dispatch'];
  apiModules.forEach((m, i) => {
    const mx = 0.75 + i * 2.15;
    s.addShape('roundRect', {
      x: mx, y: 2.95, w: 2.05, h: 0.35,
      fill: { color: C.blueLight },
      line: { color: 'BFDBFE', width: 1 },
      rectRadius: 0.05
    });
    s.addText(m, {
      x: mx, y: 2.95, w: 2.05, h: 0.35,
      fontSize: 7, color: C.blueDark, align: 'center', valign: 'middle'
    });
  });

  // Protocol Connector Arrow
  s.addText('▼  Decoupled Service Invocation & Mongoose ODM Relational Mapping  ▼', {
    x: 0.6, y: 3.43, w: 8.8, h: 0.20,
    fontSize: 7.5, bold: true, color: C.slateLight, align: 'center', valign: 'middle'
  });

  // Tier 3 & 4: Split Lower Area
  // Left: Decision-Support Engines
  s.addShape('roundRect', {
    x: 0.6, y: 3.65, w: 4.30, h: 1.45,
    fill: { color: C.white },
    line: { color: C.amberDark, width: 1.5 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 0.75, y: 3.75, w: 1.8, h: 0.22,
    fill: { color: C.amberLight },
    rectRadius: 0.05
  });
  s.addText('DECISION ENGINES (CORE)', {
    x: 0.75, y: 3.75, w: 1.8, h: 0.22,
    fontSize: 6.5, bold: true, color: C.amberDark, align: 'center', valign: 'middle'
  });
  s.addText('Deterministic Algorithms & Rules', {
    x: 2.60, y: 3.75, w: 2.20, h: 0.22,
    fontSize: 7.5, bold: true, color: C.forestDark, valign: 'middle'
  });
  s.addText([
    { text: '• Buyer Match Agent: ', options: { bold: true, color: C.slateDark } },
    { text: 'Multi-criteria weighted scoring (0-100)\n', options: { color: C.slateMuted } },
    { text: '• Shelf-Life Decay: ', options: { bold: true, color: C.slateDark } },
    { text: 'Remaining freshness decay curves & alerts\n', options: { color: C.slateMuted } },
    { text: '• Demand Forecaster: ', options: { bold: true, color: C.slateDark } },
    { text: 'WMA historical mandi price & trend slopes\n', options: { color: C.slateMuted } },
    { text: '• Route Heuristics: ', options: { bold: true, color: C.slateDark } },
    { text: 'Payload capacity & perishability sequencing', options: { color: C.slateMuted } }
  ], {
    x: 0.75, y: 4.05, w: 4.00, h: 0.95,
    fontSize: 7, lineSpacingMultiple: 1.15
  });

  // Right: Persistence Tier
  s.addShape('roundRect', {
    x: 5.10, y: 3.65, w: 4.30, h: 1.45,
    fill: { color: C.white },
    line: { color: C.purpleDark, width: 1.5 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 5.25, y: 3.75, w: 1.8, h: 0.22,
    fill: { color: C.purpleLight },
    rectRadius: 0.05
  });
  s.addText('DATA PERSISTENCE TIER', {
    x: 5.25, y: 3.75, w: 1.8, h: 0.22,
    fontSize: 6.5, bold: true, color: C.purpleDark, align: 'center', valign: 'middle'
  });
  s.addText('MongoDB Atlas NoSQL Store', {
    x: 7.10, y: 3.75, w: 2.20, h: 0.22,
    fontSize: 7.5, bold: true, color: C.forestDark, valign: 'middle'
  });
  s.addText([
    { text: '• Schemas: ', options: { bold: true, color: C.slateDark } },
    { text: 'User, Crop, Demand, BuyerRequirement, Booking, Order\n', options: { color: C.slateMuted } },
    { text: '• Logistics: ', options: { bold: true, color: C.slateDark } },
    { text: 'PickupRequest (atomic locks), TransporterEarning\n', options: { color: C.slateMuted } },
    { text: '• Audit Trail: ', options: { bold: true, color: C.slateDark } },
    { text: 'TraceabilityEvent (idempotent operational log)\n', options: { color: C.slateMuted } },
    { text: '• Cloud Hosting: ', options: { bold: true, color: C.slateDark } },
    { text: 'MongoDB Atlas Distributed Replica Set Cluster', options: { color: C.slateMuted } }
  ], {
    x: 5.25, y: 4.05, w: 4.00, h: 0.95,
    fontSize: 7, lineSpacingMultiple: 1.15
  });

  s.addNotes('Slide 5 displays our 4-tier architecture. The presentation layer uses React 18 with role-specific Context providers. It communicates through authenticated REST APIs with our Node.js and Express backend. The backend enforces stateless JWT authorization and delegates tasks across business controllers, decision-support engines, and our MongoDB Atlas database using Mongoose ODM. This ensures horizontal scalability and modular maintainability.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 06: USER ROLES & FUNCTIONAL MODULES
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addSlideChrome(s, '06', 'Role Matrix', 'User Roles & Functional Module Matrix', 'Granular access control and feature partitioning tailored to specific supply-chain workflows');

  const roleMatrix = [
    {
      role: 'Farmer Portal',
      icon: '🌾',
      bg: C.mintLight, color: C.forestGreen,
      auth: 'Role: farmer (JWT Protected)',
      modules: [
        'Crop Inventory CRUD (Grade, Price, Qty)',
        'Demand Explorer (Market Price Bands)',
        'AI Centre (Buyer Matches, Harvest Plan)',
        'Shelf-Life Spoilage Monitor & Alerts',
        'Booking Acceptance / Rejection Flow',
        'Order Fulfillment (Preparing ➔ Ready)'
      ]
    },
    {
      role: 'Buyer Portal',
      icon: '🏢',
      bg: C.blueLight, color: C.blueDark,
      auth: 'Role: buyer (JWT Protected)',
      modules: [
        'Marketplace Browse & Category Search',
        'Requirements Broadcast (Target Specs)',
        'Direct Farm-Gate Booking Modal',
        'Order Fulfillment Milestone Tracking',
        'Delivery Verification (Ready ➔ Received)',
        'Traceability Timeline & Provenance'
      ]
    },
    {
      role: 'Transporter Portal',
      icon: '🚛',
      bg: C.amberLight, color: C.amberDark,
      auth: 'Role: transporter (JWT Protected)',
      modules: [
        'Open Pickup Board (Available Jobs)',
        'Atomic Request Acceptance Lock',
        'Trip Execution (Picked Up ➔ In Transit)',
        'Delivery Confirmation State Machine',
        'Trip Earnings & Payout Ledger',
        'Fleet & Vehicle Payload Profile'
      ]
    },
    {
      role: 'Platform Admin',
      icon: '⚙️',
      bg: C.purpleLight, color: C.purpleDark,
      auth: 'Role: admin (JWT Protected)',
      modules: [
        'System-wide User KYC & Verification',
        'Platform KPI Analytics Dashboard',
        'Dispute Resolution & Order Inspection',
        'Traceability Event Audit Explorer',
        'Payment Settlement Verification',
        'Decision Engine Diagnostic Monitoring'
      ]
    }
  ];

  roleMatrix.forEach((rm, i) => {
    const x = 0.6 + i * 2.23;
    s.addShape('roundRect', {
      x: x, y: 1.45, w: 2.13, h: 3.65,
      fill: { color: C.white },
      line: { color: C.borderMuted, width: 1 },
      rectRadius: 0.1
    });

    // Top Header Banner
    s.addShape('roundRect', {
      x: x + 0.1, y: 1.55, w: 1.93, h: 0.55,
      fill: { color: rm.bg },
      line: { color: rm.color, width: 1 },
      rectRadius: 0.08
    });
    s.addText(`${rm.icon}  ${rm.role}`, {
      x: x + 0.1, y: 1.58, w: 1.93, h: 0.25,
      fontSize: 8.5, bold: true, color: rm.color, align: 'center', valign: 'middle'
    });
    s.addText(rm.auth, {
      x: x + 0.1, y: 1.83, w: 1.93, h: 0.22,
      fontSize: 6.5, color: C.slateMuted, align: 'center', valign: 'middle'
    });

    // Feature list
    const feats = rm.modules.map(m => `• ${m}\n`).join('');
    s.addText(feats, {
      x: x + 0.1, y: 2.20, w: 1.93, h: 2.80,
      fontSize: 7.5, color: C.slateMuted, lineSpacingMultiple: 1.2
    });
  });

  s.addNotes('AgriFlow AI enforces strict separation of concerns across four roles. Farmers manage crop listings and fulfill orders. Buyers post procurement requirements and reserve produce. Transporters claim pickup orders and execute transit legs. Administrators govern platform transactions, user verification, and audit logs. All permissions are strictly governed by role-based access tokens.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 07: FARMER MODULE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addSlideChrome(s, '07', 'Stakeholder Module', 'Farmer Module: Crop Management & Demand-Linked Fulfillment', 'Empowering agricultural producers with inventory control, demand visibility, and order staging');

  const farmerCards = [
    {
      title: 'Crop Inventory & Batch Lifecycle',
      badge: 'CRUD & SCHEMA MAPPING',
      icon: '🌱',
      desc: 'Farmers catalog active crops with attributes: expected harvest date, quality grade, shelf-life days, expected price, and minimum acceptable price. Crop availability automatically decrements upon confirmed booking.',
      bullets: [
        'Automatic field mapping (e.g. availableQty ➔ availableQuantityKg)',
        'Visual status tags: Pre-Harvest, Harvest Ready, Harvested',
        'Prevents double-booking via atomic quantity deductions'
      ]
    },
    {
      title: 'Market Demand Explorer',
      badge: 'MANDI SIGNALS & BUYERS',
      icon: '📊',
      desc: 'Provides direct visibility into institutional demand. Farmers browse verified commercial requirements filtered by crop type, quality grade, required volume, and delivery destination.',
      bullets: [
        'Displays aggregated buyer price bands (Min vs Max offered)',
        'Highlights rising vs stable crop demand trends',
        'Direct link to pre-booking opportunities'
      ]
    },
    {
      title: 'Order Fulfillment Pipeline',
      badge: 'STATE MACHINE STAGING',
      icon: '📦',
      desc: 'Incoming buyer booking requests are reviewed and accepted. Accepting a booking creates an active Order, which the farmer advances through operational fulfillment milestones.',
      bullets: [
        'State progression: Confirmed ➔ Preparing ➔ Ready for Pickup',
        'Marking Ready automatically triggers Transporter Pickup request',
        'Farmer dashboard tracks pickup status and settlement logs'
      ]
    }
  ];

  farmerCards.forEach((c, i) => {
    const x = 0.6 + i * 2.98;
    s.addShape('roundRect', {
      x: x, y: 1.45, w: 2.84, h: 2.65,
      fill: { color: C.white },
      line: { color: C.borderMuted, width: 1 },
      rectRadius: 0.1
    });

    s.addShape('roundRect', {
      x: x + 0.15, y: 1.58, w: 1.8, h: 0.22,
      fill: { color: C.mintLight },
      rectRadius: 0.05
    });
    s.addText(c.badge, {
      x: x + 0.15, y: 1.58, w: 1.8, h: 0.22,
      fontSize: 6.5, bold: true, color: C.forestGreen, align: 'center', valign: 'middle'
    });

    s.addText(`${c.icon} ${c.title}`, {
      x: x + 0.15, y: 1.88, w: 2.54, h: 0.35,
      fontSize: 9.5, bold: true, color: C.forestDark, valign: 'middle'
    });

    s.addText(c.desc, {
      x: x + 0.15, y: 2.25, w: 2.54, h: 0.85,
      fontSize: 7.5, color: C.slateMuted, lineSpacingMultiple: 1.15
    });

    const bText = c.bullets.map(b => `✔ ${b}\n`).join('');
    s.addText(bText, {
      x: x + 0.15, y: 3.12, w: 2.54, h: 0.90,
      fontSize: 7, color: C.forestGreen, lineSpacingMultiple: 1.15
    });
  });

  // Bottom Implementation Callout Banner
  s.addShape('roundRect', {
    x: 0.6, y: 4.25, w: 8.8, h: 0.85,
    fill: { color: C.sageBg },
    line: { color: C.emerald, width: 1 },
    rectRadius: 0.08
  });
  s.addText('CONTROLLER ADAPTER PATTERN & INVENTORY CONCURRENCY:', {
    x: 0.8, y: 4.33, w: 8.4, h: 0.20,
    fontSize: 7.5, bold: true, color: C.forestDark
  });
  s.addText('Our backend cropController.js implements a bidirectional adapter pattern, isolating frontend canonical names (availableQty, expectedPrice, shelfLifeDays) from database schema attributes (availableQuantityKg, expectedPricePerKg, expectedShelfLife). Booking requests enforce atomic quantity checks to prevent overselling.', {
    x: 0.8, y: 4.55, w: 8.4, h: 0.45,
    fontSize: 7.5, color: C.slateMuted, lineSpacingMultiple: 1.15
  });

  s.addNotes('In the Farmer Module, producers manage their crop lifecycle from pre-harvest planting to post-harvest dispatch. The Farmer AI Centre provides real-time decision stubs for buyer discovery, harvest scheduling, and perishability alerts. Once a farmer accepts a booking request, the inventory is atomically adjusted, and the order is staged for logistics pickup.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 08: BUYER MODULE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addSlideChrome(s, '08', 'Stakeholder Module', 'Buyer Module: Marketplace Discovery, Demands & Tracking', 'Streamlining institutional procurement from verified farm gates with full milestone visibility');

  const buyerCards = [
    {
      title: 'Marketplace Produce Discovery',
      badge: 'FILTERED PROCUREMENT',
      icon: '🔍',
      desc: 'Wholesale buyers and food processors browse active crop batches. Robust multi-parameter filtering enables selection by crop category, target price bounds, farm location radius, and quality grade (Grade A/B).',
      bullets: [
        'Direct inspection of farm location and farmer verification status',
        'Shortlist crops to watchlist via ShortlistContext API',
        'Direct booking modal integration for immediate reservation'
      ]
    },
    {
      title: 'Requirement Broadcasting',
      badge: 'DEMAND BOARD POSTING',
      icon: '📢',
      desc: 'Buyers broadcast procurement mandates directly to the shared Demand repository. Farmers inspect these requirements, and our matching algorithm automatically ranks compatible farmer crops against them.',
      bullets: [
        'Specify required quantity, unit price, and delivery deadline',
        'Defines required quality specifications and delivery hub address',
        'Feeds the reverse-discovery buyer-matching pipeline'
      ]
    },
    {
      title: 'Order Tracking & Traceability',
      badge: 'MILESTONE VISIBILITY',
      icon: '🚚',
      desc: 'Buyers monitor order fulfillment through an authenticated delivery tracking view. Real-time status transitions show when produce is confirmed, prepared, picked up by transporter, and delivered.',
      bullets: [
        'Live tracking stages from farm-gate to warehouse dock',
        'Direct access to cryptographic traceability event timeline',
        'Automated payment record generation upon verified delivery'
      ]
    }
  ];

  buyerCards.forEach((c, i) => {
    const x = 0.6 + i * 2.98;
    s.addShape('roundRect', {
      x: x, y: 1.45, w: 2.84, h: 2.65,
      fill: { color: C.white },
      line: { color: C.borderMuted, width: 1 },
      rectRadius: 0.1
    });

    s.addShape('roundRect', {
      x: x + 0.15, y: 1.58, w: 1.8, h: 0.22,
      fill: { color: C.blueLight },
      rectRadius: 0.05
    });
    s.addText(c.badge, {
      x: x + 0.15, y: 1.58, w: 1.8, h: 0.22,
      fontSize: 6.5, bold: true, color: C.blueDark, align: 'center', valign: 'middle'
    });

    s.addText(`${c.icon} ${c.title}`, {
      x: x + 0.15, y: 1.88, w: 2.54, h: 0.35,
      fontSize: 9.5, bold: true, color: C.forestDark, valign: 'middle'
    });

    s.addText(c.desc, {
      x: x + 0.15, y: 2.25, w: 2.54, h: 0.85,
      fontSize: 7.5, color: C.slateMuted, lineSpacingMultiple: 1.15
    });

    const bText = c.bullets.map(b => `✔ ${b}\n`).join('');
    s.addText(bText, {
      x: x + 0.15, y: 3.12, w: 2.54, h: 0.90,
      fontSize: 7, color: C.blueDark, lineSpacingMultiple: 1.15
    });
  });

  // Bottom Workflow Banner
  s.addShape('roundRect', {
    x: 0.6, y: 4.25, w: 8.8, h: 0.85,
    fill: { color: C.blueLight },
    line: { color: C.blueDark, width: 1 },
    rectRadius: 0.08
  });
  s.addText('BUYER PROCUREMENT WORKFLOW PIPELINE:', {
    x: 0.8, y: 4.33, w: 8.4, h: 0.20,
    fontSize: 7.5, bold: true, color: C.blueDark
  });
  s.addText('Browse Marketplace ➔ Shortlist Crop ➔ Open BookingModal ➔ POST /api/bookings ➔ Farmer Accepts ➔ Auto-generates Order (#ORD-XXX) ➔ Track Delivery ➔ Receive Batch ➔ Generate Payment Record (Pending ➔ Settled)', {
    x: 0.8, y: 4.55, w: 8.4, h: 0.45,
    fontSize: 7.5, color: C.slateMuted, lineSpacingMultiple: 1.15
  });

  s.addNotes('The Buyer Module caters to wholesale retailers, food processors, and institutional buyers. They can either browse available marketplace inventory or broadcast forward requirements. The integrated booking modal locks crop quantities directly from the farm, while the order tracking view monitors transit milestones and verifies full batch traceability.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 09: TRANSPORTER MODULE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addSlideChrome(s, '09', 'Stakeholder Module', 'Transporter Module: Rural Logistics & Trip Execution', 'Closing the first-mile and mid-mile gap through automated pickup dispatch and delivery tracking');

  const transCards = [
    {
      title: 'Event-Driven Pickup Requests',
      badge: 'AUTOMATED DISPATCH',
      icon: '📋',
      desc: 'When an Order reaches Ready for Pickup, the backend automatically spawns an unassigned PickupRequest document. Drivers browse available farm jobs displaying cargo weight, pickup coordinates, and payout tariffs.',
      bullets: [
        'Single PickupRequest per Order (unique orderId index)',
        'Displays commodity type, volume (kg), and urgency tier',
        'Includes farm pickup location and buyer delivery hub address'
      ]
    },
    {
      title: 'Atomic Acceptance Lock',
      badge: 'CONCURRENCY CONTROL',
      icon: '🔒',
      desc: 'Transporters accept pickup jobs with strict database-level concurrency protection. The acceptance query atomically updates status to ACCEPTED and assigns transporterId, preventing conflicting multi-driver claims.',
      bullets: [
        'Atomic findOneAndUpdate query prevents race conditions',
        'Instant assignment lock reserves consignment for driver',
        'Job immediately transitions into driver Active Trips view'
      ]
    },
    {
      title: 'Trip Lifecycle & Earnings',
      badge: 'SETTLEMENT WORKFLOW',
      icon: '💰',
      desc: 'Drivers execute sequential delivery milestones: PICKED_UP ➔ IN_TRANSIT ➔ DELIVERED. Delivering the consignment automatically triggers a TransporterEarning record for verified freight compensation.',
      bullets: [
        'Milestone transitions automatically update the master Order',
        'Automated tariff calculation based on cargo weight & distance',
        'Earnings ledger tracks Pending vs Settled freight payouts'
      ]
    }
  ];

  transCards.forEach((c, i) => {
    const x = 0.6 + i * 2.98;
    s.addShape('roundRect', {
      x: x, y: 1.45, w: 2.84, h: 2.65,
      fill: { color: C.white },
      line: { color: C.borderMuted, width: 1 },
      rectRadius: 0.1
    });

    s.addShape('roundRect', {
      x: x + 0.15, y: 1.58, w: 1.8, h: 0.22,
      fill: { color: C.amberLight },
      rectRadius: 0.05
    });
    s.addText(c.badge, {
      x: x + 0.15, y: 1.58, w: 1.8, h: 0.22,
      fontSize: 6.5, bold: true, color: C.amberDark, align: 'center', valign: 'middle'
    });

    s.addText(`${c.icon} ${c.title}`, {
      x: x + 0.15, y: 1.88, w: 2.54, h: 0.35,
      fontSize: 9.5, bold: true, color: C.forestDark, valign: 'middle'
    });

    s.addText(c.desc, {
      x: x + 0.15, y: 2.25, w: 2.54, h: 0.85,
      fontSize: 7.5, color: C.slateMuted, lineSpacingMultiple: 1.15
    });

    const bText = c.bullets.map(b => `✔ ${b}\n`).join('');
    s.addText(bText, {
      x: x + 0.15, y: 3.12, w: 2.54, h: 0.90,
      fontSize: 7, color: C.amberDark, lineSpacingMultiple: 1.15
    });
  });

  // Bottom Technical Implementation Banner
  s.addShape('roundRect', {
    x: 0.6, y: 4.25, w: 8.8, h: 0.85,
    fill: { color: C.amberLight },
    line: { color: C.amberDark, width: 1 },
    rectRadius: 0.08
  });
  s.addText('TRANSPORTER STATE MACHINE TRANSITIONS (BACKEND CONTROLLER):', {
    x: 0.8, y: 4.33, w: 8.4, h: 0.20,
    fontSize: 7.5, bold: true, color: C.amberDark
  });
  s.addText('Order marked "Ready for Pickup" ➔ Auto-spawns PickupRequest (PENDING) ➔ Transporter PUT /api/pickups/:id/accept (Atomic Lock ➔ ACCEPTED) ➔ PUT /api/trips/:id/pickup (PICKED_UP) ➔ PUT /api/trips/:id/in-transit (IN_TRANSIT) ➔ PUT /api/trips/:id/delivered (DELIVERED ➔ Spawns TransporterEarning & Emits TraceabilityEvent)', {
    x: 0.8, y: 4.55, w: 8.4, h: 0.45,
    fontSize: 7.5, color: C.slateMuted, lineSpacingMultiple: 1.15
  });

  s.addNotes('The Transporter Module addresses the critical last-mile and first-mile bottleneck. When an order is marked Ready for Pickup, our backend automatically spawns a Pickup Request. Transporters accept jobs with atomic database locking, execute the physical delivery stages, and generate verified earning entries. This closes the operational loop between field and warehouse.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 10: AI DECISION-SUPPORT ARCHITECTURE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addSlideChrome(s, '10', 'Intelligence Architecture', 'AI Decision-Support Architecture: Explainability by Design', 'Why deterministic, explainable mathematical scoring is essential for agricultural commerce');

  // Top Comparison Banner: Deterministic vs LLM
  s.addShape('roundRect', {
    x: 0.6, y: 1.45, w: 8.8, h: 0.90,
    fill: { color: C.white },
    line: { color: C.emerald, width: 1.5 },
    rectRadius: 0.08
  });
  s.addText('ENGINEERING PARADIGM: EXPLAINABLE MULTI-CRITERIA SCORING VS BLACK-BOX LLMs', {
    x: 0.8, y: 1.52, w: 8.4, h: 0.20,
    fontSize: 7.5, bold: true, color: C.forestGreen
  });
  s.addText([
    { text: '• Why Not Chatbots for Commerce? ', options: { bold: true, color: C.forestDark } },
    { text: 'High-value agricultural transactions cannot tolerate stochastic hallucinations, non-deterministic pricing, or unexplainable recommendations.\n', options: { color: C.slateMuted } },
    { text: '• Deterministic Decision Core: ', options: { bold: true, color: C.forestDark } },
    { text: 'AgriFlow AI employs mathematically formulated multi-criteria scoring models that output normalized 0–100 compatibility scores accompanied by auditable, human-readable justification vectors.', options: { color: C.slateMuted } }
  ], {
    x: 0.8, y: 1.75, w: 8.4, h: 0.55,
    fontSize: 7.5, lineSpacingMultiple: 1.15
  });

  // 4 AI Agents / Engines
  const engines = [
    {
      title: 'Buyer–Farmer Matcher',
      color: C.forestGreen, bg: C.mintLight,
      desc: 'Scores crop-buyer pairs using a 6-factor weighted algorithm (Price, Quality, Volume, Proximity, Date, Reliability). Returns matchScore (0–100) and matchReasons[].'
    },
    {
      title: 'Demand Trend Forecaster',
      color: C.blueDark, bg: C.blueLight,
      desc: 'Evaluates historical mandi arrival series and wholesale spot price trajectories. Uses weighted moving averages to project forward demand levels and expected price bands.'
    },
    {
      title: 'Shelf-Life Decay Monitor',
      color: C.amberDark, bg: C.amberLight,
      desc: 'Calculates Remaining Shelf Life (RSL%) using commodity perishability decay constants. Categorizes spoilage risk into Fresh, Attention, and Critical tiers with action triggers.'
    },
    {
      title: 'Route & Pickup Planner',
      color: C.purpleDark, bg: C.purpleLight,
      desc: 'Heuristic multi-stop vehicle dispatch optimizer. Clusters farm-gate pickup orders by location, checks truck payload capacity, and elevates perishable batches to earliest stops.'
    }
  ];

  engines.forEach((e, i) => {
    const x = 0.6 + i * 2.23;
    s.addShape('roundRect', {
      x: x, y: 2.50, w: 2.13, h: 2.60,
      fill: { color: C.white },
      line: { color: C.borderMuted, width: 1 },
      rectRadius: 0.1
    });

    s.addShape('roundRect', {
      x: x + 0.1, y: 2.62, w: 1.93, h: 0.35,
      fill: { color: e.bg },
      line: { color: e.color, width: 1 },
      rectRadius: 0.06
    });
    s.addText(e.title, {
      x: x + 0.1, y: 2.62, w: 1.93, h: 0.35,
      fontSize: 8.5, bold: true, color: e.color, align: 'center', valign: 'middle'
    });

    s.addText(e.desc, {
      x: x + 0.1, y: 3.08, w: 1.93, h: 1.90,
      fontSize: 7.5, color: C.slateMuted, lineSpacingMultiple: 1.2
    });
  });

  s.addNotes('On Slide 10, we present our Decision-Support Architecture. We deliberately avoided black-box LLM chatbots for core commerce functions. In agriculture, stakeholders require deterministic, auditable decisions. Our four decision engines evaluate inventory, demand, shelf-life, and route constraints through normalized mathematical formulations, returning explainable scores and transparent justifications.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 11: BUYER-FARMER MATCHING ENGINE
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addSlideChrome(s, '11', 'Decision Engine 1', 'Buyer–Farmer Matching: Multi-Criteria Weighted Model', 'Formal mathematical formulation for ranking produce compatibility against procurement specifications');

  // Left Column: Weight Matrix Table
  s.addShape('roundRect', {
    x: 0.6, y: 1.45, w: 5.20, h: 3.65,
    fill: { color: C.white },
    line: { color: C.borderMuted, width: 1 },
    rectRadius: 0.08
  });

  s.addText('COMPOSITE MATCH SCORE: S_match = ∑ ( w_i • s_i )   [ 0 ≤ S_match ≤ 100 ]', {
    x: 0.75, y: 1.55, w: 4.90, h: 0.25,
    fontSize: 8, bold: true, color: C.forestGreen
  });

  // Table Data
  const tableRows = [
    [
      { text: 'Evaluation Factor', options: { bold: true, fill: C.forestDark, color: C.white, fontSize: 7.5 } },
      { text: 'Weight', options: { bold: true, fill: C.forestDark, color: C.white, fontSize: 7.5, align: 'center' } },
      { text: 'Scoring Metric & Mathematical Logic', options: { bold: true, fill: C.forestDark, color: C.white, fontSize: 7.5 } }
    ],
    [
      { text: 'Price Compatibility', options: { bold: true, fontSize: 7 } },
      { text: '25%', options: { bold: true, color: C.forestGreen, align: 'center', fontSize: 7 } },
      { text: 'Ratio of Buyer Offer vs Farmer Min Price. Max score if Offer ≥ Expected Price.', options: { fontSize: 6.8 } }
    ],
    [
      { text: 'Quality Grade Match', options: { bold: true, fontSize: 7 } },
      { text: '20%', options: { bold: true, color: C.forestGreen, align: 'center', fontSize: 7 } },
      { text: 'Exact Grade Match = 100%; Grade A supply to Grade B need = 90%; Incompatible = 0%.', options: { fontSize: 6.8 } }
    ],
    [
      { text: 'Quantity Fulfillment', options: { bold: true, fontSize: 7 } },
      { text: '20%', options: { bold: true, color: C.forestGreen, align: 'center', fontSize: 7 } },
      { text: 'min(AvailableQty / RequiredQty, 1.0) × 100. Penalized if batch satisfies < 30%.', options: { fontSize: 6.8 } }
    ],
    [
      { text: 'Geographic Proximity', options: { bold: true, fontSize: 7 } },
      { text: '15%', options: { bold: true, color: C.forestGreen, align: 'center', fontSize: 7 } },
      { text: 'Haversine distance decay function: max(0, 100 - (Distance_km / MaxRadius) × 100).', options: { fontSize: 6.8 } }
    ],
    [
      { text: 'Date Suitability', options: { bold: true, fontSize: 7 } },
      { text: '10%', options: { bold: true, color: C.forestGreen, align: 'center', fontSize: 7 } },
      { text: 'Time delta between crop harvest readiness date and buyer required delivery date.', options: { fontSize: 6.8 } }
    ],
    [
      { text: 'Reliability Rating', options: { bold: true, fontSize: 7 } },
      { text: '10%', options: { bold: true, color: C.forestGreen, align: 'center', fontSize: 7 } },
      { text: 'Historical order fulfillment track record and farmer verification status.', options: { fontSize: 6.8 } }
    ]
  ];

  s.addTable(tableRows, {
    x: 0.75, y: 1.85, w: 4.90, h: 3.10,
    colW: [1.40, 0.65, 2.85],
    border: { pt: 0.5, color: C.borderLight },
    fill: C.white,
    autoPage: false
  });

  // Right Column: Explainable Output JSON Payload
  s.addShape('roundRect', {
    x: 5.95, y: 1.45, w: 3.45, h: 3.65,
    fill: { color: '0F172A' },
    line: { color: '334155', width: 1 },
    rectRadius: 0.08
  });
  s.addText('EXPLAINABLE JSON PAYLOAD (OUTPUT)', {
    x: 6.10, y: 1.58, w: 3.15, h: 0.22,
    fontSize: 7.5, bold: true, color: '38BDF8'
  });

  const jsonSnippet = `{\n  "cropName": "Tomato (Hybrid Roma)",\n  "buyerName": "FreshMart Pvt Ltd",\n  "matchScore": 92,\n  "matchReasons": [\n    "Grade matches buyer need (Grade A)",\n    "Location within 50 km (Nashik->Pune)",\n    "Quantity satisfies 100% of order",\n    "Offer price (₹30) > minPrice (₹25)"\n  ],\n  "urgency": "High",\n  "deadline": "2026-11-05"\n}`;
  s.addText(jsonSnippet, {
    x: 6.10, y: 1.90, w: 3.15, h: 2.10,
    fontSize: 7.5, color: 'A7F3D0', fontFace: 'Consolas'
  });

  s.addShape('roundRect', {
    x: 6.10, y: 4.15, w: 3.15, h: 0.80,
    fill: { color: '1E293B' },
    line: { color: '475569', width: 1 },
    rectRadius: 0.06
  });
  s.addText('KEY BENEFIT FOR FARMERS:\nEvery match displays explicit reasons (price margin, distance, grade match). Farmers know exactly why a buyer is recommended before accepting a contract.', {
    x: 6.15, y: 4.20, w: 3.05, h: 0.70,
    fontSize: 6.8, color: 'E2E8F0', lineSpacingMultiple: 1.15
  });

  s.addNotes('Slide 11 details our Multi-Criteria Buyer-Farmer Matching algorithm. The composite match score is a weighted linear combination of price compatibility, quality grade, quantity fulfillment, geographic distance, date suitability, and reliability. As shown in the JSON snippet, every recommendation returns an explicit list of reasons, giving the farmer complete transparency into why the buyer was recommended.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 12: DEMAND FORECASTING & SHELF-LIFE MONITORING
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addSlideChrome(s, '12', 'Decision Engines 2 & 3', 'Demand Forecasting & Shelf-Life Decay Engines', 'Twin analytical models balancing forward market intelligence with post-harvest perishability');

  // Left Panel: Demand Forecasting Engine
  s.addShape('roundRect', {
    x: 0.6, y: 1.45, w: 4.30, h: 3.65,
    fill: { color: C.white },
    line: { color: C.blueDark, width: 1.5 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 0.75, y: 1.58, w: 2.0, h: 0.24,
    fill: { color: C.blueLight },
    rectRadius: 0.05
  });
  s.addText('A. DEMAND FORECASTING ENGINE', {
    x: 0.75, y: 1.58, w: 2.0, h: 0.24,
    fontSize: 7, bold: true, color: C.blueDark, align: 'center', valign: 'middle'
  });
  s.addText('Weighted Moving Average & Trend Slope', {
    x: 2.80, y: 1.58, w: 1.95, h: 0.24,
    fontSize: 7.5, bold: true, color: C.forestDark, valign: 'middle'
  });

  s.addText([
    { text: '1. Mathematical Model:\n', options: { bold: true, color: C.forestDark } },
    { text: '• Weighted Moving Average (WMA) on mandi price series:\n', options: { color: C.slateMuted } },
    { text: '  D̂_t = ∑ ( α_i • D_t-i )   where ∑ α_i = 1.0 (recent emphasis)\n', options: { fontFace: 'Consolas', color: C.blueDark } },
    { text: '2. Trend Slope Classification:\n', options: { bold: true, color: C.forestDark } },
    { text: '• Rising: ', options: { bold: true, color: C.forestGreen } },
    { text: 'Price/demand velocity slope > +5%\n', options: { color: C.slateMuted } },
    { text: '• Stable: ', options: { bold: true, color: C.blueDark } },
    { text: 'Velocity delta within [-5%, +5%]\n', options: { color: C.slateMuted } },
    { text: '• Falling: ', options: { bold: true, color: C.redDark } },
    { text: 'Velocity slope < -5% (early distress warning)\n', options: { color: C.slateMuted } },
    { text: '3. Decision Outputs for Farmers:\n', options: { bold: true, color: C.forestDark } },
    { text: '• Predicted demand volume (kg) by geographic cluster\n', options: { color: C.slateMuted } },
    { text: '• Suggested price range (Expected Min vs Max ₹/kg)\n', options: { color: C.slateMuted } },
    { text: '• Confidence index derived from sample arrival volume', options: { color: C.slateMuted } }
  ], {
    x: 0.75, y: 1.90, w: 4.00, h: 3.10,
    fontSize: 7.5, lineSpacingMultiple: 1.15
  });

  // Right Panel: Shelf-Life Spoilage Risk Engine
  s.addShape('roundRect', {
    x: 5.10, y: 1.45, w: 4.30, h: 3.65,
    fill: { color: C.white },
    line: { color: C.amberDark, width: 1.5 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 5.25, y: 1.58, w: 2.1, h: 0.24,
    fill: { color: C.amberLight },
    rectRadius: 0.05
  });
  s.addText('B. SHELF-LIFE & SPOILAGE ENGINE', {
    x: 5.25, y: 1.58, w: 2.1, h: 0.24,
    fontSize: 7, bold: true, color: C.amberDark, align: 'center', valign: 'middle'
  });
  s.addText('Freshness Index & Prescriptive Actions', {
    x: 7.40, y: 1.58, w: 1.85, h: 0.24,
    fontSize: 7.5, bold: true, color: C.forestDark, valign: 'middle'
  });

  s.addText([
    { text: '1. Decay Formula:\n', options: { bold: true, color: C.forestDark } },
    { text: '• Remaining Shelf Life percentage (RSL%):\n', options: { color: C.slateMuted } },
    { text: '  RSL = [ (T_shelf - t_elapsed) / T_shelf ] × 100%\n', options: { fontFace: 'Consolas', color: C.amberDark } },
    { text: '2. Perishability Risk Tiers:\n', options: { bold: true, color: C.forestDark } },
    { text: '• Fresh (> 50% RSL): ', options: { bold: true, color: C.forestGreen } },
    { text: 'Normal marketplace listing; standard pricing\n', options: { color: C.slateMuted } },
    { text: '• Attention (25% - 50% RSL): ', options: { bold: true, color: C.amberDark } },
    { text: 'System issues buyer alert; priority pickup\n', options: { color: C.slateMuted } },
    { text: '• Critical (< 25% RSL): ', options: { bold: true, color: C.redDark } },
    { text: 'High spoilage risk; immediate markdown & dispatch\n', options: { color: C.slateMuted } },
    { text: '3. Prescriptive Wastage Mitigation Triggers:\n', options: { bold: true, color: C.forestDark } },
    { text: '• Action 1: Suggest 10-15% markdown within minPrice margin\n', options: { color: C.slateMuted } },
    { text: '• Action 2: Trigger urgent pickup notification to transporters\n', options: { color: C.slateMuted } },
    { text: '• Action 3: Auto-match with nearby institutional processors', options: { color: C.slateMuted } }
  ], {
    x: 5.25, y: 1.90, w: 4.00, h: 3.10,
    fontSize: 7.5, lineSpacingMultiple: 1.15
  });

  s.addNotes('Slide 12 covers our twin analytical engines: Demand Forecasting and Shelf-Life Spoilage Monitoring. The Demand engine combines historical mandi price series and weighted moving averages to project future volume and price bands. The Shelf-Life engine calculates Remaining Shelf Life percentage from harvest date, categorizing batches into Fresh, Attention, or Critical, and triggering automated actions such as price markdowns or expedited transport.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 13: ROUTE & PICKUP OPTIMIZATION
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addSlideChrome(s, '13', 'Decision Engine 4', 'Farm-Gate Route & Pickup Optimization', 'Heuristic multi-stop pickup scheduling considering vehicle payload, distance, and perishability');

  // Top 3 Process Steps
  const routeSteps = [
    {
      step: '01. OPEN PICKUP POOL',
      title: 'Geographic Clustering',
      desc: 'Aggregates all open Ready for Pickup orders within a designated agricultural cluster or mandi district radius.',
      color: C.blueDark, bg: C.blueLight
    },
    {
      step: '02. CONSTRAINTS ENGINE',
      title: 'Payload & Perishability Check',
      desc: 'Evaluates truck capacity limits (∑ Q_i ≤ C_truck) and prioritizes batches flagged as Critical by Shelf-Life Agent.',
      color: C.amberDark, bg: C.amberLight
    },
    {
      step: '03. HEURISTIC DISPATCH',
      title: 'Optimized Multi-Stop Itinerary',
      desc: 'Constructs sequenced pickup stops minimizing total transit distance and deadhead miles from depot to delivery dock.',
      color: C.forestGreen, bg: C.mintLight
    }
  ];

  routeSteps.forEach((rs, i) => {
    const x = 0.6 + i * 2.98;
    s.addShape('roundRect', {
      x: x, y: 1.45, w: 2.84, h: 1.65,
      fill: { color: C.white },
      line: { color: C.borderMuted, width: 1 },
      rectRadius: 0.08
    });
    s.addShape('roundRect', {
      x: x + 0.15, y: 1.58, w: 1.6, h: 0.22,
      fill: { color: rs.bg },
      rectRadius: 0.05
    });
    s.addText(rs.step, {
      x: x + 0.15, y: 1.58, w: 1.6, h: 0.22,
      fontSize: 6.5, bold: true, color: rs.color, align: 'center', valign: 'middle'
    });
    s.addText(rs.title, {
      x: x + 0.15, y: 1.88, w: 2.54, h: 0.25,
      fontSize: 9, bold: true, color: C.forestDark, valign: 'middle'
    });
    s.addText(rs.desc, {
      x: x + 0.15, y: 2.18, w: 2.54, h: 0.80,
      fontSize: 7.5, color: C.slateMuted, lineSpacingMultiple: 1.15
    });
  });

  // Middle Formulation Box
  s.addShape('roundRect', {
    x: 0.6, y: 3.25, w: 8.8, h: 0.65,
    fill: { color: C.white },
    line: { color: C.forestGreen, width: 1 },
    rectRadius: 0.08
  });
  s.addText('MATHEMATICAL OBJECTIVE FUNCTION (VEHICLE ROUTING WITH PERISHABILITY WINDOWS):', {
    x: 0.8, y: 3.32, w: 8.4, h: 0.18,
    fontSize: 7.5, bold: true, color: C.forestDark
  });
  s.addText('min  [  ∑ ( c_ij • x_ij )  +  ∑ λ_k • UrgencyPenalty_k  ]     Subject to:  ∑ Q_i ≤ VehiclePayloadCapacity  and  ETA_k ≤ ShelfLifeExpiry_k', {
    x: 0.8, y: 3.55, w: 8.4, h: 0.25,
    fontSize: 8, bold: true, color: C.forestGreen, fontFace: 'Consolas'
  });

  // Bottom Trip Manifest Example
  s.addShape('roundRect', {
    x: 0.6, y: 4.05, w: 8.8, h: 1.05,
    fill: { color: C.sageBg },
    line: { color: C.borderMuted, width: 1 },
    rectRadius: 0.08
  });
  s.addText('SIMULATED MULTI-STOP TRIP MANIFEST (NASHIK CLUSTER ➔ PUNE WHOLESALE TERMINAL):', {
    x: 0.8, y: 4.13, w: 8.4, h: 0.20,
    fontSize: 7.5, bold: true, color: C.forestGreen
  });

  const tripStops = [
    { loc: 'Transporter Depot', action: 'Depart Empty (2.5T Truck)', stat: '07:00 AM' },
    { loc: 'Farm Stop A (Nashik)', action: 'Load 800 kg Tomatoes', stat: 'Urgency: High (RSL 22%)' },
    { loc: 'Farm Stop B (Sinnar)', action: 'Load 1,200 kg Onions', stat: 'Urgency: Med (RSL 45%)' },
    { loc: 'Buyer Hub (Pune)', action: 'Unload 2,000 kg Consignment', stat: 'Arrival: 11:30 AM (84 km)' }
  ];

  tripStops.forEach((ts, idx) => {
    const tx = 0.8 + idx * 2.15;
    s.addShape('roundRect', {
      x: tx, y: 4.38, w: 2.05, h: 0.62,
      fill: { color: C.white },
      line: { color: C.borderLight, width: 1 },
      rectRadius: 0.06
    });
    s.addText(ts.loc, {
      x: tx + 0.05, y: 4.42, w: 1.95, h: 0.18,
      fontSize: 7.5, bold: true, color: C.forestDark
    });
    s.addText(ts.action, {
      x: tx + 0.05, y: 4.60, w: 1.95, h: 0.18,
      fontSize: 6.8, color: C.slateMuted
    });
    s.addText(ts.stat, {
      x: tx + 0.05, y: 4.78, w: 1.95, h: 0.18,
      fontSize: 6.5, bold: true, color: C.forestGreen
    });
  });

  s.addNotes('Slide 13 outlines our logistics optimization logic. Rather than sending individual vehicles for small farmer consignments, the system aggregates pickup orders into consolidated multi-stop routes. The model enforces truck payload constraints while applying an urgency penalty that pushes highly perishable batches to the head of the pickup queue.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 14: END-TO-END BUSINESS WORKFLOW & TRACEABILITY
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addSlideChrome(s, '14', 'Workflow & Provenance', 'End-to-End Business Workflow & Traceability Lifecycle', 'Unified data flow connecting crops, bookings, orders, pickups, payments, and audit logs');

  // Top 8-Stage Lifecycle Chain
  s.addShape('roundRect', {
    x: 0.6, y: 1.45, w: 8.8, h: 1.35,
    fill: { color: C.white },
    line: { color: C.emerald, width: 1.5 },
    rectRadius: 0.08
  });
  s.addText('COMPLETE 8-STAGE TRANSACTION STATE MACHINE LIFECYCLE:', {
    x: 0.8, y: 1.55, w: 8.4, h: 0.20,
    fontSize: 7.5, bold: true, color: C.forestGreen
  });

  const flowSteps = [
    { num: '1', title: 'Crop Listed', sub: 'Harvest ready' },
    { num: '2', title: 'Demand Match', sub: 'Ranked 0-100' },
    { num: '3', title: 'Booking Placed', sub: 'Qty locked' },
    { num: '4', title: 'Order Confirmed', sub: 'Farmer accepts' },
    { num: '5', title: 'Ready for Pickup', sub: 'Auto-spawns req' },
    { num: '6', title: 'Transit Leg', sub: 'Driver locked' },
    { num: '7', title: 'Delivered', sub: 'Dock confirmed' },
    { num: '8', title: 'Payment Settled', sub: 'Ledger cleared' }
  ];

  flowSteps.forEach((fs, i) => {
    const fx = 0.75 + i * 1.07;
    s.addShape('roundRect', {
      x: fx, y: 1.80, w: 0.98, h: 0.85,
      fill: { color: C.sageBg },
      line: { color: C.borderMuted, width: 1 },
      rectRadius: 0.06
    });
    s.addShape('ellipse', {
      x: fx + 0.34, y: 1.88, w: 0.30, h: 0.30,
      fill: { color: C.mintLight },
      line: { color: C.emerald, width: 1 }
    });
    s.addText(fs.num, {
      x: fx + 0.34, y: 1.88, w: 0.30, h: 0.30,
      fontSize: 7.5, bold: true, color: C.forestGreen, align: 'center', valign: 'middle'
    });
    s.addText(fs.title, {
      x: fx + 0.02, y: 2.22, w: 0.94, h: 0.22,
      fontSize: 6.8, bold: true, color: C.forestDark, align: 'center', valign: 'middle'
    });
    s.addText(fs.sub, {
      x: fx + 0.02, y: 2.42, w: 0.94, h: 0.18,
      fontSize: 6, color: C.slateMuted, align: 'center', valign: 'middle'
    });
  });

  // Lower Left: Linked Data Entities
  s.addShape('roundRect', {
    x: 0.6, y: 2.95, w: 4.30, h: 2.15,
    fill: { color: C.white },
    line: { color: C.borderMuted, width: 1 },
    rectRadius: 0.08
  });
  s.addText('RELATIONAL ENTITY LINKAGE IN MONGODB:', {
    x: 0.75, y: 3.05, w: 4.00, h: 0.20,
    fontSize: 7.5, bold: true, color: C.forestGreen
  });
  s.addText([
    { text: '• Crop Document: ', options: { bold: true, color: C.forestDark } },
    { text: 'Root harvest batch; stores availableQty.\n', options: { color: C.slateMuted } },
    { text: '• Booking Document: ', options: { bold: true, color: C.forestDark } },
    { text: 'References cropId + buyerId + requested delivery.\n', options: { color: C.slateMuted } },
    { text: '• Order Document: ', options: { bold: true, color: C.forestDark } },
    { text: 'Created upon acceptance; holds fulfillment timeline[].\n', options: { color: C.slateMuted } },
    { text: '• PickupRequest Document: ', options: { bold: true, color: C.forestDark } },
    { text: 'Holds unique orderId ref + assigned transporterId.\n', options: { color: C.slateMuted } },
    { text: '• Payment Document: ', options: { bold: true, color: C.forestDark } },
    { text: 'Unique orderId ref; auto-switches Pending ➔ Paid.\n', options: { color: C.slateMuted } },
    { text: '• TraceabilityEvent Document: ', options: { bold: true, color: C.forestDark } },
    { text: 'Immutable chronological event ledger per order.', options: { color: C.slateMuted } }
  ], {
    x: 0.75, y: 3.28, w: 4.00, h: 1.70,
    fontSize: 7, lineSpacingMultiple: 1.15
  });

  // Lower Right: Traceability Timeline Events
  s.addShape('roundRect', {
    x: 5.10, y: 2.95, w: 4.30, h: 2.15,
    fill: { color: '0F172A' },
    line: { color: '334155', width: 1 },
    rectRadius: 0.08
  });
  s.addText('AUDIT-GRADE TRACEABILITY EVENT LOG (SAMPLE)', {
    x: 5.25, y: 3.05, w: 4.00, h: 0.20,
    fontSize: 7.5, bold: true, color: '38BDF8'
  });

  const traceEvents = [
    '[HARVESTED]          Loc: Nashik Farm A     | Actor: Farmer',
    '[QUALITY_CHECKED]    Grade: Grade A         | Actor: Quality Agent',
    '[BOOKED]             Buyer: FreshMart       | Ref: Booking #B-108',
    '[PICKUP_SCHEDULED]   Truck: MH-15-AB1234    | Ref: Pickup #P-402',
    '[IN_TRANSIT]         Route: Nashik -> Pune  | Actor: Transporter',
    '[DELIVERED]          Loc: Pune Warehouse    | Actor: Buyer',
    '[PAYMENT_RECEIVED]   Amount: ₹24,000        | Ref: Pay #TX-902'
  ];

  s.addText(traceEvents.join('\n'), {
    x: 5.25, y: 3.32, w: 4.00, h: 1.70,
    fontSize: 6.8, color: 'A7F3D0', fontFace: 'Consolas', lineSpacingMultiple: 1.2
  });

  s.addNotes('Slide 14 maps the complete 12-step transactional lifecycle. Notice that data entities remain linked from end to end: the Crop ID links to the Booking ID, which maps to the Order ID, the Pickup Request, and the final Payment record. At each critical milestone, an idempotent traceability event is committed. This provides an audit-ready event trail accessible to all parties.');
}

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 15: RESULTS, FUTURE SCOPE & CONCLUSION
// ══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  addSlideChrome(s, '15', 'Evaluation & Roadmap', 'Project Results, Future Scope & Academic Conclusion', 'Transparent summary of verified achievements, production roadmap, and technical conclusions');

  // Left Column: Verified Achievements
  s.addShape('roundRect', {
    x: 0.6, y: 1.45, w: 4.30, h: 2.50,
    fill: { color: C.white },
    line: { color: C.forestGreen, width: 1.5 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 0.75, y: 1.58, w: 2.2, h: 0.22,
    fill: { color: C.mintLight },
    rectRadius: 0.05
  });
  s.addText('IMPLEMENTED & VERIFIED (LIVE)', {
    x: 0.75, y: 1.58, w: 2.2, h: 0.22,
    fontSize: 6.5, bold: true, color: C.forestGreen, align: 'center', valign: 'middle'
  });

  s.addText([
    { text: '✔ Multi-Tenant Portals: ', options: { bold: true, color: C.forestDark } },
    { text: 'Responsive Farmer, Buyer, and Transporter workflows in React 18 + Tailwind.\n', options: { color: C.slateMuted } },
    { text: '✔ Secure Auth & RBAC: ', options: { bold: true, color: C.forestDark } },
    { text: 'Express JWT auth middleware (protect) with bcrypt password hashing.\n', options: { color: C.slateMuted } },
    { text: '✔ Transactional State Machine: ', options: { bold: true, color: C.forestDark } },
    { text: 'Complete Booking ➔ Order ➔ PickupRequest ➔ Payment lifecycle.\n', options: { color: C.slateMuted } },
    { text: '✔ Explainable Decision Engines: ', options: { bold: true, color: C.forestDark } },
    { text: 'Multi-criteria matching and shelf-life decay monitoring stubs.\n', options: { color: C.slateMuted } },
    { text: '✔ Milestone Traceability Service: ', options: { bold: true, color: C.forestDark } },
    { text: 'Idempotent event logger recording operational audit timestamps.\n', options: { color: C.slateMuted } },
    { text: '✔ Cloud Deployment: ', options: { bold: true, color: C.forestDark } },
    { text: 'Frontend on Vercel, Backend on Render, Database on MongoDB Atlas.', options: { color: C.slateMuted } }
  ], {
    x: 0.75, y: 1.88, w: 4.00, h: 1.95,
    fontSize: 7, lineSpacingMultiple: 1.15
  });

  // Right Column: Planned Future Scope
  s.addShape('roundRect', {
    x: 5.10, y: 1.45, w: 4.30, h: 2.50,
    fill: { color: C.white },
    line: { color: C.blueDark, width: 1.5 },
    rectRadius: 0.08
  });
  s.addShape('roundRect', {
    x: 5.25, y: 1.58, w: 2.2, h: 0.22,
    fill: { color: C.blueLight },
    rectRadius: 0.05
  });
  s.addText('PLANNED PRODUCTION ENHANCEMENTS', {
    x: 5.25, y: 1.58, w: 2.2, h: 0.22,
    fontSize: 6.5, bold: true, color: C.blueDark, align: 'center', valign: 'middle'
  });

  s.addText([
    { text: '➤ Production ML Time-Series: ', options: { bold: true, color: C.blueDark } },
    { text: 'Train LSTM / ARIMA models on 10-year Agmarknet national mandi price datasets.\n', options: { color: C.slateMuted } },
    { text: '➤ Real-Time IoT Telematics: ', options: { bold: true, color: C.blueDark } },
    { text: 'Hardware GPS trackers and LoRaWAN cold-storage temperature/humidity sensors.\n', options: { color: C.slateMuted } },
    { text: '➤ Enterprise Blockchain Anchoring: ', options: { bold: true, color: C.blueDark } },
    { text: 'Anchor TraceabilityEvent cryptographic hashes to Polygon/Ethereum for trustless audit.\n', options: { color: C.slateMuted } },
    { text: '➤ Automated Escrow Payment Gateway: ', options: { bold: true, color: C.blueDark } },
    { text: 'Razorpay / Stripe webhook escrow holding funds until digital delivery receipt.\n', options: { color: C.slateMuted } },
    { text: '➤ Multilingual Progressive Web App (PWA): ', options: { bold: true, color: C.blueDark } },
    { text: 'Offline-first PWA with regional Indian language voice navigation for farmers.', options: { color: C.slateMuted } }
  ], {
    x: 5.25, y: 1.88, w: 4.00, h: 1.95,
    fontSize: 7, lineSpacingMultiple: 1.15
  });

  // Bottom Conclusion Banner
  s.addShape('roundRect', {
    x: 0.6, y: 4.05, w: 8.8, h: 1.05,
    fill: { color: C.sageBg },
    line: { color: C.emerald, width: 1.5 },
    rectRadius: 0.08
  });
  s.addText('FINAL PROJECT CONCLUSION:', {
    x: 0.8, y: 4.15, w: 8.4, h: 0.20,
    fontSize: 8, bold: true, color: C.forestDark
  });
  s.addText('AgriFlow AI successfully proves an integrated, scalable engineering blueprint modernizing agricultural commerce. By combining direct multi-tenant market access, explainable deterministic matching, and synchronized first-mile logistics, the platform offers a practical, high-impact paradigm to minimize food spoilage and maximize producer profitability.', {
    x: 0.8, y: 4.38, w: 8.4, h: 0.60,
    fontSize: 7.5, color: C.slateDark, lineSpacingMultiple: 1.2
  });

  s.addNotes('To conclude, AgriFlow AI provides a viable, production-oriented engineering blueprint for modernizing agricultural logistics. We have implemented the complete full-stack foundation, from JWT authentication and role-based portals to order state machines, explainable decision stubs, and traceability logging. In our future scope, we plan to incorporate LSTM-based neural forecasting, live IoT GPS telematics, and public blockchain anchoring. Thank you, and we now welcome questions from the evaluation committee.');
}

// ── Output Generation ────────────────────────────────────────────────────────
const outputPath = path.resolve(__dirname, '../../AgriFlow_AI_Smart_Agricultural_Supply_Chain_Platform.pptx');

pres.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`SUCCESS: PowerPoint presentation created successfully at: ${outputPath}`);
  })
  .catch(err => {
    console.error('ERROR generating PowerPoint:', err);
    process.exit(1);
  });
