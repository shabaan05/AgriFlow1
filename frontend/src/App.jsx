import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Auth context — must wrap everything
import { AuthProvider }  from './context/AuthContext.jsx'
import { CropsProvider } from './context/CropsContext.jsx'
import { OrdersProvider } from './context/OrdersContext.jsx'

// Public
import Home from './pages/Home.jsx'

// Farmer Auth
import FarmerLogin    from './pages/farmer/FarmerLogin.jsx'
import FarmerRegister from './pages/farmer/FarmerRegister.jsx'

// Farmer Layout + guard
import FarmerLayout   from './layouts/FarmerLayout.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard.jsx'
import FarmerDemand    from './pages/farmer/FarmerDemand.jsx'
import FarmerAI        from './pages/farmer/FarmerAI.jsx'
import FarmerOrders    from './pages/farmer/FarmerOrders.jsx'
import FarmerProfile   from './pages/farmer/FarmerProfile.jsx'

// Crops Module
import MyCrops    from './pages/farmer/crops/MyCrops.jsx'
import AddCrop    from './pages/farmer/crops/AddCrop.jsx'
import CropDetail from './pages/farmer/crops/CropDetail.jsx'
import EditCrop   from './pages/farmer/crops/EditCrop.jsx'

// Demand Module
import MarketDemand        from './pages/farmer/demand/MarketDemand.jsx'
import BuyerRequirements   from './pages/farmer/demand/BuyerRequirements.jsx'
import DemandOpportunities from './pages/farmer/demand/DemandOpportunities.jsx'

// AI Centre Module
import AICentreDashboard    from './pages/farmer/ai/AICentreDashboard.jsx'
import BuyerMatchAgent      from './pages/farmer/ai/BuyerMatchAgent.jsx'
import HarvestPlanner       from './pages/farmer/ai/HarvestPlanner.jsx'
import ShelfLifeMonitor     from './pages/farmer/ai/ShelfLifeMonitor.jsx'
import WastagePrevention    from './pages/farmer/ai/WastagePrevention.jsx'
import FarmerDemandForecast from './pages/farmer/ai/FarmerDemandForecast.jsx'

// Bookings & Orders Module
import Bookings        from './pages/farmer/orders/Bookings.jsx'
import BookingDetail   from './pages/farmer/orders/BookingDetail.jsx'
import Orders          from './pages/farmer/orders/Orders.jsx'
import OrderDetail     from './pages/farmer/orders/OrderDetail.jsx'
import PickupDelivery  from './pages/farmer/orders/PickupDelivery.jsx'
import Earnings        from './pages/farmer/orders/Earnings.jsx'
import Traceability    from './pages/farmer/orders/Traceability.jsx'

// Buyer Module
import BuyerLogin    from './pages/buyer/BuyerLogin.jsx'
import BuyerRegister from './pages/buyer/BuyerRegister.jsx'
import BuyerLayout   from './layouts/BuyerLayout.jsx'
import BuyerProtectedRoute from './routes/BuyerProtectedRoute.jsx'
import BuyerDashboard from './pages/buyer/BuyerDashboard.jsx'

// Buyer Marketplace
import MarketplaceBrowse from './pages/buyer/marketplace/MarketplaceBrowse.jsx'
import MarketplaceCropDetail from './pages/buyer/marketplace/CropDetail.jsx'
import MarketplaceFarmerDetail from './pages/buyer/marketplace/FarmerDetail.jsx'
import MarketplaceShortlisted from './pages/buyer/marketplace/Shortlisted.jsx'

// Buyer Requirements
import BuyerMyRequirements    from './pages/buyer/requirements/MyRequirements.jsx'
import BuyerCreateRequirement from './pages/buyer/requirements/CreateRequirement.jsx'
import BuyerRequirementDetail from './pages/buyer/requirements/RequirementDetail.jsx'
import BuyerEditRequirement   from './pages/buyer/requirements/EditRequirement.jsx'

