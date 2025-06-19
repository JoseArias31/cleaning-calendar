"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Share2 } from "lucide-react"
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

interface BookingFormProps {
  selectedSlot: {
    date: string
    timeSlot: "morning" | "afternoon"
  }
  existingBooking?: Booking
  onSave: (booking: Omit<Booking, "id">) => void
  onDelete: (date: string, timeSlot: "morning" | "afternoon") => void
  onCancel: () => void
}

export function BookingForm({ selectedSlot, existingBooking, onSave, onDelete, onCancel }: BookingFormProps) {
  const [description, setDescription] = useState("")
  const [clientName, setClientName] = useState("")
  const [address, setAddress] = useState("")
  const [recurrence, setRecurrence] = useState<"once" | "weekly" | "biweekly" | "every3weeks" | "monthly">("once")
  const [shareSuccess, setShareSuccess] = useState(false)

  useEffect(() => {
    setDescription(existingBooking?.description || "")
    setClientName(existingBooking?.clientName || "")
    setAddress(existingBooking?.address || "")
    setRecurrence(existingBooking?.recurrence || "once")
  }, [existingBooking])

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
      console.log('Monthly bookings:', bookingsToCreate)
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
  console.log('Recurring bookings:', bookingsToCreate)
  return bookingsToCreate
}

const saveBookingToSupabase = async (booking: Omit<Booking, "id">) => {
  try {
    // Generate all bookings including recurring ones
    const bookingsToCreate = generateRecurringBookings(booking)

    // Insert all bookings
    const { data, error } = await supabase
      .from("bookings")
      .insert(
        bookingsToCreate.map(booking => ({
          date: booking.date,
          time_slot: booking.timeSlot,
          description: booking.description,
          client_name: booking.clientName,
          address: booking.address,
          recurrence: booking.recurrence,
        }))
      )
      .select()

    if (error) {
      console.error("Error al guardar:", error.message, error.details, error.hint)
      return null
    }

    if (!data || data.length === 0) {
      console.error("No data returned after insert")
      return null
    }

    // Return the first booking as the main booking
    const savedBooking = {
      id: data[0].id,
      date: data[0].date,
      timeSlot: data[0].time_slot,
      description: data[0].description,
      clientName: data[0].client_name,
      address: data[0].address,
      recurrence: data[0].recurrence
    }

    return savedBooking
  } catch (error) {
    console.error("Error inesperado:", error)
    return null
  }
}

const deleteBookingFromSupabase = async (date: string, timeSlot: "morning" | "afternoon") => {
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("date", date)
    .eq("time_slot", timeSlot)
  if (error) {
    console.error("Error al eliminar:", error)
    return false
  }
  return true
}

const updateBookingInSupabase = async (booking: Booking) => {
  const { error } = await supabase
    .from("bookings")
    .update({
      date: booking.date,
      time_slot: booking.timeSlot,
      description: booking.description,
      client_name: booking.clientName,
      address: booking.address,
      recurrence: booking.recurrence,
    })
    .eq("id", booking.id)

  if (error) {
    console.error("Error al actualizar:", error)
    return false
  }
  return true
}

  const handleSave = async () => {
  if (description.trim() && clientName.trim() && address.trim()) {
    const booking: Omit<Booking, "id"> = {
      date: selectedSlot.date,
      timeSlot: selectedSlot.timeSlot,
      description: description.trim(),
      clientName: clientName.trim(),
      address: address.trim(),
      recurrence,
    }

    let savedBooking
    if (existingBooking) {
      savedBooking = await updateBookingInSupabase({ ...booking, id: existingBooking.id })
    } else {
      savedBooking = await saveBookingToSupabase(booking)
    }

    if (savedBooking) {
      onSave(booking)
    } else {
      console.error("Failed to save booking")
    }
  }
}

  const handleDelete = async () => {
  const confirmed = confirm("¿Estás seguro de que quieres eliminar esta reserva?")
  if (!confirmed) return

  const success = await deleteBookingFromSupabase(selectedSlot.date, selectedSlot.timeSlot)
  if (success) {
    onDelete(selectedSlot.date, selectedSlot.timeSlot)
  }
}

  const handleShareAddress = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Dirección del Servicio de Limpieza",
          text: `Dirección para ${clientName}: ${address}`,
        })
      } else {
        // Fallback to copying
        await navigator.clipboard.writeText(address)
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 2000)
      }
    } catch (err) {
      console.error("Failed to share address:", err)
      // Fallback to copying if share fails
      try {
        await navigator.clipboard.writeText(address)
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 2000)
      } catch (copyErr) {
        console.error("Failed to copy address:", copyErr)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const recurrenceOptions = [
    { value: "once", label: "Servicio único" },
    { value: "weekly", label: "Semanal" },
    { value: "biweekly", label: "Quincenal (cada 2 semanas)" },
    { value: "every3weeks", label: "Cada 3 semanas" },
    { value: "monthly", label: "Mensual" },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-lg w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {existingBooking ? "Editar Reserva" : "Nueva Reserva"}
          </h3>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">{formatDate(selectedSlot.date)}</p>
          <p className="text-sm font-medium text-gray-900">
            Turno de {selectedSlot.timeSlot === "morning" ? "Mañana" : "Tarde"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción de la Casa</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ej. Casa de la Calle Principal, Apartamento 2B..."
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientName">Nombre del Cliente</Label>
          <Input
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="ej. Juan Pérez"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <div className="flex gap-2">
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ej. Calle Principal 123, Ciudad, Estado"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShareAddress}
              disabled={!address.trim()}
              className="px-3"
            >
              {shareSuccess ? (
                <span className="text-green-600 text-xs">¡Copiado!</span>
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Frecuencia del Servicio</Label>
          <div className="space-y-2">
            {recurrenceOptions.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="recurrence"
                  value={option.value}
                  checked={recurrence === option.value}
                  onChange={(e) => setRecurrence(e.target.value as typeof recurrence)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {recurrence !== "once" && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Nota:</strong> Esto creará citas recurrentes comenzando desde {formatDate(selectedSlot.date)}{" "}
              durante los próximos 6 meses.
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSave}
            disabled={!description.trim() || !clientName.trim() || !address.trim()}
            className="flex-1"
          >
            {recurrence === "once" ? "Guardar" : "Crear Recurrente"}
          </Button>

          {existingBooking && (
            <Button variant="destructive" onClick={handleDelete} className="flex-1">
              Eliminar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
