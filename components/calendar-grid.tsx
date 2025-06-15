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
          <div key={day} className="p-2 text-center text-xs font-bold text-black">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => (
          <div key={index} className="border-b border-r border-gray-100 min-h-[80px] last:border-r-0">
            {day && (
              <div className="p-1 border-black border-2">
                <div className={`text-xs font-bold mb-1 ${isToday(day) ? "text-blue-600" : "text-gray-900"}`}>
                  {day}
                </div>

                <div className="space-y-1">
                 {/* Morning slot */}
<button
  onClick={() => isAdmin && onSlotClick(formatDate(day), "morning")}
  className={`w-full flex flex-col items-center justify-center p-1 rounded text-xs ${
    isAdmin ? "hover:bg-gray-50" : ""
  }`}
  disabled={!isAdmin}
>
  <Home
    className={`w-3 h-3 ${
      isBooked(formatDate(day), "morning") ? "text-green-500 fill-green-500" : "text-gray-300"
    }`}
  />
  <span className="text-black">AM</span>

  {/** Mostrar cliente si hay booking */}
  {bookings
    .filter((b) => b.date === formatDate(day) && b.timeSlot === "morning")
    .map((b) => (
      <span key={b.id} className="text-[10px] text-gray-600 truncate max-w-[70px]">
        {b.clientName || b.description}
      </span>
    ))}
</button>


                 {/* Afternoon slot */}
<button
  onClick={() => isAdmin && onSlotClick(formatDate(day), "afternoon")}
  className={`w-full flex flex-col items-center justify-center p-1 rounded text-xs ${
    isAdmin ? "hover:bg-gray-50" : ""
  }`}
  disabled={!isAdmin}
>
  <Home
    className={`w-3 h-3 ${
      isBooked(formatDate(day), "afternoon") ? "text-green-500 fill-green-500" : "text-gray-300"
    }`}
  />
  <span className="text-black">PM</span>

  {/** Mostrar cliente si hay booking */}
  {bookings
    .filter((b) => b.date === formatDate(day) && b.timeSlot === "afternoon")
    .map((b) => (
      <span key={b.id} className="text-[10px] text-gray-600 truncate max-w-[70px]">
        {b.clientName || b.description}
      </span>
    ))}
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
