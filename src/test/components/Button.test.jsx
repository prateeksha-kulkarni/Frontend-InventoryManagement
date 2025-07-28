import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../components/Button/Button';




describe('Button Component', () => {
  test('renders with default props', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('button'); // basic class
  });

  test('applies variant and size classes', () => {
    render(<Button variant="secondary" size="large">Submit</Button>);
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button.className).toMatch(/button-secondary/);
    expect(button.className).toMatch(/button-large/);
  });

  test('handles fullWidth prop', () => {
    render(<Button fullWidth>Wide</Button>);
    const button = screen.getByRole('button', { name: /wide/i });
    expect(button.className).toMatch(/button-full-width/);
  });

  test('is disabled when disabled=true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    const button = screen.getByRole('button', { name: /click/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
