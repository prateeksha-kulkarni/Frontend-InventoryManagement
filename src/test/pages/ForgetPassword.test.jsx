import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPassword from '../../pages/ForgotPassword/ForgotPassword';
import { MemoryRouter } from 'react-router-dom';
import authService from '../../services/authService';

jest.mock('../../services/authService');

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
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
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

  test('sends OTP successfully and navigates to verify page', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
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

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(sessionStorage.getItem('resetEmail')).toBe('test@example.com');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/verify-otp');
    });
  });

  test('shows error toast on failure', async () => {
    authService.forgotPassword.mockRejectedValueOnce(new Error('Error'));

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

    expect(await screen.findByText(/Failed to send OTP/i)).toBeInTheDocument();
  });
});
