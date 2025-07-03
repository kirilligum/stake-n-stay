'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import { FilterIcon, GridIcon, ListIcon } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import ListingCard from '@/components/ListingCard'
import FilterModal from '@/components/FilterModal'

interface Listing {
  _id: string
  title: string
  description: string
  price: number
  location: {
    city: string
    country: string
  }
  images: string[]
  propertyType: string
  bedrooms: number
  bathrooms: number
  maxGuests: number
  rating: number
  host: {
    name: string
    avatar: string
  }
}

export default function ListingsPage() {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    city: searchParams?.get('location') || '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    guests: searchParams?.get('guests') || ''
  })

  useEffect(() => {
    fetchListings()
  }, [searchParams, currentPage, filters])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      // Add search params
      if (filters.city) params.set('city', filters.city)
      if (filters.propertyType) params.set('propertyType', filters.propertyType)
      if (filters.minPrice) params.set('minPrice', filters.minPrice)
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
      if (filters.guests) params.set('guests', filters.guests)
      params.set('page', currentPage.toString())
      params.set('limit', '12')

      const response = await axios.get(`/listings?${params.toString()}`)
      setListings(response.data.listings)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="mb-4">
            <SearchBar />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FilterIcon className="h-4 w-4" />
                <span>Filters</span>
              </button>
              
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-airbnb-red text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <GridIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-airbnb-red text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ListIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              {listings.length} properties found
            </div>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {[...Array(12)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 h-64 rounded-xl mb-4"></div>
                <div className="space-y-2">
                  <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-300 h-4 rounded w-1/2"></div>
                  <div className="bg-gray-300 h-4 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <GridIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters
            </p>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {listings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-4 py-2 border rounded-lg ${
                        currentPage === index + 1
                          ? 'bg-airbnb-red text-white border-airbnb-red'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApplyFilters={handleFilterChange}
      />
    </div>
  )
}