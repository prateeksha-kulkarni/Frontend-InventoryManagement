import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../../components/Input/Input';

describe('Input Component', () => {
  test('renders input with label', () => {
    render(<Input id="email" label="Email" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  test('displays required asterisk when required=true', () => {
    render(<Input id="username" label="Username" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  test('renders error message if error is passed', () => {
    render(<Input id="input1" label="Name" error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  test('input value updates on change', () => {
    const handleChange = jest.fn();
    render(<Input id="test" name="test" value="old" onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('renders disabled input when disabled=true', () => {
    render(<Input id="disabled" label="Disabled Input" disabled />);
    expect(screen.getByLabelText(/disabled input/i)).toBeDisabled();
  });

  test('applies placeholder when given', () => {
    render(<Input id="input2" placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });
});
