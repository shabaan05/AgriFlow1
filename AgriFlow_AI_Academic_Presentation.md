# AgriFlow AI – Smart Agricultural Supply Chain SaaS Platform
## 15-Slide Professional Academic Project Presentation (B.Tech Final Year)

---

### PRESENTATION METADATA
- **Project Title:** AgriFlow AI – Smart Agricultural Supply Chain SaaS Platform
- **Project Candidates:**
  1. Shabaan Ramjan Satarkar
  2. Aryan Sunil Mhetre
  3. Om Rajeshwar Khade
  4. Prathmesh Devappa Sargar
- **Degree / Branch:** B.Tech in Computer Science & Engineering
- **Project Supervisor:** Prof. G.V. Patil
- **Institution:** D.Y Patil College Of Engineering And Technology
- **Academic Session:** 2026 – 2027
- **Target Audience:** Project Guide, Head of Department, External Examiners
- **Recommended Presentation Duration:** 10 – 15 Minutes
- **File Deliverable:** Microsoft PowerPoint (`.pptx`)

---

## Slide 01: Title Slide (Executive Academic Cover)
- **Title:** AgriFlow AI
- **Subtitle:** Smart Agricultural Supply Chain SaaS Platform
- **Tagline:** An Integrated Multi-Stakeholder B2B Logistics & Decision-Support System
- **Stakeholder Badges:** Farmer Portal | Buyer Marketplace | Transporter Logistics | System Admin
- **Project Candidates:**
  1. Shabaan Ramjan Satarkar
  2. Aryan Sunil Mhetre
  3. Om Rajeshwar Khade
  4. Prathmesh Devappa Sargar
  *Degree: B.Tech in Computer Science & Engineering*
- **Supervision & Institution:**
  - Project Guide: Prof. G.V. Patil
  - Department: Computer Science & Engineering
  - College: D.Y Patil College Of Engineering And Technology
  - Academic Session: 2026 – 2027

> **Speaker Note (30s):**  
> *"Respected project guide Prof. G.V. Patil and external examiners, good morning. We are final-year B.Tech students from D.Y Patil College Of Engineering And Technology. Today we present our major project: AgriFlow AI, a smart agricultural supply chain platform connecting farmers, buyers, and transporters with explainable decision-support algorithms."*

---

## Slide 02: Problem Statement
- **Demand Uncertainty:** Farmers cultivate crops based on intuition without commercial demand signals, leading to gluts and price crashes.
- **Buyer Discovery:** Producers struggle to access bulk buyers directly; 4–6 tiers of middlemen capture 35%–50% profit margins.
- **High Food Wastage:** Perishable commodities spoil rapidly without freshness monitoring or synchronized dispatch.
- **Transport Inefficiency:** Rural logistics is unorganized, lacks route coordination, and suffers from empty return legs.
- **Traceability Deficit:** No tamper-evident provenance or milestone records from farm gate to buyer warehouse.
- **Current Failure Cycle:** `Speculative Sowing ➔ Opaque Middlemen ➔ Post-Harvest Spoilage ➔ Unplanned Transport ➔ Zero Traceability`

> **Speaker Note (45s):**  
> *"Agricultural supply chains face five core issues: farmers cultivate crops without forward demand signals, middlemen capture 35-50% margins, perishable crops suffer heavy post-harvest wastage, transport is fragmented, and there is no verified traceability."*

---

## Slide 03: Proposed Solution
- **Core Architecture Diagram:**
  $$\text{Farmer} \longleftrightarrow \text{AgriFlow AI Platform Hub} \longleftrightarrow \text{Buyer}$$
  $$\updownarrow \quad \updownarrow$$
  $$\text{Transporter} \quad \text{Administrator}$$
- **Direct Market Access:** Disintermediates trade; enables wholesale buyers and farmers to contract directly.
- **Explainable AI Core:** Transparent mathematical ranking with explicit rationale for matching and urgency.
- **Synchronized Logistics:** Event-driven pickup dispatch and tamper-evident milestone traceability.

> **Speaker Note (45s):**  
> *"Our solution integrates all four stakeholders. Farmers list produce and see demand; buyers broadcast needs and book crops; transporters claim pickups; and admins oversee the system. Everything is connected through an explainable decision engine."*

---

