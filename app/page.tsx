import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Cleaning Services</h1>
          <p className="text-gray-600">Schedule and track your cleaning appointments</p>
        </div>

        <div className="space-y-4">
          <Link href="/admin" className="block">
            <Button className="w-full h-12 text-lg">Admin Dashboard</Button>
          </Link>

          <Link href="/public" className="block">
            <Button variant="outline" className="w-full h-12 text-lg">
              View Schedule
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
