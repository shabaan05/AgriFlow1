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
| `/farmer/ai` | `AICentreDashboard` | Demo agents + Demand Forecast card |
| `/farmer/ai/buyer-matches` | `BuyerMatchAgent` | |
| `/farmer/ai/harvest-planner` | `HarvestPlanner` | |
| `/farmer/ai/shelf-life` | `ShelfLifeMonitor` | |
| `/farmer/ai/wastage-prevention` | `WastagePrevention` | |
| `/farmer/ai/demand-forecast` | `FarmerDemandForecast` | ✅ Live — real WMA forecast |
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
| `/buyer/ai` | `BuyerAICentre` | **✅ Real page — AI Centre dashboard** |
| `/buyer/ai/demand-forecast` | `DemandForecastPage` | **✅ Real page — Demand Forecast Agent UI** |
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
4. AI Centre → Buyer Match `/buyer/ai/buyer-match`, Demand Forecast `/buyer/ai/demand-forecast` (both Live)
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
| Route Optimization | ✅ Complete — deterministic pickup sequencing, capacity validation, stop timeline UI |
| Admin module | Not started |
| Real ML / Python agents | Not started (demo Node agents only) |
| Refresh tokens | Not started |
| Image upload | UI placeholder only |
| Payment gateway | Not started (manual status tracking only) |
| Live GPS / routing | Not started |
| Blockchain write for traceability | Fields reserved, not used |
| Docker | Not started |

### Current Next Task

Remaining **Buyer** placeholder surfaces not yet built:

1. Buyer Traceability (now complete — see Buyer Traceability section)
2. Buyer Profile (now complete — see Buyer Profile section)
3. Buyer AI Centre — Demand Forecast still a placeholder

Do **not** start Transporter or Admin modules, and do **not** implement real
ML, until explicitly instructed.

---

## Buyer AI Centre — Phase 2 (Buyer Match UI)

### Overview

Full Buyer–Farmer Matching Agent UI inside the existing Buyer AI Centre.
Powered by the backend `POST /api/ai/buyer-match` endpoint (rule-based, no ML).
Explainable ranking with per-factor score breakdown and booking actions.

### New Files

| File | Purpose |
|------|---------|
| `frontend/src/pages/buyer/ai/BuyerAICentre.jsx` | AI Centre landing page at `/buyer/ai` — agent card grid with Live/Coming Soon badges |
| `frontend/src/pages/buyer/ai/BuyerMatchPage.jsx` | Full matching UI at `/buyer/ai/buyer-match` — form, results, score ring, factor bars, booking |

### Modified Files

| File | Change |
|------|--------|
| `frontend/src/services/aiApi.js` | Added `post()` helper; added `runBuyerMatch(criteria)` → `POST /api/ai/buyer-match` |
| `frontend/src/App.jsx` | Replaced `BuyerAICentre` and `DemandForecast` placeholder imports with real `BuyerAICentre.jsx`; added `Route path="ai/buyer-match"` → `BuyerMatchPage` |

### Routes

| Path | Component | Status |
|------|-----------|--------|
| `/buyer/ai` | `BuyerAICentre` | ✅ Real page — AI Centre dashboard |
| `/buyer/ai/buyer-match` | `BuyerMatchPage` | ✅ Real page — Buyer Match Agent UI |
| `/buyer/ai/demand-forecast` | `DemandForecastPage` | ✅ Real page — Demand Forecast Agent UI |

### UI Feature Summary

**Input form** (sticky sidebar):
- Crop Name (required)
- Required Quantity (kg)
- Max Price per Kg (₹)
- Minimum Quality Grade (Any / Grade A / B / C)
- Required By Date (date picker, enforces future date)
- Delivery City + State

**Results panel**:
- Meta bar: crops scanned, eligible, returned
- `MatchCard` per result with:
  - Animated SVG score ring (0–100) colour-coded by tier (Excellent/Good/Fair/Low)
  - Rank 1 "Best Match" badge; verified farmer badge
  - Key stats grid: price, available qty, grade, location, harvest date, status
  - Expandable section: factor progress bars (6 factors) + "Why This Match?" reasons list
  - "Book Now" button → reuses existing `BookingModal` + `POST /api/bookings` workflow
- Scoring weights legend (pulled from `meta.weights` in API response)

