'use client'

import { useState, useEffect } from 'react'
import { XIcon } from 'lucide-react'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    city: string
    propertyType: string
    minPrice: string
    maxPrice: string
    guests: string
  }
  onApplyFilters: (filters: any) => void
}

export default function FilterModal({ isOpen, onClose, filters, onApplyFilters }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleApply = () => {
    onApplyFilters(localFilters)
    onClose()
  }

  const handleClear = () => {
    const clearFilters = {
      city: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      guests: ''
    }
    setLocalFilters(clearFilters)
    onApplyFilters(clearFilters)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={localFilters.city}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter city name"
                  className="input-field"
                />
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={localFilters.propertyType}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, propertyType: e.target.value }))}
                  className="input-field"
                >
                  <option value="">Any type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="villa">Villa</option>
                  <option value="cabin">Cabin</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (per night)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      value={localFilters.minPrice}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                      placeholder="Min price"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      value={localFilters.maxPrice}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                      placeholder="Max price"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Guests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guests
                </label>
                <select
                  value={localFilters.guests}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, guests: e.target.value }))}
                  className="input-field"
                >
                  <option value="">Any number</option>
                  {[...Array(8)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} guest{i + 1 !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleApply}
              className="btn-primary w-full sm:w-auto sm:ml-3"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}