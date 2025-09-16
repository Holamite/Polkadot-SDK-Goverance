export interface UserActivity {
  id: string
  userId: string
  type: "vote" | "proposal_created" | "proposal_viewed"
  proposalId: string
  proposalTitle: string
  details?: string
  timestamp: Date
}

export interface UserStats {
  totalVotes: number
  totalProposalsCreated: number
  totalProposalsViewed: number
  recentActivity: UserActivity[]
}

class UserStore {
  private activities: UserActivity[] = []
  private listeners: (() => void)[] = []

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }

  private loadFromStorage() {
    const stored = localStorage.getItem("user-activities")
    if (stored) {
      const data = JSON.parse(stored)
      this.activities = data.map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp),
      }))
    }
  }

  private saveToStorage() {
    if (typeof window !== "undefined") {
      localStorage.setItem("user-activities", JSON.stringify(this.activities))
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener())
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  addActivity(activity: Omit<UserActivity, "id" | "timestamp">): void {
    const newActivity: UserActivity = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }

    this.activities.unshift(newActivity) // Add to beginning for chronological order

    // Keep only last 100 activities to prevent storage bloat
    if (this.activities.length > 100) {
      this.activities = this.activities.slice(0, 100)
    }

    this.saveToStorage()
    this.notify()
  }

  getUserStats(userId: string): UserStats {
    const userActivities = this.activities.filter((activity) => activity.userId === userId)

    return {
      totalVotes: userActivities.filter((a) => a.type === "vote").length,
      totalProposalsCreated: userActivities.filter((a) => a.type === "proposal_created").length,
      totalProposalsViewed: userActivities.filter((a) => a.type === "proposal_viewed").length,
      recentActivity: userActivities.slice(0, 10), // Last 10 activities
    }
  }

  getAllActivities(): UserActivity[] {
    return [...this.activities]
  }

  getRecentActivities(limit = 20): UserActivity[] {
    return this.activities.slice(0, limit)
  }
}

export const userStore = new UserStore()