**States**:
- Initial: prompt card
- Loading: 3-card skeleton
- Success with matches: ranked `MatchCard` list
- Success with 0 matches: empty state with "Adjust Criteria" CTA
- API / validation error: styled error card with "try again" link
- Post-booking: green success banner with "View Bookings →" link

**Auth**: uses existing `getStoredToken()` from `AuthContext` via `aiApi.js`. No new auth logic.

**Booking**: reuses `BookingModal` component and `POST /api/bookings` — no new booking workflow.

**Design**: matches Buyer UI system — Tailwind, `.card`, `.input-field`, `.btn-primary`, `.btn-outline`, agri-green palette, responsive grid.

---

## Buyer–Farmer Matching Agent (Backend)

### Overview

Rule-based, explainable ranking system. No ML, no LLM, no external AI APIs.
Deterministic 0–100 weighted score per crop. Isolated in a dedicated service.

### New Files

| File | Purpose |
|------|---------|
| `backend/services/buyerMatchService.js` | All matching logic — hard filter, per-factor scorers, composite scorer, `findMatches()` |

### Modified Files

| File | Change |
|------|--------|
| `backend/controllers/aiController.js` | Added `postBuyerMatch` handler; imports `buyerMatchService` |
| `backend/routes/aiRoutes.js` | Added `POST /api/ai/buyer-match` route (imports `postBuyerMatch`) |

### New Endpoint

| Method | Path | Auth | Role |
|--------|------|------|------|
| `POST` | `/api/ai/buyer-match` | `protect` (JWT) | `buyer` only (hard-checked in controller) |

#### Request body

```json
{
  "cropName":         "Tomato",          // required
  "quantity":         500,               // kg, optional
  "maxPricePerKg":    40,                // optional
  "qualityGrade":     "Grade A",         // "Grade A"|"Grade B"|"Grade C"|"Any", optional
  "requiredByDate":   "2026-12-01",      // ISO date string, optional
  "deliveryLocation": "Pune, Maharashtra" // optional
}
```

#### Response (success)

```json
{
  "success": true,
  "matches": [
    {
      "cropId": "...",
      "cropName": "Tomato",
      "variety": "Cherry",
      "category": "Vegetables",
      "availableQuantityKg": 650,
      "unit": "kg",
      "expectedHarvestDate": "2026-11-10T00:00:00.000Z",
      "expectedPricePerKg": 35,
      "minimumPrice": 28,
      "qualityGrade": "Grade A",
      "farmLocation": "Nashik, Maharashtra",
      "status": "Pre-Harvest",
      "farmerId": "...",
      "farmerName": "Ramesh Patil",
      "farmerVerification": "Verified",
      "farmName": "Green Acres",
      "matchScore": 84,
      "factors": {
        "price": 90, "quality": 100, "quantity": 100,
        "location": 60, "dateSuit": 70, "reliability": 70
      },
      "reasons": [
        "Price ₹35/kg is within your budget of ₹40/kg",
        "Exact quality match: Grade A",
        "Fully covers your requirement — 650 kg available, 500 kg needed",
        "Farm in Nashik, Maharashtra — same region as Pune, Maharashtra",
        "Harvest date 2026-11-10 gives 21 days before your deadline",
        "Farmer is platform-verified"
      ]
    }
  ],
  "meta": {
    "total": 12,
    "filtered": 5,
    "returned": 5,
    "cropName": "Tomato",
    "weights": { "price": 25, "quality": 20, "quantity": 20, "location": 15, "dateSuit": 10, "reliability": 10 }
  }
}
```

### Matching Logic

#### Hard Filters (all must pass to be eligible)

1. `cropName` must match request (case-insensitive)
2. `status` must be `Harvest Ready`, `Pre-Harvest`, or `Harvested`
3. `availableQuantityKg > 0`
4. If `maxPricePerKg` given: `crop.minimumAcceptablePrice <= maxPricePerKg`
5. If `qualityGrade` given (not `Any`): crop grade must be ≥ requested tier
6. If `requiredByDate` given: harvest date must be ≤ required-by date; stale requirements (past date) return a 400 error immediately

#### Weighted Scoring (deterministic, 0–100)

| Factor | Weight | Data source |
|--------|--------|-------------|
| Price | 25 % | `crop.expectedPricePerKg` vs `req.maxPricePerKg` |
| Quality | 20 % | `crop.qualityGrade` vs `req.qualityGrade` |
| Quantity | 20 % | `crop.availableQuantityKg` / `req.quantity` |
| Location | 15 % | Token overlap: `crop.farmLocation` vs `req.deliveryLocation` |
| Date suitability | 10 % | Days from harvest to required-by date |
| Farmer reliability | 10 % | `User.verification.status` + account age in days |

