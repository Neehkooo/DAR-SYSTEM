import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { apiUrl } from '../utils/apiConfig'

const fallbackMonthlyData = [
  { name: 'Jan', 'NOA & NTP': 45, 'RESO Direct Acquisition': 20, 'RESO SVP': 15, 'RESO LOV': 10, 'RESO Emergency Split': 5 },
  { name: 'Feb', 'NOA & NTP': 52, 'RESO Direct Acquisition': 25, 'RESO SVP': 18, 'RESO LOV': 12, 'RESO Emergency Split': 8 },
  { name: 'Mar', 'NOA & NTP': 38, 'RESO Direct Acquisition': 15, 'RESO SVP': 10, 'RESO LOV': 8, 'RESO Emergency Split': 4 },
  { name: 'Apr', 'NOA & NTP': 65, 'RESO Direct Acquisition': 35, 'RESO SVP': 22, 'RESO LOV': 15, 'RESO Emergency Split': 10 },
  { name: 'May', 'NOA & NTP': 48, 'RESO Direct Acquisition': 28, 'RESO SVP': 16, 'RESO LOV': 11, 'RESO Emergency Split': 6 },
  { name: 'Jun', 'NOA & NTP': 72, 'RESO Direct Acquisition': 40, 'RESO SVP': 30, 'RESO LOV': 20, 'RESO Emergency Split': 15 },
]

const fallbackYearlyData = [
  { name: '2025', 'NOA & NTP': 650, 'RESO Direct Acquisition': 350, 'RESO SVP': 220, 'RESO LOV': 150, 'RESO Emergency Split': 100 },
  { name: '2026', 'NOA & NTP': 720, 'RESO Direct Acquisition': 400, 'RESO SVP': 300, 'RESO LOV': 200, 'RESO Emergency Split': 150 },
  { name: '2027', 'NOA & NTP': 0, 'RESO Direct Acquisition': 0, 'RESO SVP': 0, 'RESO LOV': 0, 'RESO Emergency Split': 0 },
  { name: '2028', 'NOA & NTP': 0, 'RESO Direct Acquisition': 0, 'RESO SVP': 0, 'RESO LOV': 0, 'RESO Emergency Split': 0 },
  { name: '2029', 'NOA & NTP': 0, 'RESO Direct Acquisition': 0, 'RESO SVP': 0, 'RESO LOV': 0, 'RESO Emergency Split': 0 },
  { name: '2030', 'NOA & NTP': 0, 'RESO Direct Acquisition': 0, 'RESO SVP': 0, 'RESO LOV': 0, 'RESO Emergency Split': 0 },
]

const colors = {
  noa: '#0B6623',
  direct: '#F59E0B',
  svp: '#3B82F6',
  lov: '#8B5CF6',
  split: '#EF4444'
}

const RECENT_ACTIVITY_LIMIT = 5

