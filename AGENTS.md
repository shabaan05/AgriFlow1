# AgriFlow AI — Project Context for AI Coding Agents

> Read this file before making any changes. Do NOT repeatedly scan the entire
> codebase if the required information is already documented here.

---

## Project

**AgriFlow AI** — Smart Agricultural Supply Chain SaaS Platform.

**Purpose:** Connect farmers, buyers, and transporters. Use AI for demand-linked
farming, buyer matching, harvest planning, shelf-life monitoring, wastage
prevention, demand forecasting, and transport optimisation.

---

## Development Approach

- Build **module-by-module**. Do not implement future modules until the current
  one is stable.
- Work on **one feature at a time**. Keep file scope narrow.
- Reuse existing components. Do not rewrite working code.
- Do not modify unrelated modules.
- Do not change the existing navbar unless explicitly requested.
- Use **JavaScript** (not TypeScript).
- Use **Tailwind CSS** for all styling.
- After every feature implementation, update `AGENTS.md` with relevant
  architectural, route, API, model, workflow, and feature changes. Do not
  overwrite unrelated existing documentation.

---

## Tech Stack

### Frontend (active)
| Tool | Version |
|------|---------|
| React | 18 |
| Vite | 5 |
| Tailwind CSS | 3 |
| React Router | 6 |

**Vercel SPA deployment:** `frontend/vercel.json` contains a catch-all rewrite
(`/(.*) → /index.html`) so direct URL access (e.g. `/farmer/login`) is handled
by React Router instead of returning a 404. Do not remove this file.

### Backend (active)
- Node.js + Express.js (`backend/server.js`, port `5000`)
- MongoDB + Mongoose
- JWT authentication (`jsonwebtoken`) + bcrypt password hashing (`bcryptjs`)
- CORS allowed origins:
  - `http://localhost:5173` (local dev)
  - `https://agri-flow1.vercel.app` (production)
  - `https://agri-flow1-bi60ktc2i-shabaansatarkar05-8846s-projects.vercel.app` (Vercel preview)
  - `credentials: true`

### AI (current vs planned)
- **Current:** Four farmer-facing agents as Node.js modules under
  `backend/agents/`. Each `run()` returns **hard-coded demo JSON** with
  `isDemo: true`. Farmer AI Centre UI consumes `/api/ai/*`.
- **Planned (not implemented):** Python, trained ML models, live scoring
  against Crop / Demand / Order data.
- Demand Forecast Agent and Transport Agent have **no backend agent
  modules**. Buyer AI Centre pages are placeholders.

### Other planned
- Blockchain / smart contracts (traceability has `txHash` / `onChain` fields,
  unused)
- Payment gateway / online processing
- Real-time GPS / routing / transport optimisation
- Docker
- Refresh tokens

---

## Frontend Project Structure

```
frontend/
├── public/
├── src/
│   ├── App.jsx                  ← routing root
│   ├── main.jsx
│   ├── index.css                ← Tailwind directives + utility classes
│   ├── data/
│   │   ├── mockData.js          ← Farmer dashboard KPIs/crops/orders (still mock)
│   │   └── cropData.js          ← Legacy crop mock data
│   ├── context/
│   │   ├── AuthContext.jsx      ← JWT session (localStorage + GET /api/auth/me)
│   │   ├── CropsContext.jsx     ← Crop store via cropApi
│   │   ├── DemandContext.jsx
│   │   ├── AIContext.jsx
│   │   ├── OrdersContext.jsx
│   │   ├── ProfileContext.jsx
│   │   └── ShortlistContext.jsx
│   ├── hooks/
│   │   └── useAuth.jsx          ← Re-export of AuthContext.useAuth
│   ├── utils/
│   │   └── roleRedirect.js      ← Role → dashboard path map
│   ├── routes/
│   │   ├── ProtectedRoute.jsx         ← Farmer area: auth required (no role check)
│   │   └── BuyerProtectedRoute.jsx    ← Buyer area: auth + role === 'buyer'
│   ├── layouts/
│   │   ├── FarmerLayout.jsx     ← Persistent farmer sidebar + header
│   │   └── BuyerLayout.jsx      ← Persistent buyer sidebar + header
│   ├── services/
│   │   ├── authApi.js
│   │   ├── cropApi.js
│   │   ├── demandApi.js
│   │   ├── aiApi.js
│   │   ├── ordersApi.js         ← Bookings, orders, payments
│   │   ├── marketplaceApi.js
│   │   ├── requirementsApi.js
│   │   ├── profileApi.js
│   │   └── traceabilityApi.js
│   ├── components/
│   │   ├── common/PlaceholderPage.jsx
│   │   ├── ui/StatusBadge.jsx, PageHeader.jsx
│   │   ├── farmer/              ← Dashboard cards, FarmerSidebar, FarmerHeader
│   │   ├── crops/               ← CropListCard, CropForm
│   │   ├── demand/
│   │   ├── ai/                  ← DemoBanner, AgentPageHeader, UrgencyBadge
│   │   ├── orders/
│   │   └── buyer/               ← BuyerSidebar, BuyerHeader, CropMarketCard,
│   │                              RequirementForm, BookingModal
│   └── pages/
│       ├── Home.jsx
│       ├── farmer/              ← Dashboard, auth, demand, AI, orders, profile, crops
│       └── buyer/               ← Dashboard, auth, marketplace, requirements,
│                                  bookings, orders, payments + placeholders.jsx
└── .env                         ← VITE_API_URL=http://localhost:5000
```

