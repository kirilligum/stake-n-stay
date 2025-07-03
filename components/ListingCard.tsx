'use client'

import Link from 'next/link'
import { StarIcon, MapPinIcon } from 'lucide-react'

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

interface ListingCardProps {
  listing: Listing
}

export default function ListingCard({ listing }: ListingCardProps) {
  const imageUrl = listing.images[0]?.startsWith('http') 
    ? listing.images[0] 
    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${listing.images[0]}`

  return (
    <Link href={`/listings/${listing._id}`} className="block group">
      <div className="card overflow-hidden">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={imageUrl || 'https://images.unsplash.com/photo-1586864387967-d02373281399?auto=format&fit=crop&w=800&q=80'}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-sm font-semibold">
            ${listing.price}/night
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-sm text-gray-600">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span>{listing.location.city}, {listing.location.country}</span>
            </div>
            {listing.rating > 0 && (
              <div className="flex items-center">
                <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium ml-1">
                  {listing.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {listing.title}
          </h3>

          <p className="text-sm text-gray-600 mb-2 capitalize">
            {listing.propertyType} • {listing.bedrooms} bed{listing.bedrooms !== 1 ? 's' : ''} • {listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={listing.host.avatar 
                  ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${listing.host.avatar}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.host.name)}&background=ff385c&color=fff`
                }
                alt={listing.host.name}
                className="w-6 h-6 rounded-full mr-2"
              />
              <span className="text-sm text-gray-600">by {listing.host.name}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}