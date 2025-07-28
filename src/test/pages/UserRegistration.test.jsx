import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserRegistration from '../../pages/UserRegistration/UserRegistration';
import '@testing-library/jest-dom';
import { toast } from 'react-toastify';
import axios from '../../services/axiosConfig';

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock axios
jest.mock('../../services/axiosConfig', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe('UserRegistration Component', () => {
  const mockStores = [
    { id: 1, name: 'Store 1' },
    { id: 2, name: 'Store 2' },
    { id: 3, name: 'Store 3' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the API call to fetch stores
    axios.get.mockImplementation((url) => {
      if (url === '/api/stores') {
        return Promise.resolve({ data: mockStores });
      }
      if (url === '/api/users/check-duplicate') {
        return Promise.resolve({ 
          data: { 
            usernameExists: false, 
            emailExists: false, 
            phoneExists: false 
          } 
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    axios.post.mockResolvedValue({ data: { message: 'User registered successfully' } });
  });

  it('renders the registration form with all fields', async () => {
    render(<UserRegistration />);

    // Wait for the component to fetch stores
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stores');
    });

    // Check if all form elements are rendered
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByText(/store \*/i)).toBeInTheDocument();
    expect(screen.getByText(/register user/i)).toBeInTheDocument();
  });

  it('updates form fields when user inputs data', async () => {
    render(<UserRegistration />);

    // Wait for the component to fetch stores
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stores');
    });

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });

    // Select a role
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'associate' } });

    // Select a store
    const storeSelects = screen.getAllByRole('combobox');
    const storeSelect = storeSelects[storeSelects.length - 1]; // Get the last combobox (store select)
    fireEvent.change(storeSelect, { target: { value: 'Store 1' } });

    // Check if the values are updated
    expect(screen.getByLabelText(/first name/i)).toHaveValue('John');
    expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe');
    expect(screen.getByLabelText(/username/i)).toHaveValue('johndoe');
    expect(screen.getByLabelText(/password/i)).toHaveValue('Password123!');
    expect(screen.getByLabelText(/phone number/i)).toHaveValue('1234567890');
    expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com');
    expect(screen.getByLabelText(/role/i)).toHaveValue('associate');
    expect(storeSelect).toHaveValue('Store 1');
  });

  it('toggles password visibility when eye icon is clicked', async () => {
    render(<UserRegistration />);

    // Wait for the component to fetch stores
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stores');
    });

    // Check initial password field type
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the eye button to toggle visibility
    const toggleButton = screen.getByRole('button', { name: '' }); // The eye button has no accessible name
    fireEvent.click(toggleButton);

    // Check if password is now visible
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click again to hide
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('generates a password when generate password button is clicked', async () => {
    render(<UserRegistration />);

    // Wait for the component to fetch stores
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stores');
    });

    // Check initial password field is empty
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveValue('');

    // Click the generate password button
    const generateButton = screen.getByText(/generate password/i);
    fireEvent.click(generateButton);

    // Check if password is generated (not empty)
    expect(passwordInput).not.toHaveValue('');

    // Check if generated password matches the required pattern
    const passwordValue = passwordInput.value;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    expect(passwordRegex.test(passwordValue)).toBe(true);
  });

  it('shows additional store fields when analyst role is selected', async () => {
    render(<UserRegistration />);

    // Wait for the component to fetch stores
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stores');
    });

    // Initially, there should be only one store field
    expect(screen.getByText(/store \*/i)).toBeInTheDocument();
    expect(screen.queryByText(/stores \(minimum 2\)/i)).not.toBeInTheDocument();

    // Select analyst role
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'analyst' } });

    // Now there should be a label for multiple stores
    expect(screen.getByText(/stores \(minimum 2\)/i)).toBeInTheDocument();

    // There should be an add store button
    const buttons = screen.getAllByRole('button');
    // Find the button with the Plus icon (it's usually one of the last buttons)
    const addButton = buttons.find(button => button.innerHTML.includes('lucide-plus'));
    fireEvent.click(addButton);

    // Now there should be two store selects
    const storeSelects = screen.getAllByRole('combobox');
    expect(storeSelects.length).toBe(3); // Role select + 2 store selects
  });

  it('validates form fields and shows error messages', async () => {
    render(<UserRegistration />);

    // Wait for the component to fetch stores
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stores');
    });

    // Submit the form without filling any fields
    const submitButton = screen.getByText(/register user/i);
    fireEvent.click(submitButton);

    // Check if validation error is shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('First name is required.');
    });

    // Fill first name with invalid characters
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('First name must contain only letters.');
    });

    // Fill first name correctly
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });

    // Submit again to trigger next validation
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Username is required.');
    });

    // Continue filling fields with valid data
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'johndoe' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please select a role.');
    });
  });

  it('submits the form successfully with valid data', async () => {
    render(<UserRegistration />);

    // Wait for the component to fetch stores
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stores');
    });

    // Fill out the form with valid data
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'associate' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });

    // Select a store
    const storeSelects = screen.getAllByRole('combobox');
    const storeSelect = storeSelects[storeSelects.length - 1]; // Get the last combobox (store select)
    fireEvent.change(storeSelect, { target: { value: 'Store 1' } });

    // Submit the form
    const submitButton = screen.getByText(/register user/i);
    fireEvent.click(submitButton);

    // Check if the form submission API call is made
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/users/register', expect.objectContaining({
        firstName: 'John',
        lastName: '',
        username: 'johndoe',
        role: 'ASSOCIATE',
        password: 'Password123!',
        phoneNumber: '1234567890',
        email: 'john@example.com',
        stores: ['Store 1']
      }));

      expect(toast.success).toHaveBeenCalledWith('User johndoe registered successfully.');
    });

    // Check if form is reset after successful submission
    expect(screen.getByLabelText(/first name/i)).toHaveValue('');
    expect(screen.getByLabelText(/username/i)).toHaveValue('');
  });

  it('handles API errors during form submission', async () => {
    // Mock API error
    axios.post.mockRejectedValueOnce({ 
      response: { data: { message: 'Server error' } } 
    });

    render(<UserRegistration />);

    // Wait for the component to fetch stores
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stores');
    });

    // Fill out the form with valid data
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'associate' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });

    // Select a store
    const storeSelects = screen.getAllByRole('combobox');
    const storeSelect = storeSelects[storeSelects.length - 1]; // Get the last combobox (store select)
    fireEvent.change(storeSelect, { target: { value: 'Store 1' } });

    // Submit the form
    const submitButton = screen.getByText(/register user/i);
    fireEvent.click(submitButton);

    // Check if error toast is shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server error');
    });
  });

  it('handles duplicate username/email/phone during validation', async () => {
    // Mock duplicate check API response
    axios.get.mockImplementation((url) => {
      if (url === '/api/stores') {
        return Promise.resolve({ data: mockStores });
      }
      if (url === '/api/users/check-duplicate') {
        return Promise.resolve({ 
          data: { 
            usernameExists: true, 
            emailExists: false, 
            phoneExists: false 
          } 
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<UserRegistration />);

    // Wait for the component to fetch stores
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stores');
    });

    // Fill out the form with valid data
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'associate' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });

    // Select a store
    const storeSelects = screen.getAllByRole('combobox');
    const storeSelect = storeSelects[storeSelects.length - 1]; // Get the last combobox (store select)
    fireEvent.change(storeSelect, { target: { value: 'Store 1' } });

    // Submit the form
    const submitButton = screen.getByText(/register user/i);
    fireEvent.click(submitButton);

    // Check if duplicate username error is shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Username already exists.');
    });
  });
});