---

## Custom Tailwind Classes (defined in index.css)

| Class | Purpose |
|-------|---------|
| `.btn-primary` | Filled green button |
| `.btn-outline` | Outlined green button |
| `.card` | White rounded card with shadow |
| `.input-field` | Form input with focus ring |
| `.sidebar-link` | Inactive nav link |
| `.sidebar-link-active` | Active nav link |
| `.status-badge` | Base badge (pair with colour classes) |

---

## Custom Tailwind Colors (defined in tailwind.config.js)

```js
agri: {
  green:  '#1a6b3c',   // primary accent
  light:  '#e8f5e9',   // light green background
  dark:   '#0d3d22',   // dark green hover
  accent: '#2d9e5f',
  muted:  '#6b9080',
}
```

---

## Authentication

One **User** model and one auth API for all roles.

| Item | Implementation |
|------|----------------|
| Roles (schema) | `farmer`, `buyer`, `transporter`, `admin` (`backend/models/User.js`) |
| Register | `POST /api/auth/register` — body `role` accepted only if `farmer` or `buyer`; otherwise stored as `farmer`. Transporter/admin cannot self-register. |
| Login | `POST /api/auth/login` — email + password |
| Session | JWT in `Authorization: Bearer <token>`. Payload `{ id, role }`. Expiry `JWT_EXPIRES_IN` or `7d`. |
| Password | bcrypt hash on save; `matchPassword()` |
| Current user | `GET /api/auth/me` (`protect`) |
| Change password | `PUT /api/auth/change-password` (`protect`) |
| Frontend | `AuthContext` stores token (`agriflow_token`) and user (`agriflow_user`). On mount, re-validates via `/api/auth/me`. `hooks/useAuth.jsx` re-exports `useAuth`. |
| Middleware | `protect` (JWT) is used on almost all APIs. `requireRole(...roles)` is **exported but not attached to any route**. Some controllers branch on `req.user.role` (e.g. bookings). |
| Refresh tokens | **Not implemented** |

### Role-based redirects

`frontend/src/utils/roleRedirect.js` maps:

| Role | Dashboard path |
|------|----------------|
| farmer | `/farmer/dashboard` |
| buyer | `/buyer/dashboard` |
| transporter | `/transporter/dashboard` (**route does not exist**) |
| admin | `/admin/dashboard` (**route does not exist**) |

Login/register pages call `getDashboardForRole(stored.role)` after success.

- `ProtectedRoute` (farmer layout): requires authentication; **does not** require `role === 'farmer'`; unauthenticated users go to `/farmer/login`.
- `BuyerProtectedRoute`: unauthenticated → `/buyer/login`; authenticated non-buyer → `/farmer/dashboard`.

---

## Routing (React Router 6)

### Farmer

Farmer app routes are **nested under `/farmer`** inside `<FarmerLayout>`,
guarded by `ProtectedRoute`.

| Path | Component | Notes |
|------|-----------|--------|
| `/` | `Home` | Public |
| `/farmer/login` | `FarmerLogin` | JWT login + role redirect |
| `/farmer/register` | `FarmerRegister` | Registers as farmer |
| `/farmer/dashboard` | `FarmerDashboard` | **Still uses `mockData.js`**, not live APIs |
| `/farmer/crops` | `MyCrops` | API-backed CRUD list |
| `/farmer/crops/add` | `AddCrop` | |
| `/farmer/crops/:id` | `CropDetail` | |
| `/farmer/crops/:id/edit` | `EditCrop` | |
| `/farmer/demand` | `MarketDemand` | Nested under `FarmerDemand` tabs |
| `/farmer/demand/buyers` | `BuyerRequirements` | Farmer view of demand-board requirements |
| `/farmer/demand/opportunities` | `DemandOpportunities` | Pre-book action is still a toast placeholder |
| `/farmer/ai` | `AICentreDashboard` | Demo agents |
| `/farmer/ai/buyer-matches` | `BuyerMatchAgent` | |
| `/farmer/ai/harvest-planner` | `HarvestPlanner` | |
| `/farmer/ai/shelf-life` | `ShelfLifeMonitor` | |
| `/farmer/ai/wastage-prevention` | `WastagePrevention` | |
| `/farmer/orders` | `Bookings` | Tab shell: `FarmerOrders` |
| `/farmer/orders/active` | `Orders` | |
| `/farmer/bookings/:id` | `BookingDetail` | |
| `/farmer/orders/:id` | `OrderDetail` | |
| `/farmer/pickup-delivery` | `PickupDelivery` | |
| `/farmer/earnings` | `Earnings` | |
| `/farmer/traceability` | `Traceability` | Farmer event timeline |
| `/farmer/profile` | `FarmerProfile` | Personal, farm, verification, payment, notifications, settings |