// Buyer Orders & Delivery
import BuyerOrdersList       from './pages/buyer/orders/BuyerOrders.jsx'
import BuyerOrderDetail      from './pages/buyer/orders/BuyerOrderDetail.jsx'
import BuyerDeliveryTracking from './pages/buyer/orders/BuyerDeliveryTracking.jsx'
import BuyerDeliveryList     from './pages/buyer/orders/BuyerDeliveryList.jsx'

// Buyer Bookings
import BuyerBookingsList  from './pages/buyer/bookings/BuyerBookings.jsx'
import BuyerBookingDetail from './pages/buyer/bookings/BuyerBookingDetail.jsx'

// Buyer Payments
import BuyerPaymentsPage from './pages/buyer/payments/BuyerPayments.jsx'

// Buyer Traceability
import BuyerTraceabilityList   from './pages/buyer/traceability/BuyerTraceability.jsx'
import BuyerTraceabilityDetail from './pages/buyer/traceability/BuyerTraceabilityDetail.jsx'

// Buyer Profile
import BuyerProfilePage from './pages/buyer/profile/BuyerProfile.jsx'

// Transporter Module
import TransporterLogin    from './pages/transporter/TransporterLogin.jsx'
import TransporterRegister from './pages/transporter/TransporterRegister.jsx'
import TransporterLayout   from './layouts/TransporterLayout.jsx'
import TransporterProtectedRoute from './routes/TransporterProtectedRoute.jsx'
import TransporterDashboard from './pages/transporter/TransporterDashboard.jsx'
import PickupRequests       from './pages/transporter/pickups/PickupRequests.jsx'
import PickupRequestDetail  from './pages/transporter/pickups/PickupRequestDetail.jsx'
import MyTrips              from './pages/transporter/trips/MyTrips.jsx'
import TripDetail           from './pages/transporter/trips/TripDetail.jsx'
import TransporterEarnings  from './pages/transporter/earnings/Earnings.jsx'
import TransporterEarningDetail from './pages/transporter/earnings/EarningDetail.jsx'
import TransporterProfilePage from './pages/transporter/profile/TransporterProfile.jsx'
// Transporter Route Optimization — real page
import RouteOptimization from './pages/transporter/routes/RouteOptimization.jsx'

