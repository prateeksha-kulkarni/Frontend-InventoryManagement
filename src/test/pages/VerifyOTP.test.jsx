// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import VerifyOTP from '../../pages/VerifyOTP/VerifyOTP';
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
//   verifyOTP: jest.fn(),
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
// describe('VerifyOTP Component', () => {
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
//         <VerifyOTP />
//       </MemoryRouter>
//     );
//
//     expect(screen.getByText(/Enter OTP/i)).toBeInTheDocument();
//     expect(screen.getByTestId('otp')).toBeInTheDocument();
//     expect(screen.getByText(/Verify OTP/i)).toBeInTheDocument();
//     expect(screen.getByText(/Resend OTP/i)).toBeInTheDocument();
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
//         <VerifyOTP />
//       </MemoryRouter>
//     );
//
//     expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
//   });
//
//   it('only allows numeric input and limits to 6 digits', () => {
//     render(
//       <MemoryRouter>
//         <VerifyOTP />
//       </MemoryRouter>
//     );
//
//     const otpInput = screen.getByTestId('otp');
//
//     // Test with non-numeric characters
//     fireEvent.change(otpInput, { target: { value: 'abc123' } });
//     expect(otpInput).toHaveValue('123');
//
//     // Test with more than 6 digits
//     fireEvent.change(otpInput, { target: { value: '1234567890' } });
//     expect(otpInput).toHaveValue('123456');
//   });
//
//   it('disables the verify button when OTP is not 6 digits', () => {
//     render(
//       <MemoryRouter>
//         <VerifyOTP />
//       </MemoryRouter>
//     );
//
//     const verifyButton = screen.getByText(/Verify OTP/i);
//     const otpInput = screen.getByTestId('otp');
//
//     // Button should be disabled initially
//     expect(verifyButton).toBeDisabled();
//
//     // Enter 5 digits (not enough)
//     fireEvent.change(otpInput, { target: { value: '12345' } });
//     expect(verifyButton).toBeDisabled();
//
//     // Enter 6 digits
//     fireEvent.change(otpInput, { target: { value: '123456' } });
//     expect(verifyButton).not.toBeDisabled();
//   });
//
//   it('submits the form successfully with valid OTP', async () => {
//     const mockNavigate = jest.fn();
//     jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
//     authService.verifyOTP.mockResolvedValueOnce({ valid: true });
//
//     render(
//       <MemoryRouter>
//         <VerifyOTP />
//       </MemoryRouter>
//     );
//
//     const otpInput = screen.getByTestId('otp');
//     const verifyButton = screen.getByText(/Verify OTP/i);
//
//     // Enter valid OTP
//     fireEvent.change(otpInput, { target: { value: '123456' } });
//
//     // Submit the form
//     fireEvent.click(verifyButton);
//
//     // Should call verifyOTP with correct params
//     await waitFor(() => {
//       expect(authService.verifyOTP).toHaveBeenCalledWith('test@example.com', '123456');
//     });
//
//     // Should show success toast
//     expect(toast.success).toHaveBeenCalledWith('✅ OTP verified successfully!');
//
//     // Should navigate to reset-password after timeout
//     jest.advanceTimersByTime(1500);
//     expect(mockNavigate).toHaveBeenCalledWith('/reset-password');
//   });
//
//   it('handles API errors during OTP verification', async () => {
//     authService.verifyOTP.mockRejectedValueOnce(new Error('API Error'));
//
//     render(
//       <MemoryRouter>
//         <VerifyOTP />
//       </MemoryRouter>
//     );
//
//     const otpInput = screen.getByTestId('otp');
//     const verifyButton = screen.getByText(/Verify OTP/i);
//
//     // Enter valid OTP
//     fireEvent.change(otpInput, { target: { value: '123456' } });
//
//     // Submit the form
//     fireEvent.click(verifyButton);
//
//     // Should show error toast
//     await waitFor(() => {
//       expect(toast.error).toHaveBeenCalledWith('API Error');
//     });
//   });
//
//   it('handles invalid OTP response', async () => {
//     authService.verifyOTP.mockResolvedValueOnce({ valid: false, message: 'Invalid OTP' });
//
//     render(
//       <MemoryRouter>
//         <VerifyOTP />
//       </MemoryRouter>
//     );
//
//     const otpInput = screen.getByTestId('otp');
//     const verifyButton = screen.getByText(/Verify OTP/i);
//
//     // Enter valid OTP
//     fireEvent.change(otpInput, { target: { value: '123456' } });
//
//     // Submit the form
//     fireEvent.click(verifyButton);
//
//     // Should show error toast
//     await waitFor(() => {
//       expect(toast.error).toHaveBeenCalledWith('Invalid OTP');
//     });
//   });
//
//   it('shows loading state during verification', async () => {
//     authService.verifyOTP.mockImplementation(
//       () => new Promise(resolve => setTimeout(() => resolve({ valid: true }), 500))
//     );
//
//     render(
//       <MemoryRouter>
//         <VerifyOTP />
//       </MemoryRouter>
//     );
//
//     const otpInput = screen.getByTestId('otp');
//
//     // Enter valid OTP
//     fireEvent.change(otpInput, { target: { value: '123456' } });
//
//     // Submit the form
//     fireEvent.click(screen.getByText(/Verify OTP/i));
//
//     // Should show loading state
//     expect(screen.getByText(/Verifying.../i)).toBeInTheDocument();
//
//     // Wait for verification to complete
//     await waitFor(() => {
//       expect(authService.verifyOTP).toHaveBeenCalled();
//     });
//   });
// });