Weights are defined in `WEIGHTS` const at the top of `buyerMatchService.js` — change only there.

#### Reliability proxy (no fabricated data)

Uses only existing `User` fields:
- `verification.status`: Verified → +60, Pending → +30, Not Verified → +10
- Account age: +1 pt per 30 days, capped at +40

#### Result

- Up to **top 5** matches, ranked highest score first
- Each match includes `matchScore`, per-factor `factors` object, and `reasons` string array
- Empty results handled cleanly (no crash, descriptive message)

### Security

- `protect` middleware (JWT) runs on all `/api/ai/*` routes via `router.use(protect)`
- `postBuyerMatch` controller additionally checks `req.user.role === 'buyer'` and returns 403 if not
- Non-buyers (farmers, transporters) cannot access the endpoint
- No existing auth, booking, order, or transporter logic modified

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

---

## Demand Forecast Agent (Backend + UI)

### Overview

Rule-based, explainable demand forecasting service. No ML, no LLM, no external APIs.
Uses a Weighted Moving Average (WMA) with an OLS linear trend projection.
Confidence derived from the number of historical data points with non-zero demand.

### New Files

| File | Purpose |
|------|---------|
| `backend/services/demandForecastService.js` | All forecast logic — data aggregation, WMA, OLS trend, projection, confidence, recommendation |
| `frontend/src/pages/buyer/ai/DemandForecastPage.jsx` | Demand Forecast UI — form, KPI cards, SVG bar chart, recommendation, all states |

### Modified Files

| File | Change |
|------|--------|
| `backend/controllers/aiController.js` | Added `postDemandForecast` handler; imports `demandForecastService` |
| `backend/routes/aiRoutes.js` | Added `POST /api/ai/demand-forecast` route |
| `frontend/src/services/aiApi.js` | Added `runDemandForecast(body)` → `POST /api/ai/demand-forecast` |
| `frontend/src/pages/buyer/ai/BuyerAICentre.jsx` | Demand Forecast card: badge changed from "Coming Soon" to "Live"; CTA enabled |
| `frontend/src/App.jsx` | Replaced `DemandForecast` placeholder import with real `DemandForecastPage`; removed unused placeholder import |

### New Endpoint

| Method | Path | Auth | Role |
|--------|------|------|------|
| `POST` | `/api/ai/demand-forecast` | `protect` (JWT) | `buyer` only (hard-checked in controller) |

#### Request body

```json
{
  "cropName":       "Tomato",   // required
  "forecastPeriod": "3"         // "1" | "3" | "6" | "12" (months), default 3
}
```

#### Response (success)

```json
{
  "success": true,
  "hasData": true,
  "cropName": "Tomato",
  "forecastMonths": 3,
  "forecastLabel": "3 months",
  "trend": "INCREASING",
  "demandLevel": "HIGH",
  "expectedPriceMin": 27,
  "expectedPriceMax": 33,
  "confidence": "MEDIUM",
  "confidenceScore": 55,
  "recommendation": "Demand for Tomato is growing. Consider securing...",
  "dataSources": ["4 completed orders", "2 accepted bookings", "1 market demand signal"],
  "historicalPoints": [{ "period": "2026-10", "label": "Oct 2026", "quantity": 400, "avgPrice": 30 }],
  "forecastPoints":   [{ "period": "2026-11", "label": "Nov 2026", "quantity": 450, "isForecast": true }],
  "totalForecastQty": 1380,
  "meta": { "historicalMonths": 12, "nonZeroMonths": 4, "totalTransactions": 7, "demandSignalCount": 1, "baseWMA": 420, "trendSlope": 12.5 }
}
```

### Forecast Method

1. **Data aggregation**: monthly `qty + avgPrice` buckets from 4 sources over the past 12 months
   - `Order` (status: Delivered) — full weight (actual transactions)
   - `Booking` (status: Accepted/Completed) — full weight (confirmed demand)
   - `BuyerRequirement` — 0.6× weight (prospective/prospected demand, avoids double-count)
   - `Demand` model — demand level/trend signals + price range
