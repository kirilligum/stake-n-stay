'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { SearchIcon, MapPinIcon, StarIcon } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import ListingCard from '@/components/ListingCard'

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

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      const response = await axios.get('/listings?limit=8')
      setListings(response.data.listings)
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-airbnb-red to-pink-600 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find your next adventure
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Discover amazing places to stay around the world
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-airbnb-dark mb-4">
              Featured Places
            </h2>
            <p className="text-xl text-airbnb-gray">
              Handpicked places recommended by our hosts
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/listings"
              className="btn-primary inline-block"
            >
              View All Listings
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-airbnb-dark mb-4">
              Why choose us?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-airbnb-red rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-airbnb-gray">
                Simple and fast booking process with instant confirmation
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-airbnb-red rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Prime Locations</h3>
              <p className="text-airbnb-gray">
                Carefully curated properties in the best neighborhoods
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-airbnb-red rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
              <p className="text-airbnb-gray">
                All properties are verified and reviewed by our community
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}