## Slide 04: Project Objectives
1. **Multi-Tenant Architecture:** Build a secure, role-based platform for Farmers, Buyers, Transporters, and Admins under a unified JWT auth umbrella.
2. **Explainable Matching Algorithm:** Develop a 0–100 multi-criteria weighted scoring model evaluating price, quality, volume, proximity, and timeline compatibility.
3. **Predictive Demand Signaling:** Provide forward demand volume and price band visibility utilizing historical mandi spot prices and trend slopes.
4. **Shelf-Life Decay Monitoring:** Construct a freshness decay index categorizing crops into Fresh, Attention, and Critical tiers with actionable triggers.
5. **Automated Logistics Dispatch:** Engineer an event-driven logistics pipeline automatically spawning atomic pickup requests when orders are marked Ready.
6. **Audit-Grade Traceability:** Establish an immutable milestone event ledger tracking physical crop states from harvesting to delivery and settlement.

> **Speaker Note (45s):**  
> *"We defined six clear objectives: connecting all four stakeholders, implementing explainable matching, forecasting demand, monitoring shelf-life to prevent waste, optimizing transport, and recording complete milestone traceability."*

---

## Slide 05: System Architecture
- **3-Tier Full-Stack Decoupled Design:**
  - **Presentation Tier (Client SPA):** React 18, Vite bundler, Tailwind CSS, React Router v6, Role-Protected Routes, Auth & Orders Context APIs.
  - **Protocol:** RESTful API over HTTPS with stateless Bearer JWT Authorization.
  - **Application & API Tier:** Node.js & Express.js API server (@ Port 5000), stateless JWT auth, RBAC middleware, Order state machine, Decision engines.
  - **Data Persistence Tier:** MongoDB Atlas cloud document store accessed via Mongoose ODM (`User`, `Crop`, `Demand`, `Booking`, `Order`, `PickupRequest`, `TraceabilityEvent`).
- **Cloud Hosting:** Frontend on Vercel SPA, Backend on Render, Database on MongoDB Atlas.

> **Speaker Note (45s):**  
> *"The system follows a clean 3-tier architecture. React 18 on the frontend communicates with Node.js and Express over REST APIs using JWT authentication. MongoDB Atlas stores structured documents, and our decision engines run directly inside the backend."*

---

## Slide 06: User Roles & Modules
- **Farmer Module:** Crop inventory CRUD & batches, Market demand board & prices, AI Centre (Buyer match, plan), Shelf-life spoilage monitoring, Order fulfillment.
- **Buyer Module:** Marketplace produce discovery, Broadcast procurement needs, Algorithmic match recommendations, Direct farm booking modal, Delivery tracking.
- **Transporter Module:** Open pickup request job board, Atomic single-driver job lock, Active Trips delivery pipeline, Route heuristics & capacity, Freight earnings.
- **Admin Module:** User KYC & farm verification, System analytics & KPI metrics, Order & payment audit trail, Traceability ledger explorer, Dispute review.

> **Speaker Note (30s):**  
> *"AgriFlow AI partitions features into four clear modules. Farmers manage inventory and fulfill orders; buyers discover crops and track deliveries; transporters claim pickups and manage trips; and admins monitor platform health."*

---

## Slide 07: Farmer Module (Deep Dive)
- **Crop Management:** Add, edit, and catalog crop listings with harvest dates, expected quantities, quality grades, and target prices.
- **Market Demand Explorer:** Inspect forward buyer requirements and current mandi price bands before harvesting.
- **AI Decision Centre:** Access explainable recommendations for matched buyers, harvest planning, and shelf-life alerts.
- **Order Fulfillment Pipeline:** Review and accept buyer bookings; advance accepted orders from `Confirmed` $\rightarrow$ `Preparing` $\rightarrow$ `Ready for Pickup`.
- **Farm Profile & Settlement Info:** Maintain verified farm coordinates, bank accounts, and payout notification settings.
- **Farmer Staging Lifecycle:** `1. Booking Placed ➔ 2. Farmer Accepts ➔ 3. Preparing Crop ➔ 4. Ready for Pickup (Auto-triggers transporter job)`.

> **Speaker Note (45s):**  
> *"In the Farmer Module, producers manage crops, inspect buyer demand, review AI recommendations, and progress orders from booking acceptance to Ready for Pickup."*

---