### Buyer

Buyer app routes are **nested under `/buyer`** inside `<BuyerLayout>`,
guarded by `BuyerProtectedRoute`.

| Path | Component | Status |
|------|-----------|--------|
| `/buyer/login` | `BuyerLogin` | Implemented |
| `/buyer/register` | `BuyerRegister` | Implemented (role `buyer`) |
| `/buyer/dashboard` | `BuyerDashboard` | Shell with **hard-coded mock KPIs** (not API) |
| `/buyer/marketplace` | `MarketplaceBrowse` | Implemented (API). Card **Book** opens existing `BookingModal`. |
| `/buyer/marketplace/crop/:id` | `CropDetail` | Implemented; **Book** via `BookingModal` |
| `/buyer/marketplace/farmer/:id` | `FarmerDetail` | Implemented |
| `/buyer/marketplace/shortlisted` | `Shortlisted` | Implemented (API + ShortlistContext) |
| `/buyer/requirements` | `MyRequirements` | Implemented CRUD |
| `/buyer/requirements/create` | `CreateRequirement` | Implemented |
| `/buyer/requirements/:id` | `RequirementDetail` | Implemented; AI match section is **Coming Soon** |
| `/buyer/requirements/:id/edit` | `EditRequirement` | Implemented |
| `/buyer/bookings` | `BuyerBookings` | Implemented (list, cancel pending) |
| `/buyer/bookings/:id` | `BuyerBookingDetail` | Implemented |
| `/buyer/orders` | `BuyerOrders` | Implemented |
| `/buyer/orders/:id` | `BuyerOrderDetail` | Implemented |
| `/buyer/delivery` | `BuyerDeliveryList` | Implemented — buyer’s orders via `GET /api/orders/buyer`; Track → `/:id` |
| `/buyer/delivery/:id` | `BuyerDeliveryTracking` | Status timeline from order API; **GPS is a UI placeholder** |
| `/buyer/payments` | `BuyerPayments` | Implemented (manual tracking; gateway “coming soon”) |
| `/buyer/traceability` | `BuyerTraceability` | **Placeholder** |
| `/buyer/ai` | `BuyerAICentre` | **Placeholder** |
| `/buyer/ai/demand-forecast` | `DemandForecast` | **Placeholder** |
| `/buyer/profile` | `BuyerProfile` | **Placeholder** |
| `/buyer/profile/verification` | `BuyerVerification` | **Placeholder** |
| `/buyer/profile/payment-details` | `BuyerPaymentDetails` | **Placeholder** |
| `/buyer/profile/notifications` | `BuyerNotifications` | **Placeholder** |
| `/buyer/profile/settings` | `BuyerSettings` | **Placeholder** |

`frontend/src/pages/buyer/placeholders.jsx` still exports unused marketplace /
bookings / orders / payments stubs. Wired routes use the real page files except
where noted above.

Marketplace **Book** on `CropMarketCard` opens the existing `BookingModal` (same
flow as Crop Details, `POST /api/bookings`). No extra booking form or API.

---

## Farmer Sidebar Navigation (DO NOT change without explicit request)

1. Dashboard → `/farmer/dashboard`
2. Crops → `/farmer/crops`
3. Demand → `/farmer/demand`
4. AI Centre → `/farmer/ai`
5. Bookings & Orders → `/farmer/orders`
6. Profile → `/farmer/profile`

Pickup & Delivery, Earnings, and Traceability are extra tabs inside the
Bookings & Orders shell (`FarmerOrders`), not extra sidebar items.

---

## Buyer Sidebar Navigation

Do not change without explicit request.

1. Dashboard → `/buyer/dashboard`
2. Marketplace → Browse `/buyer/marketplace`, Shortlisted `/buyer/marketplace/shortlisted`
3. Requirements → My Requirements `/buyer/requirements`, Create `/buyer/requirements/create`
4. AI Centre → Buyer Match `/buyer/ai`, Demand Forecast `/buyer/ai/demand-forecast` (placeholders)
5. Bookings & Orders → Bookings, Orders, Delivery Tracking (`/buyer/delivery` list → `/buyer/delivery/:id`), Payments, Traceability (placeholder)
6. Profile → Personal / Business, Verification, Payment Details, Notifications, Settings (all placeholders)

---

## Crop Data Schema

Frontend UI shape (do not rename in components):

```js
{
  id:                  string,       // 'crop-001'
  name:                string,       // 'Tomato'
  variety:             string,       // 'Cherry Tomato'
  category:            string,       // 'Vegetables'
  totalQty:            number,       // 800
  availableQty:        number,       // 650
  unit:                string,       // 'kg'
  expectedHarvestDate: string,       // '2026-10-25'
  shelfLifeDays:       number,       // 7
  expectedPrice:       number,       // 25
  minPrice:            number,       // 20
  farmLocation:        string,       // 'Nashik, Maharashtra'
  grade:               string,       // 'Grade A'
  images:              string[],     // [] (UI placeholder only)
  notes:               string,
  status:              CropStatus,
  createdAt:           string,       // ISO date string
}
```

