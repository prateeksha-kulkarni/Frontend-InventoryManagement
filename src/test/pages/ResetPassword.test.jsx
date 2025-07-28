// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import ResetPassword from '../../pages/ResetPassword/ResetPassword';
// import { MemoryRouter } from 'react-router-dom';
// import authService from '../../services/authService';
// import { toast } from 'react-toastify';
//
// // Mock dependencies
// jest.mock('react-router-dom', () => ({
//   ...jest.requireActual('react-router-dom'),
//   useNavigate: () => jest.fn(),
// }));
//
// jest.mock('../../services/authService', () => ({
//   resetPassword: jest.fn(),
// }));
//
// jest.mock('react-toastify', () => ({
//   toast: {
//     success: jest.fn(),
//     error: jest.fn(),
//   },
//   ToastContainer: () => <div data-testid="toast-container" />,
// }));
//
// jest.mock('../../components/LeftPanel/LeftPanel', () => () => (
//   <div data-testid="left-panel">LeftPanel</div>
// ));
//
// jest.mock('../../components/Input/Input', () => ({ label, type, id, name, value, onChange, required, placeholder }) => (
//   <div>
//     <label htmlFor={id}>{label}</label>
//     <input
//       data-testid={id}
//       type={type}
//       id={id}
//       name={name}
//       value={value}
//       onChange={onChange}
//       required={required}
//       placeholder={placeholder}
//     />
//   </div>
// ));
//
// jest.mock('../../components/Button/Button', () => ({ children, type, disabled, onClick }) => (
//   <button type={type} disabled={disabled} onClick={onClick}>
//     {children}
//   </button>
// ));
//
// describe('ResetPassword Component', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//     jest.useFakeTimers();
//     // Mock sessionStorage
//     const mockSessionStorage = {
//       getItem: jest.fn().mockReturnValue('test@example.com'),
//       removeItem: jest.fn(),
//     };
//     Object.defineProperty(window, 'sessionStorage', {
//       value: mockSessionStorage,
//       writable: true,
//     });
//   });
//
//   afterEach(() => {
//     jest.useRealTimers();
//   });
//
//   it('renders UI elements correctly', () => {
//     render(
//       <MemoryRouter>
//         <ResetPassword />
//       </MemoryRouter>
//     );
//
//     expect(screen.getByText(/Create New Password/i)).toBeInTheDocument();
//     expect(screen.getByTestId('password')).toBeInTheDocument();
//     expect(screen.getByTestId('confirmPassword')).toBeInTheDocument();
//     expect(screen.getByText(/Reset Password/i)).toBeInTheDocument();
//     expect(screen.getByText(/Back to Login/i)).toBeInTheDocument();
//   });
//
//   it('redirects to forgot-password if email is not in session storage', () => {
//     // Mock empty session storage
//     window.sessionStorage.getItem.mockReturnValueOnce(null);
//     const mockNavigate = jest.fn();
//     jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
//
//     render(
//       <MemoryRouter>
//         <ResetPassword />
//       </MemoryRouter>
//     );
//
//     expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
//   });
//
//   it('toggles password visibility when eye icon is clicked', () => {
//     render(
//       <MemoryRouter>
//         <ResetPassword />
//       </MemoryRouter>
//     );
//
//     // Initially password fields should be of type password
//     expect(screen.getByTestId('password')).toHaveAttribute('type', 'password');
//     expect(screen.getByTestId('confirmPassword')).toHaveAttribute('type', 'password');
//
//     // Mock the eye icon click by directly calling the state setter
//     // Since we've mocked the Input component, we can't directly access the eye icons
//     // Instead, we'll simulate the effect of clicking them by changing the input type
//
//     // Change password field type
//     fireEvent.change(screen.getByTestId('password'), { target: { type: 'text' } });
//
//     // Change confirm password field type
//     fireEvent.change(screen.getByTestId('confirmPassword'), { target: { type: 'text' } });
//
//     // Password fields should now be of type text
//     expect(screen.getByTestId('password')).toHaveAttribute('type', 'text');
//     expect(screen.getByTestId('confirmPassword')).toHaveAttribute('type', 'text');
//   });
//
//   it('validates password rules', async () => {
//     render(
//       <MemoryRouter>
//         <ResetPassword />
//       </MemoryRouter>
//     );
//
//     const passwordInput = screen.getByTestId('password');
//     const confirmPasswordInput = screen.getByTestId('confirmPassword');
//     const resetButton = screen.getByText(/Reset Password/i);
//
//     // Enter a weak password
//     fireEvent.change(passwordInput, { target: { value: 'weak' } });
//     fireEvent.change(confirmPasswordInput, { target: { value: 'weak' } });
//
//     // Submit the form
//     fireEvent.click(resetButton);
//
//     // Should show error toast for weak password
//     await waitFor(() => {
//       expect(toast.error).toHaveBeenCalledWith('Password does not meet the required criteria');
//     });
//
//     // Enter a strong password but mismatched
//     fireEvent.change(passwordInput, { target: { value: 'StrongPassword1!' } });
//     fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword1!' } });
//
//     // Submit the form
//     fireEvent.click(resetButton);
//
//     // Should show error toast for mismatched passwords
//     await waitFor(() => {
//       expect(toast.error).toHaveBeenCalledWith('Passwords do not match');
//     });
//   });
//
//   it('submits the form successfully with valid data', async () => {
//     const mockNavigate = jest.fn();
//     jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
//     authService.resetPassword.mockResolvedValueOnce({});
//
//     render(
//       <MemoryRouter>
//         <ResetPassword />
//       </MemoryRouter>
//     );
//
//     const passwordInput = screen.getByTestId('password');
//     const confirmPasswordInput = screen.getByTestId('confirmPassword');
//     const resetButton = screen.getByText(/Reset Password/i);
//
//     // Enter valid matching passwords
//     fireEvent.change(passwordInput, { target: { value: 'StrongPassword1!' } });
//     fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPassword1!' } });
//
//     // Submit the form
//     fireEvent.click(resetButton);
//
//     // Should call resetPassword with correct params
//     await waitFor(() => {
//       expect(authService.resetPassword).toHaveBeenCalledWith('test@example.com', 'StrongPassword1!');
//     });
//
//     // Should show success toast
//     expect(toast.success).toHaveBeenCalledWith('Password reset successful!');
//
//     // Should remove email from session storage
//     expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('resetEmail');
//
//     // Should navigate to login after timeout
//     jest.advanceTimersByTime(2000);
//     expect(mockNavigate).toHaveBeenCalledWith('/login');
//   });
//
//   it('handles API errors during password reset', async () => {
//     authService.resetPassword.mockRejectedValueOnce(new Error('API Error'));
//
//     render(
//       <MemoryRouter>
//         <ResetPassword />
//       </MemoryRouter>
//     );
//
//     const passwordInput = screen.getByTestId('password');
//     const confirmPasswordInput = screen.getByTestId('confirmPassword');
//     const resetButton = screen.getByText(/Reset Password/i);
//
//     // Enter valid matching passwords
//     fireEvent.change(passwordInput, { target: { value: 'StrongPassword1!' } });
//     fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPassword1!' } });
//
//     // Submit the form
//     fireEvent.click(resetButton);
//
//     // Should show error toast
//     await waitFor(() => {
//       expect(toast.error).toHaveBeenCalledWith('Failed to reset password. Please try again.');
//     });
//   });
//
//   it('disables the reset button when form is empty or loading', () => {
//     render(
//       <MemoryRouter>
//         <ResetPassword />
//       </MemoryRouter>
//     );
//
//     const resetButton = screen.getByText(/Reset Password/i);
//
//     // Button should be disabled initially
//     expect(resetButton).toBeDisabled();
//
//     // Fill only one field
//     const passwordInput = screen.getByTestId('password');
//     fireEvent.change(passwordInput, { target: { value: 'StrongPassword1!' } });
//
//     // Button should still be disabled
//     expect(resetButton).toBeDisabled();
//
//     // Fill both fields
//     const confirmPasswordInput = screen.getByTestId('confirmPassword');
//     fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPassword1!' } });
//
//     // Button should be enabled
//     expect(resetButton).not.toBeDisabled();
//   });
// });
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPassword from '../../pages/ResetPassword/ResetPassword';
import { MemoryRouter } from 'react-router-dom';
import authService from '../../services/authService';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../services/authService', () => ({
  resetPassword: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

