import React from 'react'
import { Bell, DollarSign, Plus, ArrowUpRight, MoreHorizontal, Home, CreditCard, Activity, User } from 'lucide-react'

const FinanceHome = () => {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-[393px] min-h-screen bg-[#0D0D0D] relative">
        {/* Main Content Container */}
        <div className="px-5 pt-6 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            {/* Notification Bell */}
            <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-transparent">
              <Bell size={20} className="text-white/80" />
            </button>

            {/* Assistant Button */}
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1C1C1E] border border-white/10">
              <div className="w-5 h-5 rounded-full bg-[#008765] flex items-center justify-center">
                <DollarSign size={12} className="text-white" />
              </div>
              <span className="text-sm text-white font-medium">Assistant.</span>
            </button>
          </div>

          {/* Main Balance Card */}
          <div className="relative mb-6 h-[220px] rounded-[32px] overflow-hidden">
            {/* Gradient Background */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #006045 0%, rgba(0, 102, 69, 0.3) 50%, #000000 100%)',
              }}
            />
            
            {/* Content */}
            <div className="relative h-full p-6 flex flex-col justify-between">
              <div>
                <p className="text-sm text-white/60 mb-2">Total balance</p>
                <p className="text-[40px] font-semibold text-white leading-tight">$3,456.88</p>
              </div>
              
              {/* Badge */}
              <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 w-fit">
                <p className="text-sm text-white/90">Saved this month: $420</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {/* Top up */}
            <button className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-[#1C1C1E] border border-white/5 flex items-center justify-center">
                <Plus size={24} className="text-white" />
              </div>
              <span className="text-xs text-white/70">Top up</span>
            </button>

            {/* Send */}
            <button className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-[#1C1C1E] border border-white/5 flex items-center justify-center">
                <ArrowUpRight size={24} className="text-white" />
              </div>
              <span className="text-xs text-white/70">Send</span>
            </button>

            {/* Other */}
            <button className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-[#1C1C1E] border border-white/5 flex items-center justify-center">
                <MoreHorizontal size={24} className="text-white" />
              </div>
              <span className="text-xs text-white/70">Other</span>
            </button>
          </div>

          {/* Transactions List */}
          <div className="bg-[#111111] rounded-t-[32px] pt-6 px-5 pb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Transaction</h2>
              <button className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <span className="text-xs text-[#8E8E93]">Show all</span>
              </button>
            </div>

            {/* Transactions */}
            <div className="space-y-4">
              {/* Date Header */}
              <p className="text-sm text-[#8E8E93] font-medium mb-3">July 10, 2023</p>

              {/* Transaction 1 - Amazon */}
              <div className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">a.</span>
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-white">Amazon</p>
                  <p className="text-xs text-[#8E8E93]">11:45 AM</p>
                </div>
                <p className="text-base font-semibold text-white">-$75.99</p>
              </div>

              {/* Transaction 2 - PayPal */}
              <div className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-400">P</span>
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-white">PayPal</p>
                  <p className="text-xs text-[#8E8E93]">2:23 AM</p>
                </div>
                <p className="text-base font-semibold text-green-400">+$150.00</p>
              </div>

              {/* Date Header */}
              <p className="text-sm text-[#8E8E93] font-medium mb-3 mt-6">July 9, 2023</p>

              {/* Transaction 3 - McDonald's */}
              <div className="flex items-center gap-3 py-2">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-yellow-400">M</span>
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-white">McDonald's</p>
                  <p className="text-xs text-[#8E8E93]">1:12 PM</p>
                </div>
                <p className="text-base font-semibold text-white">$8.75</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[393px] bg-black/80 backdrop-blur-xl border-t border-white/5">
          <div className="flex items-center justify-around px-4 py-3">
            {/* Home - Active */}
            <button className="flex flex-col items-center gap-1">
              <Home size={24} className="text-white" />
              <span className="text-[10px] text-white font-medium">Home</span>
            </button>

            {/* Card */}
            <button className="flex flex-col items-center gap-1">
              <CreditCard size={24} className="text-[#8E8E93]" />
            </button>

            {/* Activity */}
            <button className="flex flex-col items-center gap-1">
              <Activity size={24} className="text-[#8E8E93]" />
            </button>

            {/* Profile */}
            <button className="flex flex-col items-center gap-1">
              <User size={24} className="text-[#8E8E93]" />
            </button>
          </div>

          {/* iOS Home Indicator */}
          <div className="w-full flex justify-center pb-2">
            <div className="w-36 h-1 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinanceHome

