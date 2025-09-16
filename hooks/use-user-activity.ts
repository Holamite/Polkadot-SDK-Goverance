"use client"

import { useState, useEffect } from "react"
import { userStore, type UserStats, type UserActivity } from "@/lib/user-store"

export function useUserStats(userId: string) {
  const [stats, setStats] = useState<UserStats>({
    totalVotes: 0,
    totalProposalsCreated: 0,
    totalProposalsViewed: 0,
    recentActivity: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const updateStats = () => {
      setStats(userStore.getUserStats(userId))
      setLoading(false)
    }

    updateStats()
    const unsubscribe = userStore.subscribe(updateStats)

    return unsubscribe
  }, [userId])

  return { stats, loading }
}

export function useRecentActivity(limit?: number) {
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const updateActivities = () => {
      setActivities(userStore.getRecentActivities(limit))
      setLoading(false)
    }

    updateActivities()
    const unsubscribe = userStore.subscribe(updateActivities)

    return unsubscribe
  }, [limit])

  return { activities, loading }
}
