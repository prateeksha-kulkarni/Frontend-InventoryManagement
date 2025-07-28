// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import ForgotPassword from '../../pages/ForgotPassword/ForgotPassword';
// import { MemoryRouter } from 'react-router-dom';
// import authService from '../../services/authService';
// import { toast } from 'react-toastify';
//
// jest.mock('../../services/authService');
//
// jest.mock('../../components/LeftPanel/LeftPanel', () => () => (
//   <div data-testid="left-panel">LeftPanel</div>
// ));
//
// jest.mock('../../components/Input/Input', () => (props) => (
//   <input
//     data-testid="email-input"
//     type="email"
//     value={props.value}
//     onChange={props.onChange}
//     placeholder={props.placeholder}
//   />
// ));
//
// jest.mock('../../components/Button/Button', () => (props) => (
//   <button onClick={props.onClick} disabled={props.disabled}>
//     {props.children}
//   </button>
// ));
//
// describe('ForgotPassword', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//     sessionStorage.clear();
//   });
//
//   test('renders UI elements correctly', () => {
//     render(
//       <MemoryRouter>
//         <ForgotPassword />
//       </MemoryRouter>
//     );
//
//     expect(screen.getByText(/Password Recovery/i)).toBeInTheDocument();
//     expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
//     expect(screen.getByText(/Send OTP/i)).toBeInTheDocument();
//   });
//
//   test('sends OTP successfully and navigates to verify page', async () => {
//     const mockNavigate = jest.fn();
//     jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
//     authService.forgotPassword.mockResolvedValueOnce({});
//
//     render(
//       <MemoryRouter>
//         <ForgotPassword />
//       </MemoryRouter>
//     );
//
//     const emailInput = screen.getByTestId('email-input');
//     const submitBtn = screen.getByText(/Send OTP/i);
//
//     fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
//     fireEvent.click(submitBtn);
//
//     await waitFor(() => {
//       expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
//       expect(sessionStorage.getItem('resetEmail')).toBe('test@example.com');
//     });
//
//     await waitFor(() => {
//       expect(mockNavigate).toHaveBeenCalledWith('/verify-otp');
//     });
//   });
//
//   test('shows error toast on failure', async () => {
//     authService.forgotPassword.mockRejectedValueOnce(new Error('Error'));
//
//     render(
//       <MemoryRouter>
//         <ForgotPassword />
//       </MemoryRouter>
//     );
//
//     fireEvent.change(screen.getByTestId('email-input'), {
//       target: { value: 'test@example.com' },
//     });
//     fireEvent.click(screen.getByText(/Send OTP/i));
//
//     await waitFor(() => {
//       expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
//     });
//
//     expect(await screen.findByText(/Failed to send OTP/i)).toBeInTheDocument();
//   });
// });


import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPassword from '../../pages/ForgotPassword/ForgotPassword';
import { MemoryRouter } from 'react-router-dom';
import authService from '../../services/authService';
import { toast } from 'react-toastify';

jest.mock('../../services/authService');

// Mock the entire react-router-dom module
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../components/LeftPanel/LeftPanel', () => () => (
    <div data-testid="left-panel">LeftPanel</div>
));

jest.mock('../../components/Input/Input', () => (props) => (
    <input
        data-testid="email-input"
        type="email"
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
    />
));

jest.mock('../../components/Button/Button', () => (props) => (
    <button onClick={props.onClick} disabled={props.disabled}>
      {props.children}
    </button>
));

describe('ForgotPassword', () => {
  // Store original console.error
  let originalConsoleError;

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    mockNavigate.mockClear();

    // Store and mock console.error before each test
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    // Restore original console.error after each test
    console.error = originalConsoleError;
  });

  test('renders UI elements correctly', () => {
    render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
    );

    expect(screen.getByText(/Password Recovery/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
    expect(screen.getByText(/Send OTP/i)).toBeInTheDocument();
  });

  test('sends OTP successfully and shows success message', async () => {
    authService.forgotPassword.mockResolvedValueOnce({});

    render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
    );

    const emailInput = screen.getByTestId('email-input');
    const submitBtn = screen.getByText(/Send OTP/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitBtn);

    // Test the core functionality
    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    });

    await waitFor(() => {
      expect(sessionStorage.getItem('resetEmail')).toBe('test@example.com');
    });

    // Verify success toast appears
    await waitFor(() => {
      expect(screen.getByText(/OTP sent to your email/i)).toBeInTheDocument();
    });
  });

  test('navigation is called after successful OTP send', async () => {
    authService.forgotPassword.mockImplementation(() => {
      // Simulate async operation
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({});
        }, 100);
      });
    });

    render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
    );

    const emailInput = screen.getByTestId('email-input');
    const submitBtn = screen.getByText(/Send OTP/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitBtn);

    // Wait for all async operations to complete
    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    });

    await waitFor(() => {
      expect(sessionStorage.getItem('resetEmail')).toBe('test@example.com');
    });

    await waitFor(() => {
      expect(screen.getByText(/OTP sent to your email/i)).toBeInTheDocument();
    });

    // Final check for navigation with generous timeout
    await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('/verify-otp');
        },
        { timeout: 3000, interval: 100 }
    );
  });

  test('shows error toast on failure', async () => {
    authService.forgotPassword.mockRejectedValueOnce(new Error('Network Error'));

    render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByText(/Send OTP/i));

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    });

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to send OTP/i)).toBeInTheDocument();
    });

    // Optionally verify that console.error was called
    expect(console.error).toHaveBeenCalledWith(expect.any(Error));
  });

  // Alternative approach: Test only for this specific test case
  test('shows error toast on failure (alternative approach)', async () => {
    // Mock console.error only for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    authService.forgotPassword.mockRejectedValueOnce(new Error('Network Error'));

    render(
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
    );

    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByText(/Send OTP/i));

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to send OTP/i)).toBeInTheDocument();
    });

    // Verify console.error was called with the error
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));

    // Restore the original console.error
    consoleSpy.mockRestore();
  });
});