import InsightCard from './InsightCard'

export default function InsightStack({
  insights = [],
}) {
  if (!insights.length) return null

  return (
    <div className="space-y-3">
      {insights.map(item => (
        <InsightCard
          key={item.id}
          insight={item}
        />
      ))}
    </div>
  )
}