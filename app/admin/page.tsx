"use client"

import { useState, useEffect } from "react"
import { CalendarGrid } from "@/components/calendar-grid"
import { BookingForm } from "@/components/booking-form"
import { MonthNavigation } from "@/components/month-navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"  

export interface Booking {
  id: string
  date: string
  timeSlot: "morning" | "afternoon"
  description: string
  clientName: string
  address: string
  recurrence?: "once" | "weekly" | "biweekly" | "every3weeks" | "monthly"
}

export default function AdminPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedSlot, setSelectedSlot] = useState<{
    date: string
    timeSlot: "morning" | "afternoon"
  } | null>(null)

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

      setBookings(transformedBookings)
    } catch (error) {
      console.error("Error in fetchBookings:", error)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [currentDate])

  const handleSlotClick = (date: string, timeSlot: "morning" | "afternoon") => {
    setSelectedSlot({ date, timeSlot })
  }

  const handleSaveBooking = async () => {
    await fetchBookings()
    setSelectedSlot(null)
  }

  const handleDeleteBooking = async (date: string, timeSlot: "morning" | "afternoon") => {
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("date", date)
        .eq("time_slot", timeSlot)

      if (error) {
        console.error("Error deleting booking:", error)
        return
      }

      await fetchBookings()
      setSelectedSlot(null)
    } catch (error) {
      console.error("Error in handleDeleteBooking:", error)
    }
  }

  const getBooking = (date: string, timeSlot: "morning" | "afternoon") => {
    return bookings.find((b) => b.date === date && b.timeSlot === timeSlot)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Panel de Administración</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>

        <MonthNavigation currentDate={currentDate} onDateChange={setCurrentDate} isSpanish={true} />

        <CalendarGrid 
          currentDate={currentDate} 
          bookings={bookings} 
          onSlotClick={handleSlotClick} 
          isAdmin={true} 
        />

        {selectedSlot && (
          <BookingForm
            selectedSlot={selectedSlot}
            existingBooking={getBooking(selectedSlot.date, selectedSlot.timeSlot)}
            onSave={handleSaveBooking}
            onDelete={handleDeleteBooking}
            onCancel={() => setSelectedSlot(null)}
          />
        )}
      </div>
    </div>
  )
}
