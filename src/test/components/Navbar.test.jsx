import React from 'react';

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import axios from '../../services/axiosConfig'

jest.mock('../../context/AuthContext')
jest.mock('../../services/authService')
jest.mock('../../services/axiosConfig')

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockUser = {
    name: 'Yash Garg',
    storeId: 'store123'
  }

  const mockRoles = ['Admin', 'Manager']

  it('renders logo and user name', async () => {
    useAuth.mockReturnValue({
      currentUser: mockUser,
      hasRole: (role) => mockRoles.includes(role),
      logout: jest.fn()
    })

    authService.getCurrentUser.mockReturnValue(mockUser)

    axios.get.mockResolvedValue({
      data: [
        { status: 'LOW_STOCK' },
        { status: 'AVAILABLE' },
        { status: 'LOW_STOCK' }
      ]
    })

    render(<Navbar />, { wrapper: MemoryRouter })

    // Logo and Name
    expect(await screen.findByAltText('StockPilot')).toBeInTheDocument()
    expect(await screen.findByText('Yash Garg')).toBeInTheDocument()
  })

  it('renders only allowed navigation links', () => {
    useAuth.mockReturnValue({
      currentUser: mockUser,
      hasRole: (role) => ['Admin'].includes(role),
      logout: jest.fn()
    })

    render(<Navbar />, { wrapper: MemoryRouter })

    // Allowed for Admin
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Store transfer')).toBeInTheDocument()
    expect(screen.getByText('Change Log')).toBeInTheDocument()
    expect(screen.getByText('User Registration')).toBeInTheDocument()
    expect(screen.getByText('Store Setup')).toBeInTheDocument()
  })

  it('shows low stock count on notification icon', async () => {
    useAuth.mockReturnValue({
      currentUser: mockUser,
      hasRole: () => true,
      logout: jest.fn()
    })

    authService.getCurrentUser.mockReturnValue(mockUser)

    axios.get.mockResolvedValue({
      data: [
        { status: 'LOW_STOCK' },
        { status: 'LOW_STOCK' },
        { status: 'AVAILABLE' }
      ]
    })

    render(<Navbar />, { wrapper: MemoryRouter })

    const badge = await screen.findByText('2')
    expect(badge).toBeInTheDocument()
  })

  it('navigates to low stock alerts on bell icon click', async () => {
    useAuth.mockReturnValue({
      currentUser: mockUser,
      hasRole: () => true,
      logout: jest.fn()
    })

    authService.getCurrentUser.mockReturnValue(mockUser)
    axios.get.mockResolvedValue({ data: [] })

    render(<Navbar />, { wrapper: MemoryRouter })

    const bellButton = screen.getByRole('button', { name: /view notifications/i })
    fireEvent.click(bellButton)

    expect(mockNavigate).toHaveBeenCalledWith('/low-stock-alerts')
  })

  it('triggers logout when logout button is clicked', () => {
    const logoutMock = jest.fn()

    useAuth.mockReturnValue({
      currentUser: mockUser,
      hasRole: () => true,
      logout: logoutMock
    })

    render(<Navbar />, { wrapper: MemoryRouter })

    const logoutBtn = screen.getByRole('button', { name: /logout/i })
    fireEvent.click(logoutBtn)

    expect(logoutMock).toHaveBeenCalled()
  })
})