2. **Weighted Moving Average**: recent months get higher weight (ascending weights 1→7 over 12 slots)
3. **OLS linear trend**: least-squares slope over monthly quantities → `INCREASING / STABLE / DECREASING`
4. **Projection**: `WMA_base + slope × month_offset` per future month, floored at 0
5. **Confidence**: HIGH ≥ 6 non-zero months, MEDIUM ≥ 3, LOW otherwise; score 20–95
6. **Price**: weighted average of historical `avgPrice` ± 10 % band; falls back to Demand board price range

### Data source decision log

- `Order.cropName / quantity / pricePerUnit / createdAt` — primary signal
- `Booking.cropName / quantity / pricePerUnit / createdAt` — secondary demand signal
- `BuyerRequirement.cropName / quantity / maxPricePerKg / createdAt` — prospective signal (0.6× weight)
- `Demand.demandQuantity / demandLevel / demandTrend / expectedPriceMin/Max` — market board signals
- No fabricated fields; if a field is absent/zero it is simply excluded from the relevant average

### UI Feature Summary

- Input form: Crop Name + Forecast Period selector (1/3/6/12 months)
- KPI cards: Demand Trend, Demand Level, Expected Price range, Total Forecast Qty
- SVG bar chart (no external library): historical bars (agri-green) + forecast bars (light-green), dashed divider, Y-axis grid, rotated X labels, inline legend
- Confidence bar with colour-coded tier and data-point breakdown
- Recommendation panel with procurement advice
- All states: initial prompt, loading skeleton, success, empty (no data), API error

---

## Demand Forecast — Farmer AI Centre (Phase 3)

### Overview

The Demand Forecast Agent is now available on both the Farmer and Buyer sides.
The backend service and API are shared — no duplication.
The farmer UI frames the forecast as a production/harvest planning tool.

### What changed

| File | Change |
|------|--------|
| `backend/controllers/aiController.js` | `postDemandForecast`: role guard widened from `buyer-only` to `farmer` and `buyer` |
| `frontend/src/pages/farmer/ai/FarmerDemandForecast.jsx` | **NEW** — farmer-framed demand forecast page at `/farmer/ai/demand-forecast` |
| `frontend/src/pages/farmer/ai/AICentreDashboard.jsx` | Added Demand Forecast "Live" card linking to `/farmer/ai/demand-forecast`; added `const navigate = useNavigate()` to default export |
| `frontend/src/components/ai/AgentPageHeader.jsx` | Added `forecast` key to `iconMap` |
| `frontend/src/App.jsx` | Imported `FarmerDemandForecast`; added `Route path="demand-forecast"` inside farmer `ai` nest |

### What was reused (no duplication)

- `POST /api/ai/demand-forecast` — same endpoint, same service, same data
- `backend/services/demandForecastService.js` — unchanged
- `frontend/src/services/aiApi.js` → `runDemandForecast()` — unchanged
- SVG chart logic — copied inline (no shared component needed; both pages are self-contained)
- All Tailwind classes, `.card`, `.btn-primary`, `input-field` etc. — unchanged

### Farmer UI differences vs Buyer UI

| Aspect | Farmer | Buyer |
|--------|--------|-------|
| Back navigation | `/farmer/ai` | `/buyer/ai` |
| Recommendation label | "Production Recommendation" | "Procurement Recommendation" |
| Recommendation text | Farmer-framed (grow more/less, plan harvest cycle) | Buyer-framed (secure contracts, negotiate price) |
| Price KPI label | "Expected Selling Price" | "Expected Price" |
| Chart title | "Buyer Demand History vs Forecast" | "Historical vs Forecast Demand" |
| CTAs | "+ Add / Plan Crop" → `/farmer/crops/add` · "View Market Demand" → `/farmer/demand` | none |
| How-it-works panel | Farmer production focus | Procurement planning focus |
| AgentPageHeader | Used (farmer pattern) | Not used (buyer pattern) |

### Farmer workflow integration

```
Historical Data
  → Demand Forecast Agent (/farmer/ai/demand-forecast)
  → Farmer Production/Harvest Decision
  → Crop (/farmer/crops/add)
  → Marketplace / Buyer Matching
  → Booking → Order
```

### Route added

| Path | Component | Auth |
|------|-----------|------|
| `/farmer/ai/demand-forecast` | `FarmerDemandForecast` | `ProtectedRoute` (farmer session) |

### Buyer AI Centre

- Unchanged — `DemandForecastPage` at `/buyer/ai/demand-forecast` still works
- `BuyerAICentre` dashboard still shows both agents as Live
- No buyer routes broken

