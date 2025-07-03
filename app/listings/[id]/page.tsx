'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { 
  StarIcon, 
  MapPinIcon, 
  WifiIcon, 
  CarIcon,
  TvIcon,
  HeartIcon,
  ShareIcon,
  CalendarIcon,
  UsersIcon
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import BookingCard from '@/components/BookingCard'
import ReviewsList from '@/components/ReviewsList'
import ImageGallery from '@/components/ImageGallery'
import toast from 'react-hot-toast'

interface Listing {
  _id: string
  title: string
  description: string
  price: number
  location: {
    address: string
    city: string
    country: string
  }
  images: string[]
  amenities: string[]
  propertyType: string
  bedrooms: number
  bathrooms: number
  maxGuests: number
  rating: number
  reviews: Array<{
    _id: string
    user: {
      name: string
      avatar: string
    }
    rating: number
    comment: string
    createdAt: string
  }>
  host: {
    _id: string
    name: string
    avatar: string
    bio: string
    createdAt: string
  }
}

export default function ListingDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    if (params?.id) {
      fetchListing(params.id as string)
    }
  }, [params?.id])

  const fetchListing = async (id: string) => {
    try {
      const response = await axios.get(`/listings/${id}`)
      setListing(response.data)
    } catch (error) {
      console.error('Error fetching listing:', error)
      toast.error('Failed to load listing')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: listing?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited)
    toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-96 rounded-xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-300 h-8 rounded w-3/4"></div>
                <div className="bg-gray-300 h-32 rounded"></div>
              </div>
              <div className="bg-gray-300 h-96 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h1>
          <p className="text-gray-600">The listing you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShareIcon className="h-4 w-4" />
                <span>Share</span>
              </button>
              <button
                onClick={toggleFavorite}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isFavorited 
                    ? 'bg-red-50 text-red-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <HeartIcon className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                <span>Save</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <StarIcon className="h-4 w-4 text-yellow-400 fill-current mr-1" />
              <span>{listing.rating.toFixed(1)}</span>
              <span className="mx-1">•</span>
              <span>{listing.reviews.length} reviews</span>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span>{listing.location.city}, {listing.location.country}</span>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <ImageGallery images={listing.images} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host Info */}
            <div className="border-b pb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {listing.propertyType} hosted by {listing.host.name}
                  </h2>
                  <p className="text-gray-600">
                    {listing.maxGuests} guests • {listing.bedrooms} bedrooms • {listing.bathrooms} bathrooms
                  </p>
                </div>
                <img
                  src={listing.host.avatar 
                    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${listing.host.avatar}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.host.name)}&background=ff385c&color=fff`
                  }
                  alt={listing.host.name}
                  className="w-12 h-12 rounded-full"
                />
              </div>
              {listing.host.bio && (
                <p className="text-gray-700">{listing.host.bio}</p>
              )}
            </div>

            {/* Description */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">About this place</h3>
              <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Amenities */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 gap-4">
                {listing.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <WifiIcon className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700 capitalize">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <ReviewsList reviews={listing.reviews} />
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingCard listing={listing} />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="mt-12 border-t pt-8">
          <h3 className="text-lg font-semibold mb-4">Where you'll be</h3>
          <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Map integration would go here</p>
          </div>
          <p className="mt-4 text-gray-700">{listing.location.address}</p>
        </div>
      </div>
    </div>
  )
}