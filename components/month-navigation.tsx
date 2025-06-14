"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MonthNavigationProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  isSpanish?: boolean
}

export function MonthNavigation({ currentDate, onDateChange, isSpanish = false }: MonthNavigationProps) {
  const monthNamesEnglish = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const monthNamesSpanish = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const monthNames = isSpanish ? monthNamesSpanish : monthNamesEnglish

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    onDateChange(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    onDateChange(newDate)
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  return (
    <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
      <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs text-gray-500 h-auto p-1">
          {isSpanish ? "Hoy" : "Today"}
        </Button>
      </div>

      <Button variant="ghost" size="sm" onClick={goToNextMonth}>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