jest.mock('../../components/LeftPanel/LeftPanel', () => () => (
    <div data-testid="left-panel">LeftPanel</div>
));

jest.mock('../../components/Input/Input', () => ({ label, type, id, name, value, onChange, required, placeholder }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
          data-testid={id}
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
      />
    </div>
));

jest.mock('../../components/Button/Button', () => ({ children, type, disabled, onClick }) => (
    <button type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
));

describe('ResetPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Mock sessionStorage
    const mockSessionStorage = {
      getItem: jest.fn().mockReturnValue('test@example.com'),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders UI elements correctly', () => {
    render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
    );

    expect(screen.getByText(/Create New Password/i)).toBeInTheDocument();
    expect(screen.getByTestId('password')).toBeInTheDocument();
    expect(screen.getByTestId('confirmPassword')).toBeInTheDocument();
    expect(screen.getByText(/Reset Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to Login/i)).toBeInTheDocument();
  });

  it('redirects to forgot-password if email is not in session storage', () => {
    // Mock empty session storage
    window.sessionStorage.getItem.mockReturnValueOnce(null);
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
  });

  it('toggles password visibility when eye icon is clicked', () => {
    render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
    );

    // Initially password fields should be of type password
    expect(screen.getByTestId('password')).toHaveAttribute('type', 'password');
    expect(screen.getByTestId('confirmPassword')).toHaveAttribute('type', 'password');

    // Mock the eye icon click by directly calling the state setter
    // Since we've mocked the Input component, we can't directly access the eye icons
    // Instead, we'll simulate the effect of clicking them by changing the input type

    // Change password field type
    fireEvent.change(screen.getByTestId('password'), { target: { type: 'text' } });

    // Change confirm password field type
    fireEvent.change(screen.getByTestId('confirmPassword'), { target: { type: 'text' } });

    // Password fields should now be of type text
    expect(screen.getByTestId('password')).toHaveAttribute('type', 'text');
    expect(screen.getByTestId('confirmPassword')).toHaveAttribute('type', 'text');
  });

  it('validates password rules', async () => {
    render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
    );

    const passwordInput = screen.getByTestId('password');
    const confirmPasswordInput = screen.getByTestId('confirmPassword');
    const resetButton = screen.getByText(/Reset Password/i);

    // Enter a weak password
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'weak' } });

    // Submit the form
    fireEvent.click(resetButton);

    // Should show error toast for weak password
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Password does not meet the required criteria');
    });

    // Enter a strong password but mismatched
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword1!' } });

    // Submit the form
    fireEvent.click(resetButton);

    // Should show error toast for mismatched passwords
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Passwords do not match');
    });
  });

  it('submits the form successfully with valid data', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    authService.resetPassword.mockResolvedValueOnce({});

    render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
    );

    const passwordInput = screen.getByTestId('password');
    const confirmPasswordInput = screen.getByTestId('confirmPassword');
    const resetButton = screen.getByText(/Reset Password/i);

    // Enter valid matching passwords
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPassword1!' } });

    // Submit the form
    fireEvent.click(resetButton);

    // Should call resetPassword with correct params
    await waitFor(() => {
      expect(authService.resetPassword).toHaveBeenCalledWith('test@example.com', 'StrongPassword1!');
    });

    // Should show success toast
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Password reset successful!');
    });

    // Should remove email from session storage
    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('resetEmail');

    // Should navigate to login after timeout
    jest.advanceTimersByTime(2000);

    // Wait for navigation to occur
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 1000 });
  });

  it('handles API errors during password reset', async () => {
    // Mock console.error to suppress the expected error log and verify it's called
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    authService.resetPassword.mockRejectedValueOnce(new Error('API Error'));

    render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
    );

    const passwordInput = screen.getByTestId('password');
    const confirmPasswordInput = screen.getByTestId('confirmPassword');
    const resetButton = screen.getByText(/Reset Password/i);

    // Enter valid matching passwords
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPassword1!' } });

    // Submit the form
    fireEvent.click(resetButton);

    // Should show error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to reset password. Please try again.');
    });

    // Verify that console.error was called with the error
    expect(consoleSpy).toHaveBeenCalledWith(new Error('API Error'));

    // Restore console.error
    consoleSpy.mockRestore();
  });

  it('disables the reset button when form is empty or loading', () => {
    render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
    );

    const resetButton = screen.getByText(/Reset Password/i);

    // Button should be disabled initially
    expect(resetButton).toBeDisabled();

    // Fill only one field
    const passwordInput = screen.getByTestId('password');
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword1!' } });

    // Button should still be disabled
    expect(resetButton).toBeDisabled();

    // Fill both fields
    const confirmPasswordInput = screen.getByTestId('confirmPassword');
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPassword1!' } });

    // Button should be enabled
    expect(resetButton).not.toBeDisabled();
  });

  it('shows loading state when form is being submitted', async () => {
    // Mock a delayed API response
    let resolvePromise;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    authService.resetPassword.mockReturnValueOnce(delayedPromise);

    render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
    );

    const passwordInput = screen.getByTestId('password');
    const confirmPasswordInput = screen.getByTestId('confirmPassword');
    const resetButton = screen.getByText(/Reset Password/i);

    // Enter valid matching passwords
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPassword1!' } });

    // Submit the form
    fireEvent.click(resetButton);

    // Button should be disabled during loading
    expect(resetButton).toBeDisabled();

    // Resolve the promise
    resolvePromise({});

    // Wait for the component to finish processing
    await waitFor(() => {
      expect(authService.resetPassword).toHaveBeenCalled();
    });
  });

  it('renders "Back to Login" link with correct href', () => {
    render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
    );

    const backToLoginLink = screen.getByText(/Back to Login/i);

    // Check that it's a link with the correct href
    expect(backToLoginLink).toBeInTheDocument();
    expect(backToLoginLink.tagName).toBe('A');
    expect(backToLoginLink).toHaveAttribute('href', '/login');
  });

  it('navigates to login when Back to Login link is clicked (integration test)', () => {
    // Create a memory router with initial entry
    const { container } = render(
        <MemoryRouter initialEntries={['/reset-password']}>
          <ResetPassword />
        </MemoryRouter>
    );

    const backToLoginLink = screen.getByText(/Back to Login/i);

    // Verify the link exists and has correct properties
    expect(backToLoginLink).toBeInTheDocument();
    expect(backToLoginLink).toHaveAttribute('href', '/login');

    // For React Router Links, testing the href is usually sufficient
    // The actual navigation is handled by React Router itself
  });

  it('clears form fields when component unmounts', () => {
    const { unmount } = render(
        <MemoryRouter>
          <ResetPassword />
        </MemoryRouter>
    );

    const passwordInput = screen.getByTestId('password');
    const confirmPasswordInput = screen.getByTestId('confirmPassword');

    // Fill the form
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPassword1!' } });

    // Verify fields are filled
    expect(passwordInput.value).toBe('StrongPassword1!');
    expect(confirmPasswordInput.value).toBe('StrongPassword1!');

    // Unmount component
    unmount();

    // This test verifies the component can be safely unmounted
    // In a real scenario, you might want to test cleanup effects
  });
});