## Crop Statuses

`Pre-Harvest` | `Booked` | `Harvest Ready` | `Harvested` | `Pickup Scheduled` | `Delivered`

Crop categories (Mongoose): `Vegetables`, `Fruits`, `Grains & Cereals`,
`Pulses & Legumes`, `Spices & Herbs`, `Oilseeds`, `Other`.

**Ownership gap:** `Crop` schema does **not** currently store a `farmer` /
`farmerId` ref (commented as a future slot). Crop APIs are JWT-protected but
not farmer-scoped by ownership.

---

## Farmer Module — AI Agents

Six-agent architecture (preserve this design):

| # | Agent | Purpose | Status |
|---|--------|---------|--------|
| 1 | Buyer Match Agent | Find and rank suitable buyers | **UI + demo API** (`backend/agents/buyerMatchAgent.js`, `GET /api/ai/buyer-matches`) |
| 2 | Harvest & Booking Agent | Demand-linked harvest + booking | **UI + demo API** (`harvestPlannerAgent.js`, `GET /api/ai/harvest-planner`) |
| 3 | Shelf-Life Agent | Freshness and spoilage monitoring | **UI + demo API** (`shelfLifeAgent.js`, `GET /api/ai/shelf-life`). Threshold constants exist but `run()` still returns static demo data. |
| 4 | Wastage Prevention Agent | Reduce crop wastage | **UI + demo API** (`wastagePreventionAgent.js`, `GET /api/ai/wastage-prevention`) |
| 5 | Demand Forecast Agent | Market demand signals | **Planned.** Buyer page is a Coming Soon placeholder. No agent module. |
| 6 | Transport Agent | Route and pickup optimisation | **Planned.** No UI agent page, no backend module. |

Farmer AI Centre also exposes `GET /api/ai/summary`. All AI routes use
`protect`. Responses include `isDemo: true`. UI uses `DemoBanner`.

**Not implemented:** Python, ML training, live matching against MongoDB,
transporter routing.

Dashboard `AIAgentCard` still shows a generic “Coming Soon” badge; the AI
Centre pages themselves are the implemented demo surfaces.

---

## Farmer Workflow

```
Buyer Demand → AI Matching → Pre-booking → Harvest
→ Shelf-Life Monitoring → Wastage Prevention → Pickup → Payment
```

Implemented operational path today (non-AI):

```
Buyer posts requirement / browses marketplace
→ Buyer books crop (BookingModal → POST /api/bookings)
→ Farmer accepts/rejects
→ Accepted booking creates Order
→ Farmer updates order status (Preparing → … → Delivered)
→ Delivered auto-creates Payment (Pending)
→ Payment marked Paid
→ Traceability events recorded along this path (farmer view)
```

---

## Backend Structure (Node/Express/MongoDB)

```
backend/
├── server.js
├── .env                       ← PORT, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN (not committed)
├── .env.example
├── middleware/
│   └── auth.js                ← protect, requireRole
├── models/
│   ├── User.js
│   ├── Crop.js
│   ├── Demand.js
│   ├── Booking.js
│   ├── Order.js
│   ├── Payment.js
│   ├── BuyerRequirement.js
│   ├── Shortlist.js
│   ├── TraceabilityEvent.js
│   └── Notification.js
├── controllers/               ← one controller per route file
├── routes/
│   ├── authRoutes.js
│   ├── cropRoutes.js
│   ├── demandRoutes.js
│   ├── aiRoutes.js
│   ├── bookingRoutes.js
│   ├── orderRoutes.js
│   ├── paymentRoutes.js
│   ├── farmerRoutes.js
│   ├── notificationRoutes.js
│   ├── traceabilityRoutes.js
│   ├── marketplaceRoutes.js
│   └── requirementRoutes.js
├── agents/                    ← demo/rule stubs, not ML
│   ├── buyerMatchAgent.js
│   ├── harvestPlannerAgent.js
│   ├── shelfLifeAgent.js
│   └── wastagePreventionAgent.js
└── services/
    └── traceabilityService.js ← idempotent createEvent + readers
```

Backend runs on `http://localhost:5000`. CORS is configured for `http://localhost:5173`, `https://agri-flow1.vercel.app`, and the Vercel preview URL, all with `credentials: true`.
Health: `GET /api/health`.

There is **no** dedicated Pickup/Delivery Mongoose model. Pickup/delivery is
derived from `Order` (`GET /api/orders/farmer/pickup-delivery`).

---

## Frontend API Layer

```
frontend/src/services/
├── authApi.js
├── cropApi.js           ← fetchCrops, fetchCropById, createCrop, updateCrop, deleteCropById
├── demandApi.js
├── aiApi.js
├── ordersApi.js         ← bookings, orders, farmer pickup-delivery, payments,
│                          fetchOrderPickupRequest (GET /api/orders/:id/pickup-request)
├── marketplaceApi.js    ← browse, crop, farmer profile, shortlist
├── requirementsApi.js
├── profileApi.js        ← farmer profile/farm/verification/payment/prefs
└── traceabilityApi.js
```

