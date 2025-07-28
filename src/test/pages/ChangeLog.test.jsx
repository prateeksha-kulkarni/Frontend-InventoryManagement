import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ChangeLog from '../../pages/ChangeLog/ChangeLog';
import authService from '../../services/authService';
import axios from 'axios';

// Mock components used inside ChangeLog
jest.mock('../../components/Card/Card', () => ({ children }) => <div>{children}</div>);
jest.mock('../../components/Table/Table', () => ({ data, isLoading }) => (
  <div>{isLoading ? 'Loading...' : data.map(item => <div key={item.id}>{item.productName}</div>)}</div>
));
jest.mock('../../components/Input/Input', () => (props) => (
  <input {...props} data-testid={`input-${props.name}`} />
));

// Mock services
jest.mock('axios');
jest.mock('../../services/authService');

describe('ChangeLog component', () => {
  beforeEach(() => {
    authService.getCurrentUser.mockReturnValue({
      userId: '123',
      storeId: 'store123',
    });

    authService.getToken.mockReturnValue('test-token');
    authService.getRole.mockReturnValue('ADMIN');

    axios.get.mockImplementation((url) => {
      if (url.includes('transfers')) {
        return Promise.resolve({
          data: [
            {
              transferId: 't1',
              timestamp: '2024-07-27T10:00:00Z',
              product: { name: 'Product A' },
              status: 'COMPLETED',
              fromStore: { storeId: 'store123', name: 'Store A' },
              toStore: { storeId: 'store456', name: 'Store B' },
              quantity: 5,
              requestedBy: { name: 'Alice' }
            }
          ]
        });
      } else if (url.includes('stock-adjustments')) {
        return Promise.resolve({
          data: [
            {
              adjustmentId: 'a1',
              timestamp: '2024-07-27T09:00:00Z',
              product: { name: 'Product B' },
              changeType: 'REMOVE',
              quantityChange: 3,
              reason: 'Damage',
              user: { userId: '123', name: 'Bob' }
            }
          ]
        });
      }
      return Promise.resolve({ data: [] });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders ChangeLog and displays log data', async () => {
    render(<ChangeLog />);

    expect(screen.getByText(/Change Log/i)).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument();
      expect(screen.getByText('Product B')).toBeInTheDocument();
    });
  });

  test('filters data by search term', async () => {
    render(<ChangeLog />);

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument();
      expect(screen.getByText('Product B')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('input-searchTerm'), {
      target: { value: 'Product A' }
    });

    expect(screen.getByTestId('input-searchTerm').value).toBe('Product A');

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument();
      expect(screen.queryByText('Product B')).not.toBeInTheDocument();
    });
  });
});
