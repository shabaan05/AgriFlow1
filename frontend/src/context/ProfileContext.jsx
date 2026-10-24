/**
 * ProfileContext — shared state for the Profile module.
 * Fetches profile, farm info, verification, payment details, and notifications.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as api from '../services/profileApi.js'

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profile,       setProfile]       = useState(null)
  const [farmInfo,      setFarmInfo]      = useState(null)
  const [verification,  setVerification]  = useState(null)
  const [paymentDetails,setPaymentDetails]= useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [p, f, v, pd, n] = await Promise.all([
        api.fetchProfile(),
        api.fetchFarmInfo(),
        api.fetchVerification(),
        api.fetchPaymentDetails(),
        api.fetchNotifications(),
      ])
      setProfile(p.profile)
      setFarmInfo(f.farmInfo)
      setVerification(v.verification)
      setPaymentDetails(pd.paymentDetails)
      setNotifications(n.notifications)
      setUnreadCount(n.unreadCount)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ── Profile ─────────────────────────────────────────────────────────────
  async function saveProfile(data) {
    const res = await api.updateProfile(data)
    setProfile(res.profile)
    return res.profile
  }

  // ── Farm ────────────────────────────────────────────────────────────────
  async function saveFarmInfo(data) {
    const res = await api.updateFarmInfo(data)
    setFarmInfo(res.farmInfo)
    return res.farmInfo
  }

  // ── Verification ────────────────────────────────────────────────────────
  async function requestVerification(data) {
    const res = await api.submitVerification(data)
    setVerification(res.verification)
    return res.verification
  }

  // ── Payment ─────────────────────────────────────────────────────────────
  async function savePaymentDetails(data) {
    const res = await api.updatePaymentDetails(data)
    setPaymentDetails(res.paymentDetails)
    return res.paymentDetails
  }

  // ── Notifications ────────────────────────────────────────────────────────
  async function readNotification(id) {
    const updated = await api.markNotifRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  async function readAllNotifications() {
    await api.markAllNotifsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  // ── Notification Prefs ──────────────────────────────────────────────────
  async function saveNotifPrefs(data) {
    const res = await api.updateNotifPrefs(data)
    return res.notificationPrefs
  }

  return (
    <ProfileContext.Provider value={{
      profile, farmInfo, verification, paymentDetails,
      notifications, unreadCount,
      loading, error,
      saveProfile, saveFarmInfo, requestVerification, savePaymentDetails,
      readNotification, readAllNotifications, saveNotifPrefs,
      reload: loadAll,
    }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>')
  return ctx
}
