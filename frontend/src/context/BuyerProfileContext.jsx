/**
 * BuyerProfileContext — shared state for the Buyer Profile module.
 * Mirrors ProfileContext but calls /api/buyers/* endpoints.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as api from '../services/profileApi.js'

const BuyerProfileContext = createContext(null)

export function BuyerProfileProvider({ children }) {
  const [profile,        setProfile]        = useState(null)
  const [buyerInfo,      setBuyerInfo]      = useState(null)
  const [verification,   setVerification]   = useState(null)
  const [paymentDetails, setPaymentDetails] = useState(null)
  const [notifications,  setNotifications]  = useState([])
  const [unreadCount,    setUnreadCount]    = useState(0)
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [p, b, v, pd, n] = await Promise.all([
        api.fetchBuyerProfile(),
        api.fetchBuyerInfo(),
        api.fetchBuyerVerification(),
        api.fetchBuyerPaymentDetails(),
        api.fetchNotifications(),
      ])
      setProfile(p.profile)
      setBuyerInfo(b.buyerInfo)
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

  async function saveProfile(data) {
    const res = await api.updateBuyerProfile(data)
    setProfile(res.profile)
    return res.profile
  }

  async function saveBuyerInfo(data) {
    const res = await api.updateBuyerInfo(data)
    setBuyerInfo(res.buyerInfo)
    return res.buyerInfo
  }

  async function requestVerification(data) {
    const res = await api.submitBuyerVerification(data)
    setVerification(res.verification)
    return res.verification
  }

  async function savePaymentDetails(data) {
    const res = await api.updateBuyerPaymentDetails(data)
    setPaymentDetails(res.paymentDetails)
    return res.paymentDetails
  }

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

  async function saveNotifPrefs(data) {
    const res = await api.updateBuyerNotifPrefs(data)
    return res.notificationPrefs
  }

  return (
    <BuyerProfileContext.Provider value={{
      profile, buyerInfo, verification, paymentDetails,
      notifications, unreadCount,
      loading, error,
      saveProfile, saveBuyerInfo, requestVerification, savePaymentDetails,
      readNotification, readAllNotifications, saveNotifPrefs,
      reload: loadAll,
    }}>
      {children}
    </BuyerProfileContext.Provider>
  )
}

export function useBuyerProfile() {
  const ctx = useContext(BuyerProfileContext)
  if (!ctx) throw new Error('useBuyerProfile must be used inside <BuyerProfileProvider>')
  return ctx
}
