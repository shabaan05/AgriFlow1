/**
 * roleRedirect.js — centralized role → dashboard mapping.
 *
 * Use this in every login/register page and ProtectedRoute
 * instead of hardcoding '/farmer/dashboard'.
 *
 * To add a new role, add one line here — nothing else changes.
 */

const ROLE_DASHBOARDS = {
  farmer:      '/farmer/dashboard',
  buyer:       '/buyer/dashboard',
  transporter: '/transporter/dashboard',
  admin:       '/admin/dashboard',
}

const DEFAULT_DASHBOARD = '/farmer/dashboard'

/**
 * Returns the dashboard path for a given role string.
 * Falls back to DEFAULT_DASHBOARD if role is unknown.
 */
export function getDashboardForRole(role) {
  return ROLE_DASHBOARDS[role] || DEFAULT_DASHBOARD
}
