"use client"

interface ParticipationChartProps {
  data: Array<{
    month: string
    votes: number
  }>
}

export function ParticipationChart({ data }: ParticipationChartProps) {
  const maxVotes = Math.max(...data.map((d) => d.votes))

  return (
    <div className="h-64 p-4">
      <div className="flex items-end justify-between h-full gap-2">
        {data.map((item, index) => {
          const height = (item.votes / maxVotes) * 100

          return (
            <div key={item.month} className="flex flex-col items-center flex-1 group">
              {/* Bar */}
              <div className="relative w-full flex items-end h-48">
                <div
                  className="w-full bg-gradient-to-t from-primary/30 to-primary/10 rounded-t-sm transition-all duration-300 group-hover:from-primary/50 group-hover:to-primary/20 border-t-2 border-primary"
                  style={{ height: `${height}%` }}
                />

                {/* Tooltip on hover */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background border border-border rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
                  {item.votes.toLocaleString()} votes
                </div>
              </div>

              {/* Month label */}
              <div className="text-xs text-muted-foreground mt-2 font-medium">{item.month}</div>
            </div>
          )
        })}
      </div>

      {/* Y-axis labels */}
      <div className="absolute left-0 top-4 h-48 flex flex-col justify-between text-xs text-muted-foreground">
        <span>{maxVotes.toLocaleString()}</span>
        <span>{Math.round(maxVotes * 0.75).toLocaleString()}</span>
        <span>{Math.round(maxVotes * 0.5).toLocaleString()}</span>
        <span>{Math.round(maxVotes * 0.25).toLocaleString()}</span>
        <span>0</span>
      </div>
    </div>
  )
}
