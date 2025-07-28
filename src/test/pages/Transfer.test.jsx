import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Transfer from '../../pages/Transfer/Transfer';

// Mock child components
jest.mock('../../components/PendingRequests', () => ({ onNewRequestClick, onCountChange, onRefreshHistory }) => {
  // Call props to simulate state changes
  onCountChange?.(5);
  return (
    <div data-testid="pending-requests">
      PendingRequests
      <button onClick={() => onNewRequestClick()}>Open Modal</button>
      <button onClick={() => onRefreshHistory()}>Refresh History</button>
    </div>
  );
});

jest.mock('../../components/TransferHistory', () =>
  React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      refresh: jest.fn()
    }));
    props.onCountsChange?.({ total: 10, completedToday: 4 });
    return <div data-testid="transfer-history">TransferHistory</div>;
  })
);

jest.mock('../../components/TransferModal', () => ({ isOpen, onClose }) => {
  return isOpen ? (
    <div data-testid="transfer-modal">
      TransferModal
      <button onClick={onClose}>Close</button>
    </div>
  ) : null;
});

describe('Transfer Page', () => {
  test('renders page with heading and stats', () => {
    render(<Transfer />);

    expect(screen.getByText('Inter-Store Transfer')).toBeInTheDocument();
    expect(screen.getByText('Transfer products between store locations')).toBeInTheDocument();

    // Stat values updated via mock callbacks
    expect(screen.getByText('Pending Requests')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    expect(screen.getByText('Completed Today')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    expect(screen.getByText('Total Transfers')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  test('opens and closes TransferModal', () => {
    render(<Transfer />);

    // Open modal via mocked PendingRequests button
    fireEvent.click(screen.getByText('Open Modal'));
    expect(screen.getByTestId('transfer-modal')).toBeInTheDocument();

    // Close modal via button inside modal
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('transfer-modal')).not.toBeInTheDocument();
  });
});