`VITE_API_URL` defaults to `http://localhost:5000`. JWT attached via
`getStoredToken()` from AuthContext.

---

## Field Name Mapping

The Mongoose Crop model uses canonical backend names. `cropController.js` maps
them to/from the short frontend names used everywhere in the UI. **Do not
change the frontend component field names** — the mapping lives only in the
controller.

| Frontend (UI) | Backend (MongoDB) |
|---------------|-------------------|
| `name` | `cropName` |
| `totalQty` | `totalQuantityKg` |
| `availableQty` | `availableQuantityKg` |
| `shelfLifeDays` | `expectedShelfLife` |
| `expectedPrice` | `expectedPricePerKg` |
| `minPrice` | `minimumAcceptablePrice` |
| `grade` | `qualityGrade` |

---

## Database Models (existing only)

| Model | Key fields / enums |
|-------|--------------------|
| **User** | name, email, password, phone, role, avatar; nested farmInfo, verification (`Not Verified` \| `Pending` \| `Verified`), paymentDetails, notificationPrefs |
| **Crop** | See schema above. No farmer ref yet. |
| **Demand** | Market demand board: cropName, quantities, price range, location, demandLevel (`High` \| `Medium` \| `Low`), demandTrend (`Rising` \| `Stable` \| `Falling`), source (`manual` \| `buyer` \| `market` \| `ai`), embedded `buyerRequirements[]` |
| **Booking** | farmer, optional buyerId, buyerName/company/contact, crop, qty, price, deliveryLocation, requestedDeliveryDate, status (`Pending` \| `Accepted` \| `Rejected` \| `Cancelled` \| `Completed`), orderId |
| **Order** | booking, farmer, denormalized buyer/crop, qty, locations, scheduledPickupDate, actualDeliveryDate, status (`Confirmed` \| `Preparing` \| `Ready for Pickup` \| `Picked Up` \| `In Transit` \| `Delivered` \| `Cancelled`), timeline[] |
| **Payment** | unique order, farmer, buyerName, cropName, amount, status (`Pending` \| `Paid` \| `Failed`), paidAt |
| **BuyerRequirement** | buyerId, crop fields, qty, prices, requiredByDate, deliveryLocation, status (`ACTIVE` \| `FULFILLED` \| `EXPIRED` \| `CANCELLED`) |
| **Shortlist** | buyerId + cropId unique pair |
| **TraceabilityEvent** | farmerId, cropId, orderId, bookingId, eventType, description, location, timestamp, metadata, txHash, blockNumber, onChain |
| **Notification** | user, type (`booking` \| `order` \| `payment` \| `pickup` \| `system`), title, message, isRead, link, meta |

Traceability `eventType` enum: `HARVESTED`, `QUALITY_CHECKED`, `BOOKED`,
`PICKUP_SCHEDULED`, `PICKED_UP`, `IN_TRANSIT`, `DELIVERED`, `PAYMENT_RECEIVED`.

Events are **written** from crop / booking / order / payment controllers via
`traceabilityService.createEvent` (idempotent). There is no public POST
traceability route. Farmer read APIs exist; **buyer traceability UI is not
wired**.

---

## API Endpoints (existing only)

Auth (`protect` where noted):

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | protect |
| PUT | `/api/auth/change-password` | protect |

Crops — `router.use(protect)`: `GET/POST /api/crops`, `GET/PUT/DELETE /api/crops/:id`

Demand — **public GETs**: `/api/demand`, `/api/demand/opportunities`,
`/api/demand/buyer-requirements`, `/api/demand/:id`

AI — `protect`: `/api/ai/summary`, `/buyer-matches`, `/harvest-planner`,
`/shelf-life`, `/wastage-prevention`

Bookings — `protect`: `POST /api/bookings`, `GET /api/bookings/farmer`,
`GET /api/bookings/buyer`, `GET /api/bookings/:id`,
`PUT /api/bookings/:id/status`, `PUT /api/bookings/:id/cancel`

Orders — `protect`: `GET /api/orders/farmer`,
`GET /api/orders/farmer/pickup-delivery`, `GET /api/orders/buyer`,
`GET /api/orders/buyer/:id`, `GET /api/orders/:id/pickup-request`,
`GET /api/orders/:id`,
`PUT /api/orders/:id/status`

Payments — `protect`: `GET /api/payments/farmer/earnings`,
`GET /api/payments/buyer`, `PUT /api/payments/:id/status`

Farmer profile — `protect` under `/api/farmers`: profile, farm,
verification (+ submit), payment-details, notification-prefs

Notifications — `protect`: `GET /api/notifications`,
`PUT /api/notifications/:id/read`, `PUT /api/notifications/read-all`

Traceability — `protect`: `GET /api/traceability`,
`GET /api/traceability/crop/:cropId`, `GET /api/traceability/order/:orderId`

Marketplace — `protect`: crops list/detail, farmer public profile, shortlist
CRUD (`POST/GET /api/marketplace/shortlist`, `GET .../shortlist/ids`,
`DELETE .../shortlist/:cropId`)