// Buyer AI Centre — real pages
import BuyerAICentre from './pages/buyer/ai/BuyerAICentre.jsx'
import BuyerMatchPage from './pages/buyer/ai/BuyerMatchPage.jsx'
import DemandForecastPage from './pages/buyer/ai/DemandForecastPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CropsProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />

            {/* Farmer Auth */}
            <Route path="/farmer/login"    element={<FarmerLogin />} />
            <Route path="/farmer/register" element={<FarmerRegister />} />

            {/* Buyer Auth */}
            <Route path="/buyer/login"    element={<BuyerLogin />} />
            <Route path="/buyer/register" element={<BuyerRegister />} />

            {/* Transporter Auth */}
            <Route path="/transporter/login"    element={<TransporterLogin />} />
            <Route path="/transporter/register" element={<TransporterRegister />} />

            {/* Farmer Protected Area */}
            <Route
              path="/farmer"
              element={
                <ProtectedRoute>
                  <OrdersProvider>
                    <FarmerLayout />
                  </OrdersProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<FarmerDashboard />} />

              {/* Crops sub-routes */}
              <Route path="crops"          element={<MyCrops />} />
              <Route path="crops/add"      element={<AddCrop />} />
              <Route path="crops/:id"      element={<CropDetail />} />
              <Route path="crops/:id/edit" element={<EditCrop />} />

              <Route path="demand" element={<FarmerDemand />}>
                <Route index                  element={<MarketDemand />} />
                <Route path="buyers"          element={<BuyerRequirements />} />
                <Route path="opportunities"   element={<DemandOpportunities />} />
              </Route>
              <Route path="ai" element={<FarmerAI />}>
                <Route index                        element={<AICentreDashboard />} />
                <Route path="buyer-matches"         element={<BuyerMatchAgent />} />
                <Route path="harvest-planner"       element={<HarvestPlanner />} />
                <Route path="shelf-life"            element={<ShelfLifeMonitor />} />
                <Route path="wastage-prevention"    element={<WastagePrevention />} />
                <Route path="demand-forecast"       element={<FarmerDemandForecast />} />
              </Route>
              {/* Bookings & Orders — tab shell */}
              <Route path="orders" element={<FarmerOrders />}>
                <Route index          element={<Bookings />} />
                <Route path="active"  element={<Orders />} />
              </Route>

              {/* Booking detail — outside shell so it gets full width */}
              <Route path="bookings/:id"          element={<BookingDetail />} />
              <Route path="orders/:id"            element={<OrderDetail />} />

              {/* Top-level tabs that live outside /farmer/orders nested routes */}
              <Route path="pickup-delivery"       element={<FarmerOrders />}>
                <Route index element={<PickupDelivery />} />
              </Route>
              <Route path="earnings"              element={<FarmerOrders />}>
                <Route index element={<Earnings />} />
              </Route>
              <Route path="traceability"           element={<FarmerOrders />}>
                <Route index element={<Traceability />} />
              </Route>
              <Route path="profile" element={<FarmerProfile />} />
            </Route>

            {/* ── Buyer Protected Area ─────────────────────────────────────── */}
            <Route
              path="/buyer"
              element={
                <BuyerProtectedRoute>
                  <BuyerLayout />
                </BuyerProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<BuyerDashboard />} />

              {/* Marketplace — real pages */}
              <Route path="marketplace"                      element={<MarketplaceBrowse />} />
              <Route path="marketplace/crop/:id"             element={<MarketplaceCropDetail />} />
              <Route path="marketplace/farmer/:id"           element={<MarketplaceFarmerDetail />} />
              <Route path="marketplace/shortlisted"          element={<MarketplaceShortlisted />} />

              {/* Requirements — real pages */}
              <Route path="requirements"              element={<BuyerMyRequirements />} />
              <Route path="requirements/create"       element={<BuyerCreateRequirement />} />
              <Route path="requirements/:id"          element={<BuyerRequirementDetail />} />
              <Route path="requirements/:id/edit"     element={<BuyerEditRequirement />} />

              {/* AI Centre */}
              <Route path="ai"                               element={<BuyerAICentre />} />
              <Route path="ai/buyer-match"                   element={<BuyerMatchPage />} />
              <Route path="ai/demand-forecast"               element={<DemandForecastPage />} />

              {/* Bookings & Orders */}
              <Route path="bookings"                         element={<BuyerBookingsList />} />
              <Route path="bookings/:id"                     element={<BuyerBookingDetail />} />
              <Route path="orders"                           element={<BuyerOrdersList />} />
              <Route path="orders/:id"                       element={<BuyerOrderDetail />} />
              <Route path="delivery"                        element={<BuyerDeliveryList />} />
              <Route path="delivery/:id"                    element={<BuyerDeliveryTracking />} />
              <Route path="payments"                        element={<BuyerPaymentsPage />} />
              <Route path="traceability"                    element={<BuyerTraceabilityList />} />
              <Route path="traceability/:orderId"           element={<BuyerTraceabilityDetail />} />

              {/* Profile — single page with 6 internal tabs */}
              <Route path="profile"                         element={<BuyerProfilePage />} />
              <Route path="profile/verification"             element={<BuyerProfilePage />} />
              <Route path="profile/payment-details"         element={<BuyerProfilePage />} />
              <Route path="profile/notifications"            element={<BuyerProfilePage />} />
              <Route path="profile/settings"                element={<BuyerProfilePage />} />
            </Route>

            {/* ── Transporter Protected Area ───────────────────────────────── */}
            <Route
              path="/transporter"
              element={
                <TransporterProtectedRoute>
                  <TransporterLayout />
                </TransporterProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TransporterDashboard />} />
              <Route path="pickups"   element={<PickupRequests />} />
              <Route path="pickups/:id" element={<PickupRequestDetail />} />
              <Route path="trips"     element={<MyTrips />} />
              <Route path="trips/:id"  element={<TripDetail />} />
              <Route path="routes"    element={<RouteOptimization />} />
              <Route path="earnings"  element={<TransporterEarnings />} />
              <Route path="earnings/:id" element={<TransporterEarningDetail />} />
              <Route path="profile"   element={<TransporterProfilePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CropsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