import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VerifyOTP from '../../pages/VerifyOTP/VerifyOTP';
import { MemoryRouter } from 'react-router-dom';
import authService from '../../services/authService';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../services/authService', () => ({
  verifyOTP: jest.fn(),
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

describe('VerifyOTP Component', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Suppress console.error during tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

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
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('renders UI elements correctly', () => {
    render(
        <MemoryRouter>
          <VerifyOTP />
        </MemoryRouter>
    );

    expect(screen.getByText(/Enter OTP/i)).toBeInTheDocument();
    expect(screen.getByTestId('otp')).toBeInTheDocument();
    expect(screen.getByText(/Verify OTP/i)).toBeInTheDocument();
    expect(screen.getByText(/Resend OTP/i)).toBeInTheDocument();
    expect(screen.getByText(/Back to Login/i)).toBeInTheDocument();
  });

  it('redirects to forgot-password if email is not in session storage', () => {
    // Mock empty session storage
    window.sessionStorage.getItem.mockReturnValueOnce(null);
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    render(
        <MemoryRouter>
          <VerifyOTP />
        </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
  });

  it('only allows numeric input and limits to 6 digits', () => {
    render(
        <MemoryRouter>
          <VerifyOTP />
        </MemoryRouter>
    );

    const otpInput = screen.getByTestId('otp');

    // Test with non-numeric characters
    fireEvent.change(otpInput, { target: { value: 'abc123' } });
    expect(otpInput).toHaveValue('123');

    // Test with more than 6 digits
    fireEvent.change(otpInput, { target: { value: '1234567890' } });
    expect(otpInput).toHaveValue('123456');
  });

  it('disables the verify button when OTP is not 6 digits', () => {
    render(
        <MemoryRouter>
          <VerifyOTP />
        </MemoryRouter>
    );

    const verifyButton = screen.getByText(/Verify OTP/i);
    const otpInput = screen.getByTestId('otp');

    // Button should be disabled initially
    expect(verifyButton).toBeDisabled();

    // Enter 5 digits (not enough)
    fireEvent.change(otpInput, { target: { value: '12345' } });
    expect(verifyButton).toBeDisabled();

    // Enter 6 digits
    fireEvent.change(otpInput, { target: { value: '123456' } });
    expect(verifyButton).not.toBeDisabled();
  });

  it('submits the form successfully with valid OTP', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    authService.verifyOTP.mockResolvedValueOnce({ valid: true });

    render(
        <MemoryRouter>
          <VerifyOTP />
        </MemoryRouter>
    );

    const otpInput = screen.getByTestId('otp');
    const verifyButton = screen.getByText(/Verify OTP/i);

    // Enter valid OTP
    fireEvent.change(otpInput, { target: { value: '123456' } });

    // Submit the form
    fireEvent.click(verifyButton);

    // Should call verifyOTP with correct params
    await waitFor(() => {
      expect(authService.verifyOTP).toHaveBeenCalledWith('test@example.com', '123456');
    });

    // Should show success toast
    expect(toast.success).toHaveBeenCalledWith('✅ OTP verified successfully!');

    // Should navigate to reset-password after timeout
    jest.advanceTimersByTime(1500);
    expect(mockNavigate).toHaveBeenCalledWith('/reset-password');
  });

  it('handles API errors during OTP verification', async () => {
    authService.verifyOTP.mockRejectedValueOnce(new Error('API Error'));

    render(
        <MemoryRouter>
          <VerifyOTP />
        </MemoryRouter>
    );

    const otpInput = screen.getByTestId('otp');
    const verifyButton = screen.getByText(/Verify OTP/i);

    // Enter valid OTP
    fireEvent.change(otpInput, { target: { value: '123456' } });

    // Submit the form
    fireEvent.click(verifyButton);

    // Should show error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('API Error');
    });

    // Verify that console.error was called (optional assertion)
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error verifying OTP:', expect.any(Error));
  });

  it('handles invalid OTP response', async () => {
    authService.verifyOTP.mockResolvedValueOnce({ valid: false, message: 'Invalid OTP' });

    render(
        <MemoryRouter>
          <VerifyOTP />
        </MemoryRouter>
    );

    const otpInput = screen.getByTestId('otp');
    const verifyButton = screen.getByText(/Verify OTP/i);

    // Enter valid OTP
    fireEvent.change(otpInput, { target: { value: '123456' } });

    // Submit the form
    fireEvent.click(verifyButton);

    // Should show error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid OTP');
    });
  });

  it('shows loading state during verification', async () => {
    authService.verifyOTP.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ valid: true }), 500))
    );

    render(
        <MemoryRouter>
          <VerifyOTP />
        </MemoryRouter>
    );

    const otpInput = screen.getByTestId('otp');

    // Enter valid OTP
    fireEvent.change(otpInput, { target: { value: '123456' } });

    // Submit the form
    fireEvent.click(screen.getByText(/Verify OTP/i));

    // Should show loading state
    expect(screen.getByText(/Verifying.../i)).toBeInTheDocument();

    // Wait for verification to complete
    await waitFor(() => {
      expect(authService.verifyOTP).toHaveBeenCalled();
    });
  });
});