---

## Route Optimization (Transporter Module)

### Overview

Deterministic pickup/delivery route optimizer for transporters. No ML, no LLM, no external APIs.
Uses urgency scoring + greedy nearest-neighbor sequencing based on available text location fields.

### New Files

| File | Purpose |
|------|---------|
| `backend/services/routeOptimizationService.js` | Optimization engine — hard filter, urgency scoring, greedy sequencing, route metrics |
| `frontend/src/pages/transporter/routes/RouteOptimization.jsx` | Route Optimization UI — request selection, capacity check, stop timeline, KPI cards, actions |

### Modified Files

| File | Change |
|------|--------|
| `backend/controllers/transporterController.js` | Added `optimizeRoute` handler; imports `routeOptimizationService` |
| `backend/routes/transporterRoutes.js` | Added `POST /api/transporter/routes/optimize`; imported `optimizeRoute` |
| `frontend/src/services/transporterApi.js` | Added `optimizeRoute(body)` → `POST /api/transporter/routes/optimize` |
| `frontend/src/App.jsx` | Replaced `TransporterRoutes` placeholder with `RouteOptimization`; removed unused placeholder import |

### New Endpoint

| Method | Path | Auth | Role |
|--------|------|------|------|
| `POST` | `/api/transporter/routes/optimize` | `protect` (JWT) | `transporter` only (hard-checked in controller) |

#### Request body

```json
{
  "pickupRequestIds": ["id1", "id2", "id3"],
  "vehicleCapacity": 1000
}
```

#### Response

```json
{
  "success": true,
  "route": [{ "requestId": "...", "cropName": "...", "urgency": "HIGH", "priorityScore": 85, ... }],
  "stops": [{ "stopNumber": 1, "type": "PICKUP", "location": "...", "urgency": "HIGH", ... }],
  "totalDistanceKm": 450,
  "estimatedDurationMinutes": 600,
  "totalLoadKg": 800,
  "totalEarnings": 4250,
  "overCapacity": false,
  "vehicleCapacity": 1000,
  "stopCount": 6,
  "pickupCount": 3,
  "rejected": [],
  "priorityReason": "2 high-urgency pickups scheduled today — placed first in sequence.",
  "optimizationSummary": "3 pickups sequenced across 6 stops. Total load: 800 kg..."
}
```

### Optimization Algorithm

1. **Hard filter** — only PENDING requests are plannable; others are returned in `rejected[]` with reason
2. **Urgency scoring** — pickupDate proximity: ≤1 day = HIGH (60 pts), ≤3 days = MEDIUM (30 pts), else NORMAL (10 pts)
3. **Composite priority score** — urgency (60%) + load ratio vs capacity (25%) + earnings normalized (15%)
4. **Greedy nearest-neighbor** — start with highest-priority stop; each subsequent stop is chosen as the unvisited pickup location most similar to the previous delivery location (text-token overlap)
5. **Stop list** — alternating PICKUP / DELIVERY stops with cumulative load and distance tracking
6. **Metrics** — total distance sum of `estimatedDistanceKm` per request; duration estimated at 45 km/h assumed speed

### Data sources (existing fields only — no invented data)

- `PickupRequest.pickupLocation` / `deliveryLocation` — text strings used for proximity scoring
- `PickupRequest.estimatedDistanceKm` — per-request leg distance (existing field, set at request creation)
- `PickupRequest.pickupDate` — used for urgency calculation
- `PickupRequest.quantity` — used for capacity check
- `PickupRequest.estimatedEarnings` — used for earnings aggregation
- `User.vehicleInfo.capacity` — String, auto-loaded in UI via `fetchVehicleInfo()`; parsed with `parseFloat()`

### Limitation (by design)

- No real GPS coordinates exist on any model — location proximity is approximated by shared text tokens (city/state names). This is disclosed in the service file and matches task requirements ("do not invent coordinates").
- `estimatedDistanceKm` is still the placeholder heuristic set at request creation (150 km default); actual mileage awaits a real routing API integration.

### Route Optimization Workflow integration

```
Order Ready for Pickup
  → PickupRequest (PENDING)
  → Route Optimization (/transporter/routes) ← NEW
      Select requests → Optimize → View sequenced stops
  → Accept request (/transporter/pickups/:id)
  → My Trips (/transporter/trips)
  → Pickup → In Transit → Delivered
```