Requirements — `protect`: `POST/GET /api/requirements`,
`GET/PUT /api/requirements/:id`, `PUT /api/requirements/:id/cancel`

---

## Current Development Status

### Completed

| Module | Notes |
|--------|--------|
| Public Homepage | Complete (Transporter/Admin CTAs are Coming Soon) |
| JWT Authentication | One User system; farmer + buyer login/register; AuthContext |
| Farmer Layout / Sidebar / Header / Routes | Complete |
| Crops Module — Frontend + API | Complete (images still placeholders; crops not farmer-owned in schema) |
| Demand Module (farmer) | Market Demand, Buyer Requirements, Opportunities (pre-book toast still pending) |
| Farmer AI Centre | Dashboard + 4 agent pages, **demo data only** |
| Farmer Bookings | List, detail, accept/reject |
| Farmer Orders | List, detail, status updates |
| Farmer Pickup & Delivery | Order-derived list (not a separate model) |
| Farmer Earnings | Payment summary for farmer |
| Farmer Profile | Personal, farm, verification, payment details, notification prefs, settings |
| Farmer Notifications API | Backend + profile prefs; not a standalone farmer notifications page |
| Farmer Traceability | Event timeline auto-generated from workflow (off-chain) |
| Buyer Module Foundation | Layout, sidebar, routes, login/register, dashboard **shell (mock data)** |
| Buyer Marketplace | Browse, crop detail, farmer detail, shortlist |
| Buyer Requirements | CRUD, cancel, detail, edit (AI match Coming Soon) |
| Buyer Bookings | Create from crop detail **or marketplace Book**, list, detail, cancel pending |
| Buyer Orders | List + detail |
| Buyer Delivery Tracking | List at `/buyer/delivery` (existing `GET /api/orders/buyer`); per-order timeline at `/buyer/delivery/:id`. **No GPS.** |
| Buyer Payments | Summary KPIs, table, detail modal; **no payment gateway** |
| Buyer Traceability | Order list with progress bars + full journey timeline; blockchain placeholder |
| Buyer Profile | Personal/business, business details, verification, payment, notifications, settings; `/api/buyers/*` |

### In Progress / Partial

| Item | Reality in code |
|------|-----------------|
| Farmer / Buyer / Transporter dashboards | ✅ Now API-backed — all KPIs, tables, and cards use real data from existing APIs (see Dashboard Backend Integration above) |
| Role middleware | `requireRole` unused; farmer `ProtectedRoute` does not enforce farmer role |
| Crop ↔ farmer ownership | ✅ Fixed — `farmerId` added to Crop model, set on creation, used in marketplace + booking |
| Farmer Order Detail | ✅ Fixed — shows real data; NEXT_ACTION restricted to Confirmed/Preparing only (transporter owns Picked Up onward); PickupRequestPanel shows transporter assignment status after Ready for Pickup |
| Farmer Pickup & Delivery Manage | ✅ Fixed — Manage button opens inline panel showing pickup request status, transporter info when assigned, logistics, and order timeline; "Awaiting transporter" message shown when PENDING |

### Planned / Not Yet Implemented

| Item | Status |
|------|--------|
| Buyer AI Centre / Demand Forecast | Placeholder pages only |
| Buyer Traceability | Placeholder page only |
| Buyer Profile (all sub-pages) | ✅ Complete — see Buyer Profile above |
| Transport Agent + Transporter module | ✅ Foundation complete (layout, sidebar, dashboard — mock data) |
| Transporter Pickup Requests | ✅ Complete — auto-created when order reaches Ready for Pickup, accept/reject with atomic lock |
| Transporter My Trips & Delivery | ✅ Complete — trip list, trip detail, delivery status workflow (Picked Up → In Transit → Delivered), Order sync, Traceability events |
| Transporter Earnings | ✅ Complete — auto-generated on trip completion, KPI dashboard, history table, earning breakdown, pending/paid status |
| Transporter Profile | ✅ Complete — Personal, Vehicle, Verification, Payment, Notifications, Settings (change password, logout) |
| Admin module | Not started |
| Real ML / Python agents | Not started (demo Node agents only) |
| Refresh tokens | Not started |
| Image upload | UI placeholder only |
| Payment gateway | Not started (manual status tracking only) |
| Live GPS / routing | Not started |
| Blockchain write for traceability | Fields reserved, not used |
| Docker | Not started |

### Current Next Task

Finish remaining **Buyer** surfaces that are still placeholders, without
treating them as done:

1. Buyer Traceability
2. Buyer Profile (personal/business, verification, payment details, notifications, settings)
3. Buyer AI Centre (Buyer Match + Demand Forecast) — UI only until ML is requested

Do **not** start Transporter or Admin modules, and do **not** implement real
ML, until explicitly instructed.

---

## Key Rules for Future Agents

1. Do not build Transporter or Admin modules until explicitly instructed.
   Buyer work may continue only for the feature requested.
2. Do not implement real AI/ML agent logic (Python models, live scoring)
   until explicitly instructed. Demo agent JSON and farmer AI UI already exist.
