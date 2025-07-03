'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon, MapPinIcon, CalendarIcon, UsersIcon } from 'lucide-react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

export default function SearchBar() {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [guests, setGuests] = useState(1)

  const handleSearch = () => {
    const searchParams = new URLSearchParams()
    if (location) searchParams.set('location', location)
    if (checkIn) searchParams.set('checkIn', checkIn.toISOString())
    if (checkOut) searchParams.set('checkOut', checkOut.toISOString())
    if (guests > 1) searchParams.set('guests', guests.toString())

    router.push(`/listings?${searchParams.toString()}`)
  }

  return (
    <div className="bg-white rounded-full shadow-lg p-2 flex flex-col md:flex-row gap-2">
      {/* Location */}
      <div className="flex-1 relative">
        <div className="flex items-center px-4 py-3">
          <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Where
            </label>
            <input
              type="text"
              placeholder="Search destinations"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-sm text-gray-900 placeholder-gray-500 border-none outline-none"
            />
          </div>
        </div>
      </div>

      <div className="hidden md:block w-px bg-gray-300"></div>

      {/* Check-in */}
      <div className="flex-1 relative">
        <div className="flex items-center px-4 py-3">
          <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Check in
            </label>
            <DatePicker
              selected={checkIn}
              onChange={(date) => setCheckIn(date)}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={new Date()}
              placeholderText="Add dates"
              className="w-full text-sm text-gray-900 placeholder-gray-500 border-none outline-none"
            />
          </div>
        </div>
      </div>

      <div className="hidden md:block w-px bg-gray-300"></div>

      {/* Check-out */}
      <div className="flex-1 relative">
        <div className="flex items-center px-4 py-3">
          <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Check out
            </label>
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              selectsEnd
              startDate={checkIn}
              endDate={checkOut}
              minDate={checkIn || new Date()}
              placeholderText="Add dates"
              className="w-full text-sm text-gray-900 placeholder-gray-500 border-none outline-none"
            />
          </div>
        </div>
      </div>

      <div className="hidden md:block w-px bg-gray-300"></div>

      {/* Guests */}
      <div className="flex-1 relative">
        <div className="flex items-center px-4 py-3">
          <UsersIcon className="h-5 w-5 text-gray-400 mr-3" />
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full text-sm text-gray-900 border-none outline-none"
            >
              {[...Array(8)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} guest{i + 1 !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="bg-airbnb-red text-white p-4 rounded-full hover:bg-red-600 transition-colors"
      >
        <SearchIcon className="h-5 w-5" />
      </button>
    </div>
  )
}