const Dashboard = () => {
  const [chartData, setChartData] = useState({
    monthly: fallbackMonthlyData,
    yearly: fallbackYearlyData,
    currentYear: new Date().getFullYear()
  })
  
  const [activities, setActivities] = useState([])
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch(apiUrl('dashboard/stats/'))
        if (statsRes.ok) {
          const stats = await statsRes.json()
          setChartData({
            monthly: stats.monthlyData,
            yearly: stats.yearlyData,
            currentYear: stats.currentYear
          })
        }
      } catch (err) {
        console.error('Error fetching dashboard stats, using fallback:', err)
      }

      try {
        const logsRes = await fetch(apiUrl(`activity_logs/?limit=${RECENT_ACTIVITY_LIMIT}`))
        if (logsRes.ok) {
          const data = await logsRes.json()
          const logs = Array.isArray(data) ? data : (data.results || [])
          if (logs.length > 0) {
            const formattedLogs = logs.slice(0, RECENT_ACTIVITY_LIMIT).map(log => {
              const name = log.user || 'System'
              const parts = name.trim().split(/\s+/)
              const initials = parts.length === 1
                ? parts[0].substring(0, 2).toUpperCase()
                : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()

              let timeStr = 'Just now'
              if (log.timestamp) {
                try {
                  const date = new Date(log.timestamp)
                  const now = new Date()
                  const diffTime = Math.abs(now - date)
                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

                  if (date.toDateString() === now.toDateString()) {
                    timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  } else if (diffDays === 1) {
                    timeStr = 'Yesterday'
                  } else if (diffDays > 1) {
                    timeStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
                  }
                } catch {
                  timeStr = 'Recent'
                }
              }

              return {
                user: name,
                action: log.action || 'ACTION',
                description: log.description || `${log.action} action`,
                time: timeStr,
                initials: initials
              }
            })
            setActivities(formattedLogs)
          }
        }
      } catch (err) {
        console.error('Error fetching activity logs, using fallback:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const actionBadge = (action) => {
    const map = {
      CREATE:   { label: 'CREATE',  cls: 'bg-emerald-100 text-emerald-700' },
      UPDATE:   { label: 'UPDATE',  cls: 'bg-blue-100 text-blue-700' },
      DELETE:   { label: 'DELETE',  cls: 'bg-red-100 text-red-600' },
      GENERATE: { label: 'EXPORT',  cls: 'bg-purple-100 text-purple-700' },
      LOGIN:    { label: 'LOGIN',   cls: 'bg-amber-100 text-amber-700' },
      LOGOUT:   { label: 'LOGOUT',  cls: 'bg-slate-100 text-slate-600' },
    }
    const b = map[action] || { label: action, cls: 'bg-slate-100 text-slate-500' }
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider ${b.cls}`}>
        {b.label}
      </span>
    )
  }

  const avatarColor = (action) => {
    const map = {
      CREATE:   'bg-emerald-100 text-emerald-700',
      UPDATE:   'bg-blue-100 text-blue-700',
      DELETE:   'bg-red-100 text-red-600',
      GENERATE: 'bg-purple-100 text-purple-700',
      LOGIN:    'bg-amber-100 text-amber-700',
      LOGOUT:   'bg-slate-100 text-slate-600',
    }
    return map[action] || 'bg-emerald-100 text-emerald-700'
  }

  const recentActivities = activities.slice(0, RECENT_ACTIVITY_LIMIT)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 p-8 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-100 rounded-3xl h-[480px]"></div>
          <div className="bg-slate-100 rounded-3xl h-[480px]"></div>
        </div>
        <div className="bg-slate-100 rounded-2xl h-64"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8">
      <h2 className="text-3xl font-bold mb-6" style={{ color: 'black' }}>Welcome back, Admin!</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[480px] flex flex-col">
          <h3 className="font-bold text-slate-800 mb-6">Monthly Documents Created ({chartData.currentYear})</h3>
          <div className="flex-1 w-full min-h-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.monthly} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '13px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
                <Line type="monotone" dataKey="NOA & NTP" stroke={colors.noa} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="RESO Direct Acquisition" stroke={colors.direct} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="RESO SVP" stroke={colors.svp} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="RESO LOV" stroke={colors.lov} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="RESO Emergency Split" stroke={colors.split} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Yearly Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[480px] flex flex-col">
          <h3 className="font-bold text-slate-800 mb-6">Yearly Documents Created</h3>
          <div className="flex-1 w-full min-h-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.yearly} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '13px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
                <Line type="monotone" dataKey="NOA & NTP" stroke={colors.noa} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="RESO Direct Acquisition" stroke={colors.direct} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="RESO SVP" stroke={colors.svp} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="RESO LOV" stroke={colors.lov} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="RESO Emergency Split" stroke={colors.split} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Recent Activities</h3>
          <span className="text-xs text-slate-400 font-medium">5 most recent</span>
        </div>
        <div className="divide-y divide-slate-100">
          {recentActivities.map((activity, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${avatarColor(activity.action)}`}>
                  {activity.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-slate-800">{activity.user}</p>
                    {actionBadge(activity.action)}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-md">{activity.description}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-400 shrink-0 ml-4">{activity.time}</span>
            </div>
          ))}
          {recentActivities.length === 0 && (
            <div className="px-6 py-10 text-center text-slate-400 text-sm">No recent activities found.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
