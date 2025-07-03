'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { 
  HomeIcon, 
  UserIcon, 
  PlusIcon, 
  CalendarIcon,
  SearchIcon,
  MenuIcon,
  XIcon
} from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <nav className="bg-white shadow-md border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <HomeIcon className="h-8 w-8 text-airbnb-red" />
            <span className="text-xl font-bold text-airbnb-red">Airbnb Clone</span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="w-full relative">
              <input
                type="text"
                placeholder="Search destinations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-airbnb-red focus:border-transparent"
              />
              <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {user.isHost && (
                  <Link
                    href="/host/listings"
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-airbnb-red transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Host</span>
                  </Link>
                )}
                <Link
                  href="/bookings"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-airbnb-red transition-colors"
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span>Trips</span>
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 border border-gray-300 rounded-full hover:shadow-md transition-shadow">
                    <MenuIcon className="h-4 w-4" />
                    {user.avatar ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${user.avatar}`}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-8 w-8 p-1 bg-gray-300 rounded-full" />
                    )}
                  </button>
                  
                  {/* User Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/bookings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Bookings
                      </Link>
                      {user.isHost && (
                        <>
                          <Link
                            href="/host/listings"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            My Listings
                          </Link>
                          <Link
                            href="/host/bookings"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Host Bookings
                          </Link>
                        </>
                      )}
                      <Link
                        href="/become-host"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Become a Host
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/become-host"
                  className="text-gray-700 hover:text-airbnb-red transition-colors"
                >
                  Become a Host
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-airbnb-red transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-airbnb-red text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-airbnb-red"
          >
            {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-1">
            {/* Mobile Search */}
            <div className="py-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search destinations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-airbnb-red"
                />
                <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={toggleMenu}
                >
                  Profile
                </Link>
                <Link
                  href="/bookings"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={toggleMenu}
                >
                  My Bookings
                </Link>
                {user.isHost && (
                  <>
                    <Link
                      href="/host/listings"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                      onClick={toggleMenu}
                    >
                      My Listings
                    </Link>
                    <Link
                      href="/host/bookings"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                      onClick={toggleMenu}
                    >
                      Host Bookings
                    </Link>
                  </>
                )}
                <Link
                  href="/become-host"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={toggleMenu}
                >
                  Become a Host
                </Link>
                <button
                  onClick={() => {
                    logout()
                    toggleMenu()
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/become-host"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={toggleMenu}
                >
                  Become a Host
                </Link>
                <Link
                  href="/login"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={toggleMenu}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 bg-airbnb-red text-white rounded-lg hover:bg-red-600 transition-colors text-center"
                  onClick={toggleMenu}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}