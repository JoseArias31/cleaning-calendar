"use client"

import { Home } from "lucide-react"

interface Booking {
  id: string
  date: string
  timeSlot: "morning" | "afternoon"
  description: string
  clientName: string
  address: string
  recurrence?: "once" | "weekly" | "biweekly" | "every3weeks" | "monthly"
}

interface CalendarGridProps {
  currentDate: Date
  bookings: Booking[]
  onSlotClick: (date: string, timeSlot: "morning" | "afternoon") => void
  isAdmin: boolean
}

export function CalendarGrid({ currentDate, bookings, onSlotClick, isAdmin }: CalendarGridProps) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Create array of days
  const days = []

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const isBooked = (date: string, timeSlot: "morning" | "afternoon") => {
    return bookings.some((b) => b.date === date && b.timeSlot === timeSlot)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
  }

  const weekDaysEnglish = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const weekDaysSpanish = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  const weekDays = isAdmin ? weekDaysSpanish : weekDaysEnglish

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Week day headers */}
      <div className="grid grid-cols-7 bg-gray-50">
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => (
          <div key={index} className="border-b border-r border-gray-100 min-h-[80px] last:border-r-0">
            {day && (
              <div className="p-1">
                <div className={`text-xs font-medium mb-1 ${isToday(day) ? "text-blue-600" : "text-gray-900"}`}>
                  {day}
                </div>

                <div className="space-y-1">
                  {/* Morning slot */}
                  <button
                    onClick={() => isAdmin && onSlotClick(formatDate(day), "morning")}
                    className={`w-full flex items-center justify-center p-1 rounded text-xs ${
                      isAdmin ? "hover:bg-gray-50" : ""
                    }`}
                    disabled={!isAdmin}
                  >
                    <Home
                      className={`w-3 h-3 ${
                        isBooked(formatDate(day), "morning") ? "text-green-500 fill-green-500" : "text-gray-300"
                      }`}
                    />
                    <span className="ml-1 text-gray-500">{isAdmin ? "AM" : "AM"}</span>
                  </button>

                  {/* Afternoon slot */}
                  <button
                    onClick={() => isAdmin && onSlotClick(formatDate(day), "afternoon")}
                    className={`w-full flex items-center justify-center p-1 rounded text-xs ${
                      isAdmin ? "hover:bg-gray-50" : ""
                    }`}
                    disabled={!isAdmin}
                  >
                    <Home
                      className={`w-3 h-3 ${
                        isBooked(formatDate(day), "afternoon") ? "text-green-500 fill-green-500" : "text-gray-300"
                      }`}
                    />
                    <span className="ml-1 text-gray-500">{isAdmin ? "PM" : "PM"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
