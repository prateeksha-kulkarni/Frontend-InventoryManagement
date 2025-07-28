import React from 'react';

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel
} from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import Logo from '../../assets/images/Logo.png'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from '../../services/axiosConfig' // Ensure correct path
import authService from '../../services/authService' 
const navigation = [
  { name: 'Dashboard', href: '/dashboard', roles: ['Associate', 'Admin', 'MANAGER', 'Analyst'] },
  { name: 'Analytics', href: '/analytics', roles: ['Analyst', 'Manager', 'Admin'] },
  { name: 'Store transfer', href: '/transfer', roles: ['Manager', 'Admin'] },
  { name: 'Change Log', href: '/change-log', roles: ['Associate', 'Admin', 'Manager', 'Analyst'] },
  { name: 'User Registration', href: '/user-registration', roles: ['Admin'] },
  { name: 'Store Setup', href: '/store-setup', roles: ['Admin'] },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const { currentUser, logout, hasRole } = useAuth()
  const filteredNavigation = navigation.filter(item =>
    item.roles.some(role => hasRole(role))
  )
  const navigate = useNavigate()
  const [lowStockCount, setLowStockCount] = useState(0)
  useEffect(() => {
    const fetchLowStockCount = async () => {
      try {
        const user = authService.getCurrentUser()
        const storeId = user?.storeId

        if (!storeId) {
          console.warn("No store ID found for user.")
          return
        }

        const response = await axios.get(`/api/inventory/store/${storeId}`)
        const lowStockItems = response.data.filter(item => item.status === "LOW_STOCK")
        setLowStockCount(lowStockItems.length)
      } catch (error) {
        console.error("Error fetching low stock count:", error)
      }
    }

    fetchLowStockCount()
  }, [])

  return (
    <Disclosure as="nav" className="bg-gray-800 sticky top-0 z-50 shadow-md">
      <div className="mx-auto max-w-8xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="group inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white">
              <Bars3Icon className="block size-6 group-data-open:hidden" />
              <XMarkIcon className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>

          {/* Logo and Brand Name */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex items-center space-x-2">
              <img
                alt="StockPilot"
                src={Logo}
                className="h-8 w-auto"
              />
              <span className="text-white font-semibold text-lg hidden sm:block">StockPilot</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4 ml-6">
                {filteredNavigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'rounded-md px-3 py-2 text-sm font-medium transition'
                    )}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 space-x-4">
            {/* Notification Icon */}
             <div className="relative">
            <button
              type="button"
              className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white"
               onClick={() => navigate("/low-stock-alerts")}
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="size-6" />
            </button>
             {lowStockCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {lowStockCount}
                </span>
              )}
            </div>
            {/* User Info */}
            {currentUser && (
              <div className="text-white text-sm font-medium hidden sm:block">
                {currentUser.name}
              </div>
            )}

            {/* Logout Button */}
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Links */}
      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {filteredNavigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.href}
              className={classNames(
                item.current
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'block rounded-md px-3 py-2 text-base font-medium transition'
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}