3. Do not add new backend models, routes, or databases unless the current
   feature needs them. Prefer existing APIs.
4. Do not modify the Farmer sidebar nav items without explicit instruction.
   Do not modify the Buyer sidebar nav items without explicit instruction.
5. Do not introduce new npm libraries without explicit instruction.
6. Prefer API-backed context/services already in `frontend/src/services/`.
   Farmer dashboard and buyer dashboard still use local mock arrays — replace
   those only when asked.
7. Authentication is JWT (`AuthContext` + `protect`). Do not reintroduce
   mock-only auth. Do not add refresh tokens unless asked.
8. Images are UI-only placeholders — no real upload logic.
9. After every feature implementation, update `AGENTS.md` with relevant
   architectural, route, API, model, workflow, and feature changes. Do not
   overwrite unrelated existing documentation.
10. Do not mark a feature Complete if the routed page is `PlaceholderPage`,
    shows “Coming Soon” / “Module coming next”, or the primary action is
    disabled.

---

## Delivery Workflow — Authoritative Status Flow

Implemented and verified end-to-end. **Do not add new status transitions without updating this section.**

### Status chain

```
Booking:        Pending → Accepted → Completed
Order:          Confirmed → Preparing → Ready for Pickup → Picked Up → In Transit → Delivered
PickupRequest:  PENDING → ACCEPTED → COMPLETED
```

### Role ownership per transition

| Transition | Who | Endpoint |
|---|---|---|
| Booking: Pending → Accepted | Farmer | `PUT /api/bookings/:id/status` |
| Order: Confirmed → Preparing | Farmer | `PUT /api/orders/:id/status` |
| Order: Preparing → Ready for Pickup | Farmer | `PUT /api/orders/:id/status` — also auto-creates PickupRequest |
| PickupRequest: PENDING → ACCEPTED | Transporter | `PUT /api/transporter/pickups/:id/accept` (atomic) |
| Order: Ready for Pickup → Picked Up | Transporter only | `PUT /api/transporter/trips/:id/pickup` |
| Order: Picked Up → In Transit | Transporter only | `PUT /api/transporter/trips/:id/in-transit` |
| Order: In Transit → Delivered | Transporter only | `PUT /api/transporter/trips/:id/delivered` — auto-creates Payment + TransporterEarning + PickupRequest→COMPLETED |

**Farmers are hard-blocked from advancing past `Ready for Pickup`.** `orderController.TRANSITIONS` has empty arrays for `Picked Up`, `In Transit`, and `Delivered`. All post-pickup advancement goes exclusively through `transporterController.advanceTrip`.

### Auto-created records

| Trigger | Record created |
|---|---|
| Booking accepted | `Order` (status: Confirmed) |
| Order → Ready for Pickup | `PickupRequest` (status: PENDING, upsert — idempotent) |
| Transporter marks Delivered | `Payment` (status: Pending), `TransporterEarning` (unique per PickupRequest) |

### Traceability events

| Event | Fired from |
|---|---|
| `BOOKED` | `bookingController.updateBookingStatus` on accept |
| `PICKUP_SCHEDULED` | `bookingController.updateBookingStatus` on accept (if date present) |
| `PICKED_UP` | `transporterController.advanceTrip` |
| `IN_TRANSIT` | `transporterController.advanceTrip` |
| `DELIVERED` | `transporterController.advanceTrip` |

`traceabilityService.createEvent` is idempotent (dedup on `cropId + eventType + orderId`). Requires non-null `cropId` — skips silently if booking has no crop reference.

### Known gaps (by design)

- **Buyer confirm-receipt**: No `PUT /api/orders/buyer/:id/status` route exists. Delivery is confirmed unilaterally by the transporter. Buyer portal is read-only after order creation.
- **No role guard on `/api/transporter/*`**: `requireRole` middleware exists but is not wired to transporter routes. Pre-existing gap — out of scope.

### Fixed bugs (this session)

1. **Double `OrdersProvider`**: `FarmerOrders.jsx` mounted its own `<OrdersProvider>` on top of the one in `App.jsx`. Removed from `FarmerOrders.jsx`.
2. **Farmer bypass of transporter workflow**: `orderController.TRANSITIONS` allowed `Ready for Pickup → Picked Up` by farmer, bypassing TransporterEarning and PickupRequest completion. Fixed by setting those transitions to empty arrays.
3. **Dead traceability code**: Removed unreachable `PICKED_UP`/`IN_TRANSIT`/`DELIVERED` event blocks and unused `traceabilityService` import from `orderController.js`.

---

## Payment & Earnings Integration

### Payment flow

```
Order Delivered
  → Payment record created (Pending)  ← by transporterController.advanceTrip
  → TransporterEarning created (PENDING) ← same call

Buyer confirms payment
  → PUT /api/payments/:id/pay  ← new buyer-scoped endpoint
  → Payment.status = Paid, paidAt = now
  → TransporterEarning.status = PAID, paidAt = now (via PickupRequest link)
  → TraceabilityEvent PAYMENT_RECEIVED written
```

