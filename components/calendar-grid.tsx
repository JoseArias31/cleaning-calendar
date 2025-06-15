"use client"

import { Home } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

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
  const [fetchedBookings, setFetchedBookings] = useState<Booking[]>([])

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

        const { data, error } = await supabase
          .from("bookings")
          .select("*")
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0])

        if (error) {
          console.error("Error fetching bookings:", error)
          return
        }

        const transformedBookings = data.map(booking => ({
          id: booking.id,
          date: booking.date,
          timeSlot: booking.time_slot,
          description: booking.description,
          clientName: booking.client_name,
          address: booking.address,
          recurrence: booking.recurrence
        }))

        setFetchedBookings(transformedBookings)
      } catch (error) {
        console.error("Error in fetchBookings:", error)
      }
    }

    fetchBookings()
  }, [currentDate])

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
    return fetchedBookings.some((b) => b.date === date && b.timeSlot === timeSlot)
  }

  const isFullyBooked = (date: string) => {
    return isBooked(date, "morning") && isBooked(date, "afternoon")
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
              <div className={`p-1 border-black border-2 ${isFullyBooked(formatDate(day)) ? 'bg-red-400' : ''}`}>
                <div className={`text-base font-bold mb-1 ${isToday(day) ? "text-blue-600" : "text-gray-900"}`}>
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
                      className={`w-5 h-5 ${
                        isBooked(formatDate(day), "morning") ? "text-green-500 fill-green-500" : "text-gray-300"
                      }`}
                    />
                    <span className="text-black">AM</span>

                    {/* {isAdmin && fetchedBookings
                      .filter((b) => b.date === formatDate(day) && b.timeSlot === "morning")
                      .map((b) => (
                        <span key={b.id} className="text-[10px] text-gray-600 truncate max-w-[70px]">
                          {b.clientName || b.description}
                        </span>
                      ))} */}
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
                      className={`w-5 h-5 ${
                        isBooked(formatDate(day), "afternoon") ? "text-green-500 fill-green-500" : "text-gray-300"
                      }`}
                    />
                    <span className="text-black">PM</span>

                    {/* {isAdmin && fetchedBookings
                      .filter((b) => b.date === formatDate(day) && b.timeSlot === "afternoon")
                      .map((b) => (
                        <span key={b.id} className="text-[10px] text-gray-600 truncate max-w-[70px]">
                          {b.clientName || b.description}
                        </span>
                      ))} */}
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