## Slide 08: Buyer Module (Deep Dive)
- **Marketplace Discovery:** Browse active crop batches with multi-parameter filters for category, grade, location radius, and target price.
- **Requirements Broadcasting:** Broadcast procurement needs (crop type, volume, target price, required deadline) to verified farmers.
- **Direct Crop Booking:** Reserve crops directly with instant quantity validation to prevent overselling.
- **Order & Delivery Tracking:** Monitor real-time transit status milestones from farm pickup to warehouse dock arrival.
- **Payments & Traceability:** Track invoice settlements and verify complete farm-to-fork batch traceability.
- **Buyer Procurement Stages:** `1. Discover / Post ➔ 2. Reserve Quantity ➔ 3. Track Dispatch ➔ 4. Receive & Settle`.

> **Speaker Note (45s):**  
> *"The Buyer Module allows wholesale buyers to search verified produce, broadcast procurement requirements, place immediate bookings, track delivery milestones, and inspect batch traceability."*

---

## Slide 09: Transporter Module (Deep Dive)
- **Automated Pickup Requests:** Orders reaching "Ready for Pickup" automatically appear on the transporter job board.
- **Atomic Job Acceptance:** Transporters accept jobs with atomic database locking, preventing multiple drivers from claiming the same pickup.
- **Delivery Lifecycle Management:** Drivers update trip milestones: `Picked Up` $\rightarrow$ `In Transit` $\rightarrow$ `Delivered`.
- **Freight Earnings Ledger:** Automatically generates earnings records based on consignment weight and transit distance.
- **Fleet & Vehicle Profile:** Maintains vehicle payload capacity and driver verification details.
- **Transporter Workflow:** `1. Pickup Request ➔ 2. Accept Job (Atomic Lock) ➔ 3. Picked Up ➔ 4. Delivered (Fee Credited)`.

> **Speaker Note (45s):**  
> *"The Transporter Module bridges the first-mile gap. When an order is ready, a pickup request is automatically created. Drivers accept jobs atomically, update trip milestones, and track freight earnings."*

---

## Slide 10: AI Decision-Support Features
1. **Buyer–Farmer Matching:** Ranks buyer requirements against farmer crops using an explainable multi-factor scoring model (0–100) with explicit reasoning vectors.
2. **Demand Forecasting:** Analyzes historical mandi arrival data and price trends using weighted moving averages to project future volume and price bands.
3. **Shelf-Life & Wastage Prevention:** Calculates remaining freshness based on crop perishability, classifying risk into Fresh, Attention, and Critical with action triggers.
4. **Route & Pickup Optimization:** Clusters farm pickup requests to maximize truck capacity while prioritizing urgent perishable batches for earliest collection.
- **Core Engineering Principle:** We deliberately employ explainable mathematical scoring rather than generative chatbots, ensuring deterministic, auditable decisions for agricultural commerce.

> **Speaker Note (45s):**  
> *"We designed four specialized decision engines for matching, demand forecasting, shelf-life monitoring, and route optimization. We deliberately avoid black-box chatbots so that every recommendation has clear, auditable reasoning."*

---

## Slide 11: Buyer–Farmer Matching Engine
- **Composite Match Formulation:** $S = \sum (w_i \cdot s_i) \quad [0 \le S \le 100]$
- **Weighted Factors (Sum = 100%):**
  - **Price Compatibility (25%):** Buyer offer vs farmer minimum acceptable price
  - **Quality Grade Match (20%):** Exact or compatible quality grade alignment
  - **Quantity Fulfillment (20%):** Proportion of buyer order volume satisfied
  - **Location Proximity (15%):** Haversine distance between farm and buyer hub
  - **Date Suitability (10%):** Harvest readiness date vs delivery deadline
  - **Farmer Reliability (10%):** Historical fulfillment track record & verification
- **Explainable Recommendation Output:**
  - `Match Score: 92 / 100 (Crop: Tomato, Buyer: FreshMart Pvt Ltd)`
  - *Explicit Rationale:* Grade matches Grade A; Within 50 km (Nashik ➔ Pune); Satisfies 100% consignment; Offer price exceeds minimum price.

> **Speaker Note (45s):**  
> *"Our matching algorithm combines six weighted factors totaling 100%. The system outputs both a match score and clear, understandable explanations so farmers know why a buyer was recommended."*

---

## Slide 12: Demand Forecasting & Shelf-Life Decay Engines
- **A. Demand Forecasting Flow:**
  - `1. Historical Mandi Arrivals ➔ 2. Weighted Moving Average (WMA) ➔ 3. Trend Slope Classification (Rising/Stable/Falling) ➔ 4. Projected Demand Volume & Price Bands`
