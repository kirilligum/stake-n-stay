'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import { CalendarIcon, UsersIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import "react-datepicker/dist/react-datepicker.css"

interface Listing {
  _id: string
  title: string
  price: number
  maxGuests: number
  host: {
    _id: string
  }
}

interface BookingCardProps {
  listing: Listing
}

export default function BookingCard({ listing }: BookingCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [guests, setGuests] = useState(1)
  const [loading, setLoading] = useState(false)

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    const nights = calculateNights()
    const subtotal = nights * listing.price
    const serviceFee = subtotal * 0.1 // 10% service fee
    const taxes = subtotal * 0.08 // 8% taxes
    return {
      nights,
      subtotal,
      serviceFee,
      taxes,
      total: subtotal + serviceFee + taxes
    }
  }

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please login to make a booking')
      router.push('/login')
      return
    }

    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates')
      return
    }

    if (checkOut <= checkIn) {
      toast.error('Check-out date must be after check-in date')
      return
    }

    try {
      setLoading(true)
      const { total } = calculateTotal()
      
      const bookingData = {
        listingId: listing._id,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests,
        totalPrice: total
      }

      const response = await axios.post('/bookings', bookingData)
      toast.success('Booking request sent successfully!')
      router.push(`/bookings/${response.data._id}`)
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create booking'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const pricing = calculateTotal()

  return (
    <div className="bg-white rounded-xl shadow-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-2xl font-bold">${listing.price}</span>
          <span className="text-gray-600 ml-1">night</span>
        </div>
      </div>

      {/* Date Selection */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-2">
          <div className="border rounded-lg p-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              CHECK-IN
            </label>
            <DatePicker
              selected={checkIn}
              onChange={(date) => setCheckIn(date)}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={new Date()}
              placeholderText="Add date"
              className="w-full text-sm border-none outline-none"
            />
          </div>
          <div className="border rounded-lg p-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              CHECKOUT
            </label>
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              selectsEnd
              startDate={checkIn}
              endDate={checkOut}
              minDate={checkIn || new Date()}
              placeholderText="Add date"
              className="w-full text-sm border-none outline-none"
            />
          </div>
        </div>

        <div className="border rounded-lg p-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            GUESTS
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full text-sm border-none outline-none"
          >
            {[...Array(listing.maxGuests)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} guest{i + 1 !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Booking Button */}
      <button
        onClick={handleBooking}
        disabled={loading || !checkIn || !checkOut}
        className="btn-primary w-full mb-6"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Booking...
          </div>
        ) : user?.id === listing.host._id ? (
          'You own this listing'
        ) : (
          'Reserve'
        )}
      </button>

      {/* Price Breakdown */}
      {checkIn && checkOut && pricing.nights > 0 && (
        <div className="space-y-3 pt-6 border-t">
          <div className="flex justify-between">
            <span className="text-gray-700">
              ${listing.price} x {pricing.nights} nights
            </span>
            <span>${pricing.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Service fee</span>
            <span>${pricing.serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Taxes</span>
            <span>${pricing.taxes.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-3 border-t">
            <span>Total</span>
            <span>${pricing.total.toFixed(2)}</span>
          </div>
        </div>
      )}

      <p className="text-center text-sm text-gray-600 mt-4">
        You won't be charged yet
      </p>
    </div>
  )
}