'use client'

import { useState } from 'react'
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [showModal, setShowModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const getImageUrl = (imagePath: string) => {
    if (imagePath?.startsWith('http')) {
      return imagePath
    }
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${imagePath}`
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const openModal = (index: number) => {
    setCurrentImageIndex(index)
    setShowModal(true)
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-96 rounded-xl overflow-hidden">
        {/* Main Image */}
        <div 
          className="col-span-2 row-span-2 cursor-pointer relative group"
          onClick={() => openModal(0)}
        >
          <img
            src={getImageUrl(images[0]) || 'https://images.unsplash.com/photo-1586864387967-d02373281399?auto=format&fit=crop&w=800&q=80'}
            alt="Main listing image"
            className="w-full h-full object-cover group-hover:brightness-95 transition-all"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
        </div>

        {/* Side Images */}
        {images.slice(1, 5).map((image, index) => (
          <div 
            key={index}
            className="cursor-pointer relative group"
            onClick={() => openModal(index + 1)}
          >
            <img
              src={getImageUrl(image) || `https://images.unsplash.com/photo-${1580000000000 + index}?auto=format&fit=crop&w=400&q=80`}
              alt={`Listing image ${index + 2}`}
              className="w-full h-full object-cover group-hover:brightness-95 transition-all"
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
            {index === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-semibold">
                  +{images.length - 5} photos
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <XIcon className="h-8 w-8" />
            </button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 text-white hover:text-gray-300 z-10"
                >
                  <ChevronLeftIcon className="h-8 w-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 text-white hover:text-gray-300 z-10"
                >
                  <ChevronRightIcon className="h-8 w-8" />
                </button>
              </>
            )}

            {/* Current Image */}
            <img
              src={getImageUrl(images[currentImageIndex])}
              alt={`Listing image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
              {currentImageIndex + 1} / {images.length}
            </div>

            {/* Thumbnail Strip */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                    index === currentImageIndex ? 'border-white' : 'border-transparent opacity-60'
                  }`}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}