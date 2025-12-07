import { useState } from 'react'
import { 
  Bell, 
  Home, 
  CreditCard, 
  Plus, 
  BarChart2, 
  Settings,
  PieChart,
  Calendar,
  Music,
  Briefcase,
  Car
} from 'lucide-react'
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis } from 'recharts'

const FinanceDashboard = () => {
  // Weekly spending data (Sun-Sat)
  const weeklyData = [
    { day: 'Sun', amount: 45, isHighlight: false },
    { day: 'Mon', amount: 60, isHighlight: false },
    { day: 'Tue', amount: 80, isHighlight: false },
    { day: 'Wed', amount: 55, isHighlight: false },
    { day: 'Thu', amount: 70, isHighlight: false },
    { day: 'Fri', amount: 120, isHighlight: true }, // Highlighted
    { day: 'Sat', amount: 90, isHighlight: false },
  ]

  // Transaction data
  const transactions = [
    {
      id: 1,
      name: 'Spotify',
      amount: -12.99,
      icon: Music,
      iconBg: 'bg-red-500',
      textColor: 'text-white'
    },
    {
      id: 2,
      name: 'Freelance Project',
      amount: 1200.00,
      icon: Briefcase,
      iconBg: 'bg-purple-500',
      textColor: 'text-[#00FF94]' // Neon green for income
    },
    {
      id: 3,
      name: 'Uber Ride',
      amount: -24.50,
      icon: Car,
      iconBg: 'bg-blue-500',
      textColor: 'text-white'
    }
  ]

  return (
    <div className="min-h-screen bg-[#0F101F] flex items-center justify-center p-4">
      <div className="w-full max-w-[393px] bg-[#0F101F] min-h-screen flex flex-col">
        
        {/* Header Section */}
        <div className="px-6 pt-12 pb-6">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-gray-400 text-sm mb-1">Balance</p>
              <p className="text-white text-4xl font-bold">$12,450.80</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full bg-[#1C1C2E]/80 backdrop-blur-md border border-white/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </button>
              <div className="px-3 py-1.5 rounded-full bg-[#1C1C2E]/80 backdrop-blur-md border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-white text-sm">Assistant</span>
              </div>
            </div>
          </div>

          {/* Weekly Bar Chart Card */}
          <div className="bg-[#1C1C2E]/80 backdrop-blur-md rounded-[32px] p-6 mb-4 border border-white/10">
            <h3 className="text-white text-sm font-medium mb-4">Weekly Spending</h3>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {weeklyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.isHighlight ? '#8B5CF6' : 'rgba(255, 255, 255, 0.15)'}
                        style={entry.isHighlight ? {
                          filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))'
                        } : {}}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Two-Column Widgets */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Left Widget - Food */}
            <div className="bg-[#FF8A48] rounded-[32px] p-5 relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <PieChart className="w-6 h-6 text-white/80" />
              </div>
              <div className="relative z-10">
                <p className="text-white/90 text-sm font-medium mb-2">Food</p>
                <p className="text-white text-3xl font-bold">30%</p>
              </div>
            </div>

            {/* Right Widget - Netflix */}
            <div className="bg-[#FF4D4D] rounded-[32px] p-5 relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <Calendar className="w-6 h-6 text-white/80" />
              </div>
              <div className="relative z-10">
                <p className="text-white/90 text-sm font-medium mb-1">Netflix</p>
                <p className="text-white/80 text-xs">Upcoming Bill</p>
              </div>
            </div>
          </div>

          {/* Transactions Section */}
          <div className="bg-[#1C1C2E]/80 backdrop-blur-md rounded-[32px] p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-semibold">Transactions</h3>
              <button className="text-gray-400 text-sm hover:text-white transition-colors">
                See All
              </button>
            </div>

            <div className="space-y-4">
              {transactions.map((transaction) => {
                const IconComponent = transaction.icon
                const isIncome = transaction.amount > 0
                
                return (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${transaction.iconBg} rounded-2xl flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{transaction.name}</p>
                      </div>
                    </div>
                    <p className={`font-semibold text-lg ${transaction.textColor}`}>
                      {isIncome ? '+' : ''}${Math.abs(transaction.amount).toLocaleString('en-US', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center">
          <div className="w-full max-w-[393px] bg-[#0F101F]/90 backdrop-blur-xl border-t border-white/10">
            <div className="flex items-center justify-around py-4 px-4">
              <button className="flex items-center justify-center w-10 h-10">
                <Home className="w-6 h-6 text-white" />
              </button>
              <button className="flex items-center justify-center w-10 h-10">
                <CreditCard className="w-6 h-6 text-white" />
              </button>
              <button className="flex items-center justify-center w-10 h-10">
                <Plus className="w-6 h-6 text-white" />
              </button>
              <button className="flex items-center justify-center w-10 h-10">
                <BarChart2 className="w-6 h-6 text-white" />
              </button>
              <button className="flex items-center justify-center w-10 h-10">
                <Settings className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Spacer for bottom nav */}
        <div className="h-20"></div>
      </div>
    </div>
  )
}

export default FinanceDashboard

