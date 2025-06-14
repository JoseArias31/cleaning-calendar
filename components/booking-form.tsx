"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Share2 } from "lucide-react"

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

  const handleSave = () => {
    if (description.trim() && clientName.trim() && address.trim()) {
      onSave({
        date: selectedSlot.date,
        timeSlot: selectedSlot.timeSlot,
        description: description.trim(),
        clientName: clientName.trim(),
        address: address.trim(),
        recurrence,
      })
    }
  }

  const handleDelete = () => {
    onDelete(selectedSlot.date, selectedSlot.timeSlot)
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
