import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Notification from '../../components/Notification/Notification';

describe('Notification component', () => {
  test('renders bell icon', () => {
    render(<Notification />);
    const bellIcon = screen.getByTestId('bell-icon');
    expect(bellIcon).toBeInTheDocument();
  });

  test('does not show badge when count is 0', () => {
    render(<Notification count={0} />);
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
  });

  test('shows badge when count > 0', () => {
    render(<Notification count={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('calls onClick handler', () => {
    const handleClick = jest.fn();
    render(<Notification count={3} onClick={handleClick} />);
    const wrapper = screen.getByTestId('notification-wrapper');
    fireEvent.click(wrapper);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
