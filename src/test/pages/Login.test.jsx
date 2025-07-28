import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../../pages/Login/Login';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { toast } from 'react-toastify';

// Mock react-toastify
jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
    ToastContainer: () => <div />,
}));

// Mock useAuth from AuthContext
jest.mock('../../context/AuthContext', () => {
    return {
        useAuth: jest.fn(),
    };
});

import { useAuth } from '../../context/AuthContext';

// Helper to render with router
const renderWithRouter = (ui) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Login Component', () => {
    const mockLogin = jest.fn();

    beforeEach(() => {
        useAuth.mockReturnValue({ login: mockLogin });
        mockLogin.mockReset();
    });

    it('renders all input fields and buttons', () => {
        renderWithRouter(<Login />);
        expect(screen.getByPlaceholderText('Enter your Username')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your Password')).toBeInTheDocument();
        expect(screen.getByText('Select Role')).toBeInTheDocument();
        expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('updates username and password on change', () => {
        renderWithRouter(<Login />);
        fireEvent.change(screen.getByPlaceholderText('Enter your Username'), {
            target: { value: 'testuser' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter your Password'), {
            target: { value: 'password123' },
        });

        expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
        expect(screen.getByDisplayValue('password123')).toBeInTheDocument();
    });

    it('calls login on form submit and shows success toast', async () => {
        mockLogin.mockResolvedValueOnce();
        renderWithRouter(<Login />);

        fireEvent.change(screen.getByPlaceholderText('Enter your Username'), {
            target: { value: 'user' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter your Password'), {
            target: { value: 'pass' },
        });

        fireEvent.click(screen.getByText('Sign In'));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                username: 'user',
                password: 'pass',
                role: 'Associate',
            });
            expect(toast.success).toHaveBeenCalledWith('Login successful!');
        });
    });

    it('shows error toast on login failure', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
        renderWithRouter(<Login />);

        fireEvent.change(screen.getByPlaceholderText('Enter your Username'), {
            target: { value: 'wrong' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter your Password'), {
            target: { value: 'wrongpass' },
        });

        fireEvent.click(screen.getByText('Sign In'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Invalid credentials. Please try again.');
        });
    });

    it('toggles password visibility when icon is clicked', () => {
        renderWithRouter(<Login />);
        const passwordInput = screen.getByPlaceholderText('Enter your Password');
        // Find the eye icon by its SVG content
        const toggleIcon = screen.getByText((content, element) => {
            return element.tagName.toLowerCase() === 'span' && 
                   element.innerHTML.includes('lucide-eye');
        });

        expect(passwordInput).toHaveAttribute('type', 'password');
        fireEvent.click(toggleIcon);
        expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('allows selecting different user roles', () => {
        renderWithRouter(<Login />);
        const managerRadio = screen.getByLabelText('Manager');
        fireEvent.click(managerRadio);
        expect(managerRadio).toBeChecked();

        const adminRadio = screen.getByLabelText('Admin');
        fireEvent.click(adminRadio);
        expect(adminRadio).toBeChecked();
    });

    it('displays loading state during login', async () => {
        mockLogin.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => resolve(), 500);
                })
        );

        renderWithRouter(<Login />);
        fireEvent.change(screen.getByPlaceholderText('Enter your Username'), {
            target: { value: 'user' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter your Password'), {
            target: { value: 'pass' },
        });
        fireEvent.click(screen.getByText('Sign In'));

        expect(screen.getByText('Signing in...')).toBeInTheDocument();

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalled();
        });
    });

    it('has a working forgot password link', () => {
        renderWithRouter(<Login />);
        const forgotLink = screen.getByText(/forgot your password/i);
        expect(forgotLink).toBeInTheDocument();
        expect(forgotLink.getAttribute('href')).toBe('/forgot-password');
    });

    it('does not submit if inputs are empty', () => {
        renderWithRouter(<Login />);
        fireEvent.click(screen.getByText('Sign In'));

        // login should not be called because of native validation
        expect(mockLogin).not.toHaveBeenCalled();
    });
});
