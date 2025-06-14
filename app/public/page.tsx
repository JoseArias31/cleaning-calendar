"use client"

import { useState } from "react"
import { CalendarGrid } from "@/components/calendar-grid"
import { MonthNavigation } from "@/components/month-navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

// Sample data for demonstration
const sampleBookings = [
  {
    id: "1",
    date: "2024-12-15",
    timeSlot: "morning" as const,
    description: "Main Street House",
    clientName: "John Smith",
    address: "123 Main Street, Springfield",
    recurrence: "weekly" as const,
  },
  {
    id: "2",
    date: "2024-12-15",
    timeSlot: "afternoon" as const,
    description: "Oak Avenue Apartment",
    clientName: "Sarah Johnson",
    address: "456 Oak Avenue, Apt 2B, Springfield",
    recurrence: "biweekly" as const,
  },
  {
    id: "3",
    date: "2024-12-18",
    timeSlot: "morning" as const,
    description: "Downtown Office",
    clientName: "ABC Company",
    address: "789 Business Blvd, Downtown",
    recurrence: "monthly" as const,
  },
  {
    id: "4",
    date: "2024-12-22",
    timeSlot: "afternoon" as const,
    description: "Suburban Home",
    clientName: "Mike Wilson",
    address: "321 Elm Street, Suburbia",
    recurrence: "once" as const,
  },
]

export default function PublicPage() {
  const [currentDate, setCurrentDate] = useState(new Date())

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Schedule View</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>

        <MonthNavigation currentDate={currentDate} onDateChange={setCurrentDate} />

        <CalendarGrid
          currentDate={currentDate}
          bookings={sampleBookings}
          onSlotClick={() => {}} // No-op for public view
          isAdmin={false}
        />

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3">Legend</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-600">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-gray-600">Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
