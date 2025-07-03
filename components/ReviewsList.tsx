'use client'

import { StarIcon } from 'lucide-react'

interface Review {
  _id: string
  user: {
    name: string
    avatar: string
  }
  rating: number
  comment: string
  createdAt: string
}

interface ReviewsListProps {
  reviews: Review[]
}

export default function ReviewsList({ reviews }: ReviewsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  if (reviews.length === 0) {
    return (
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold mb-4">Reviews</h3>
        <p className="text-gray-600">No reviews yet. Be the first to review this place!</p>
      </div>
    )
  }

  return (
    <div className="border-b pb-6">
      <div className="flex items-center space-x-4 mb-6">
        <h3 className="text-lg font-semibold">Reviews</h3>
        <div className="flex items-center">
          <StarIcon className="h-5 w-5 text-yellow-400 fill-current mr-1" />
          <span className="font-medium">{averageRating.toFixed(1)}</span>
          <span className="text-gray-600 ml-1">({reviews.length} reviews)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.slice(0, 6).map((review) => (
          <div key={review._id} className="space-y-3">
            <div className="flex items-center space-x-3">
              <img
                src={review.user.avatar 
                  ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${review.user.avatar}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user.name)}&background=ff385c&color=fff`
                }
                alt={review.user.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium text-gray-900">{review.user.name}</p>
                <p className="text-sm text-gray-600">{formatDate(review.createdAt)}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>

      {reviews.length > 6 && (
        <button className="mt-6 btn-secondary">
          Show all {reviews.length} reviews
        </button>
      )}
    </div>
  )
}