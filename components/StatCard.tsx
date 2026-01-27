interface StatCardProps {
  value: string | number
  label: string
  change?: string
  borderColor?: string
}

export default function StatCard({ value, label, change, borderColor = 'border-primary' }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${borderColor}`}>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600 mb-2">{label}</div>
      {change && <div className="text-xs text-success mt-2">{change}</div>}
    </div>
  )
}
