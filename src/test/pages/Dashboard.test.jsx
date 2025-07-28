import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Dashboard from '../../pages/Dashboard/Dashboard';
import authService from '../../services/authService';
import axios from '../../services/axiosConfig';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock UI and subcomponents
jest.mock('../../components/Table/Table', () => ({ columns, data }) => (
  <div data-testid="table">{data.map((d) => <div key={d.product.sku}>{d.product.name}</div>)}</div>
));
jest.mock('../../components/Card/Card', () => ({ children, className }) => <div className={className}>{children}</div>);
jest.mock('../../components/Ui/Search', () => (props) => (
  <input {...props} data-testid="search-input" />
));
jest.mock('../../components/Ui/Button', () => (props) => (
  <button {...props} data-testid="add-button">{props.children}</button>
));
jest.mock('../../components/Ui/ShadDropdown', () => ({ onChange }) => (
  <select data-testid="dropdown" onChange={(e) => onChange(e.target.value)}>
    <option value="">All</option>
    <option value="ELECTRONICS">ELECTRONICS</option>
  </select>
));
jest.mock('../../pages/AddProduct/AddProductModal', () => () => <div data-testid="add-modal" />);
jest.mock('../../pages/StockAdjustment/StockAdjustmentModal', () => () => <div data-testid="adjust-modal" />);
jest.mock('../../services/authService', () => ({
  getCurrentUser: jest.fn(),
  getToken: jest.fn(),
}));
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    hasRole: (role) => role === 'Admin', // Always return Admin access
  }),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  },
  ToastContainer: () => <div />
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    authService.getCurrentUser.mockReturnValue({ storeId: 'store123' });

    axios.get.mockImplementation((url) => {
      if (url.includes('/inventory/store')) {
        return Promise.resolve({
          data: [
            {
              product: {
                name: 'Laptop',
                sku: 'LP123',
                category: 'ELECTRONICS',
                description: 'High-end laptop',
              },
              quantity: 10,
              minThreshold: 5,
              status: 'STOCK_OK'
            }
          ]
        });
      }

      if (url.includes('/stores/')) {
        return Promise.resolve({ data: { name: 'Main Store' } });
      }

      if (url.includes('/inventory/search')) {
        return Promise.resolve({ data: [] });
      }

      return Promise.resolve({ data: [] });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard with inventory data', async () => {
    render(
      <Router>
        <Dashboard />
      </Router>
    );

    expect(screen.getByText('Inventory Dashboard')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by product/i)).toBeInTheDocument();
    expect(screen.getByTestId('add-button')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });
  });

  test('filters inventory based on search input', async () => {
    render(
      <Router>
        <Dashboard />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'phone' } });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/inventory/search?query=phone'),
        expect.any(Object)
      );
    });
  });

  test('opens AddProduct modal when Add Product button is clicked', async () => {
    render(
      <Router>
        <Dashboard />
      </Router>
    );

    fireEvent.click(screen.getByTestId('add-button'));

    await waitFor(() => {
      expect(screen.getByTestId('add-modal')).toBeInTheDocument();
    });
  });
});
