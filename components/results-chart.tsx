"use client"

interface ResultsChartProps {
  data: Array<{
    id: number
    text: string
    votes: number
    percentage: number
    color: string
  }>
}

export function ResultsChart({ data }: ResultsChartProps) {
  const total = data.reduce((sum, item) => sum + item.votes, 0)

  return (
    <div className="space-y-4">
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const previousPercentage = data.slice(0, index).reduce((sum, prev) => sum + prev.percentage, 0)
            const strokeDasharray = `${item.percentage} ${100 - item.percentage}`
            const strokeDashoffset = -previousPercentage

            return (
              <circle
                key={item.id}
                cx="50"
                cy="50"
                r="15.915494309" // This gives us a circumference of 100
                fill="transparent"
                stroke={item.color}
                strokeWidth="8"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300"
              />
            )
          })}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{total}</div>
            <div className="text-xs text-muted-foreground">Total Votes</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {data.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-foreground truncate">{item.text}</span>
            <span className="text-muted-foreground ml-auto">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
