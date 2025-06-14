"use client"

import { useState } from "react"
import { CalendarGrid } from "@/components/calendar-grid"
import { BookingForm } from "@/components/booking-form"
import { MonthNavigation } from "@/components/month-navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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

  const handleSlotClick = (date: string, timeSlot: "morning" | "afternoon") => {
    setSelectedSlot({ date, timeSlot })
  }

  const generateRecurringBookings = (booking: Omit<Booking, "id">) => {
    const bookingsToCreate: Omit<Booking, "id">[] = []
    const startDate = new Date(booking.date)

    if (booking.recurrence === "once") {
      return [booking]
    }

    // Generate bookings for the next 6 months
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 6)

    let currentDate = new Date(startDate)
    let weekIncrement = 1

    switch (booking.recurrence) {
      case "weekly":
        weekIncrement = 1
        break
      case "biweekly":
        weekIncrement = 2
        break
      case "every3weeks":
        weekIncrement = 3
        break
      case "monthly":
        // Handle monthly separately
        while (currentDate <= endDate) {
          bookingsToCreate.push({
            ...booking,
            date: currentDate.toISOString().split("T")[0],
          })
          currentDate = new Date(currentDate)
          currentDate.setMonth(currentDate.getMonth() + 1)
        }
        return bookingsToCreate
    }

    // Handle weekly, biweekly, and every 3 weeks
    while (currentDate <= endDate) {
      bookingsToCreate.push({
        ...booking,
        date: currentDate.toISOString().split("T")[0],
      })
      currentDate = new Date(currentDate)
      currentDate.setDate(currentDate.getDate() + weekIncrement * 7)
    }

    return bookingsToCreate
  }

  const handleSaveBooking = (booking: Omit<Booking, "id">) => {
    const existingBookingIndex = bookings.findIndex((b) => b.date === booking.date && b.timeSlot === booking.timeSlot)

    if (existingBookingIndex >= 0) {
      // Update existing booking
      const updatedBookings = [...bookings]
      updatedBookings[existingBookingIndex] = {
        ...booking,
        id: bookings[existingBookingIndex].id,
      }
      setBookings(updatedBookings)
    } else {
      // Generate recurring bookings or single booking
      const bookingsToCreate = generateRecurringBookings(booking)
      const newBookings = bookingsToCreate.map((b, index) => ({
        ...b,
        id: `${Date.now()}-${index}`,
      }))

      // Filter out bookings that would conflict with existing ones
      const nonConflictingBookings = newBookings.filter(
        (newBooking) =>
          !bookings.some(
            (existingBooking) =>
              existingBooking.date === newBooking.date && existingBooking.timeSlot === newBooking.timeSlot,
          ),
      )

      setBookings([...bookings, ...nonConflictingBookings])
    }
    setSelectedSlot(null)
  }

  const handleDeleteBooking = (date: string, timeSlot: "morning" | "afternoon") => {
    setBookings(bookings.filter((b) => !(b.date === date && b.timeSlot === timeSlot)))
    setSelectedSlot(null)
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

        <CalendarGrid currentDate={currentDate} bookings={bookings} onSlotClick={handleSlotClick} isAdmin={true} />

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