Farmer can also mark a payment Paid via `PUT /api/payments/:id/status` (existing endpoint, farmer-scoped). Both paths are idempotent.

### New endpoint

| Method | Path | Role | Description |
|---|---|---|---|
| `PUT` | `/api/payments/:id/pay` | buyer | Demo/manual buyer payment confirmation. Validates buyer owns the order via Booking.buyerId. Blocks if not Delivered or already Paid. Atomically marks Payment + TransporterEarning as Paid. |

### Earnings amounts (existing business logic, not changed)

- **Farmer**: full order `totalAmount` (crop price × quantity). Stored in `Payment.amount`.
- **Transporter**: `₹500 base + ₹5/km × estimatedDistanceKm + ₹0.50/kg × quantity`. Stored in `TransporterEarning.amount` with breakdown in `calculation`.
- The two amounts are independent — transporter fee is NOT deducted from the farmer's crop amount.

### Security

- Buyer can pay only for their own orders (verified via `Booking.buyerId === req.user._id`).
- Farmer and transporter earnings are scoped to their own records.
- Backend calculates all amounts; frontend never submits amounts.
- Duplicate payment returns HTTP 409.

### Frontend change

`BuyerPayments.jsx`:
- Added `buyerPayNow` import from `ordersApi.js`.
- Table row action now shows **Pay Now →** for Pending payments instead of "View Details".
- `PaymentDetailModal` now includes a two-step "Pay Now (Demo)" confirmation button for Pending payments, with a clear demo disclaimer. Shows success state after payment.
- Removed "coming soon" amber banner; replaced with blue demo notice.

### Limitations (by design)

- No real payment gateway. `PUT /api/payments/:id/pay` records confirmation only.
- No bank/UPI payout. Earning status `PAID` means the platform recorded the payment — no money moves.
- No buyer dispute or refund flow. These are not in the existing architecture.

---

## Dashboard Backend Integration

All three dashboards now fetch real API data. No dashboard uses `mockData.js` or inline mock constants anymore.

### Farmer Dashboard (`/farmer/dashboard`)
- **KPIs**: Total Crops (`GET /api/crops` count), Active Bookings (`OrdersContext.bookings` — Pending count), Pending Orders (`OrdersContext.orders` — active statuses count), Total Earnings (`OrdersContext.earnings.summary.totalEarnings`)
- **Crop Overview**: first 3 from `fetchCrops()` → mapped to `CropCard` props with category-based colour
- **Recent Orders**: first 3 from `OrdersContext.orders` → mapped to `OrderRow` props
- **Upcoming Activities**: derived from active orders (Ready for Pickup / scheduled pickup dates)
- **AI Insights**: static marketing panel (navigates to AI Centre — demo agents exist there)
- **Loading/empty/error states**: skeleton loaders, empty-state messages with CTA buttons, error banners

### Buyer Dashboard (`/buyer/dashboard`)
- **KPIs**: Active Orders (`fetchBuyerOrders` — active count), Pending Bookings (`fetchBuyerBookings` — Pending count), Active Requirements (`fetchRequirements` — ACTIVE count), Pending Payments (`fetchBuyerPayments.summary.pendingAmount`)
- **Procurement Overview**: from `fetchRequirements()` — ACTIVE requirements, first 5 rows
- **Recommended Supply**: from `fetchMarketplaceCrops()` — first 3 crops
- **Active Orders**: from `fetchBuyerOrders()` — active statuses, first 4 rows
- **Recent Activity**: empty state — no backend activity feed exists
- **Loading/empty/error states**: all sections have skeleton loaders and empty messages

### Transporter Dashboard (`/transporter/dashboard`)
- **KPIs**: Pending Requests (`fetchPickupRequests` — PENDING count), Active Trips (`fetchTrips` — active statuses count), Total Completed (`fetchEarnings.summary.completedTrips`), Total Earnings (`fetchEarnings.summary.totalEarnings`)
- **Active Trip**: first active trip from `fetchTrips()` — real route, crop, farmer/buyer, progress bar
- **Available Pickup Requests**: first 3 PENDING from `fetchPickupRequests()` — real crop, route, distance, earnings
- **Vehicle Card**: from `fetchVehicleInfo()` — real vehicle type, capacity, reg number
- **Quick Actions badge**: pending request count from API
- **Delivery Status strip**: derived from active trip's `orderStatus`
- **Loading/empty/error states**: all sections handled

### Data sources reused
- `OrdersContext` (already mounted on `/farmer` route tree) — provides bookings, orders, earnings without extra fetches for Farmer Dashboard
- `cropApi.fetchCrops` — Farmer Dashboard crop list
- `ordersApi` (fetchBuyerOrders, fetchBuyerBookings, fetchBuyerPayments) — Buyer Dashboard
- `requirementsApi.fetchRequirements` — Buyer Dashboard procurement table
- `marketplaceApi.fetchMarketplaceCrops` — Buyer Dashboard recommended supply
- `transporterApi` (fetchPickupRequests, fetchTrips, fetchEarnings, fetchVehicleInfo) — Transporter Dashboard