- **B. Shelf-Life Spoilage Prevention:**
  - `1. Commodity Shelf-Life Rules ➔ 2. Remaining Shelf Life (RSL %) ➔ 3. Risk Tiers (Fresh / Attention / Critical) ➔ 4. Prescriptive Action (Dynamic Markdown & Expedited Dispatch)`

> **Speaker Note (45s):**  
> *"This slide shows our dual analytics: the Demand Forecasting flow projects future volume and price bands from historical data, while the Shelf-Life flow calculates freshness decay to trigger discounts and urgent pickups before crops spoil."*

---

## Slide 13: Farm-Gate Route & Pickup Optimization
- **5-Stage Pipeline:**
  - `1. Open Pickups ➔ 2. Capacity Check (∑ Q_i ≤ C_truck) ➔ 3. Urgency Weighting (Critical RSL first) ➔ 4. Optimized Stops ➔ 5. Hub Delivery`
- **Multi-Stop Trip Example:**
  - `Transporter Depot ➔ Farm Stop A (800 kg Tomatoes, Critical Urgency) ➔ Farm Stop B (1,200 kg Onions) ➔ Central Buyer Terminal (2,000 kg Consignment, 84 km)`

> **Speaker Note (45s):**  
> *"Our route optimization groups farm orders into multi-stop trips while checking truck weight limits. Crucially, orders marked as perishable or critical are given pickup priority to reduce post-harvest losses."*

---

## Slide 14: End-to-End Workflow & Traceability Lifecycle
- **8-Stage Transaction State Machine:**
  1. Crop Listed $\rightarrow$ 2. Booking Placed $\rightarrow$ 3. Farmer Accepts $\rightarrow$ 4. Ready for Pickup $\rightarrow$ 5. Transporter Accepts $\rightarrow$ 6. In Transit $\rightarrow$ 7. Delivered Confirmed $\rightarrow$ 8. Payment & Trace Log.
- **Relational Entity Linkage:**
  - `Crop ➔ Booking ➔ Order ➔ PickupRequest ➔ Payment` (All documents remain linked across the lifecycle).
- **Audit Traceability Log Console:**
  - Monospace event ledger (`HARVESTED`, `QUALITY_CHECKED`, `BOOKED`, `PICKUP_SCHEDULED`, `IN_TRANSIT`, `DELIVERED`, `PAYMENT_RECEIVED`).

> **Speaker Note (45s):**  
> *"This slide illustrates the full transaction lifecycle. From crop listing to payment, every stage updates connected database models and commits milestone events to our traceability log."*

---

## Slide 15: Project Results, Future Scope & Academic Conclusion
- **Implemented & Verified Achievements:**
  - Full-Stack MERN Platform (React 18 SPA, Node/Express REST API).
  - Role-Based Access Control (JWT middleware for Farmer, Buyer, Transporter).
  - Transactional State Machine (Booking ➔ Order ➔ PickupRequest with atomic locks).
  - Explainable Decision Engines (Multi-criteria matching and shelf-life decay monitoring).
  - Milestone Audit Logging (Idempotent traceability event logger in MongoDB).
  - Cloud Deployment on Vercel, Render, and MongoDB Atlas.
- **Planned Future Enhancements:**
  - *Production Machine Learning:* Train LSTM / ARIMA models on national mandi price datasets.
  - *Real-Time IoT Telematics:* Hardware GPS trackers and live Google Maps/Mapbox routing.
  - *Enterprise Blockchain:* Anchor traceability event hashes on Polygon/Ethereum.
  - *Automated Payment Escrow:* Razorpay / Stripe webhooks releasing funds on delivery.
  - *Multilingual PWA:* Offline-first mobile PWA with Indian regional languages.
- **Final Academic Conclusion:**
  - AgriFlow AI successfully establishes a functional, scalable engineering blueprint modernizing agricultural commerce, minimizing food spoilage, and empowering rural producers.

> **Speaker Note (45s):**  
> *"Respected project guide Prof. G.V. Patil and examiners, to conclude, AgriFlow AI provides a viable engineering blueprint for agricultural logistics. We have built the complete full-stack foundation, state machine, and explainable decision stubs. In our future scope, we plan to incorporate ML models, live GPS, and blockchain anchoring. Thank you, and we welcome your questions."*

---
