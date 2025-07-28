// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import StoreSetup from '../../pages/StoreSetup/StoreSetup';
// import axios from '../../services/axiosConfig';
// import { toast } from 'react-toastify';
//
// // Mock dependencies
// jest.mock('../../services/axiosConfig', () => ({
//   get: jest.fn(),
//   post: jest.fn(),
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
// jest.mock('../../components/Card/Card', () => ({ children, className }) => (
//   <div data-testid="card" className={className}>
//     {children}
//   </div>
// ));
//
// jest.mock('../../components/Table/Table', () => ({ columns, data, isLoading, emptyMessage }) => (
//   <div data-testid="table">
//     {isLoading ? (
//       <div>Loading...</div>
//     ) : data.length === 0 ? (
//       <div>{emptyMessage}</div>
//     ) : (
//       <table>
//         <thead>
//           <tr>
//             {columns.map((column) => (
//               <th key={column.accessor}>{column.header}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((row, index) => (
//             <tr key={index}>
//               {columns.map((column) => (
//                 <td key={column.accessor}>{row[column.accessor]}</td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     )}
//   </div>
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
// jest.mock('../../components/Button/Button', () => ({ children, type, variant, disabled, onClick }) => (
//   <button
//     type={type}
//     disabled={disabled}
//     onClick={onClick}
//     data-variant={variant}
//     data-testid={typeof children === 'string' ? children.replace(/\s+/g, '-').toLowerCase() : 'button'}
//   >
//     {children}
//   </button>
// ));
//
// describe('StoreSetup Component', () => {
//   const mockStores = [
//     { id: 1, name: 'Store 1', location: 'Address 1' },
//     { id: 2, name: 'Store 2', location: 'Address 2' },
//   ];
//
//   beforeEach(() => {
//     jest.clearAllMocks();
//     jest.useFakeTimers();
//     // Mock the API call to fetch stores
//     axios.get.mockImplementation((url) => {
//       if (url === '/api/stores') {
//         return Promise.resolve({ data: mockStores });
//       }
//       if (url.includes('/api/stores/check-name')) {
//         return Promise.resolve({ data: { exists: false } });
//       }
//       return Promise.reject(new Error('Not found'));
//     });
//
//     axios.post.mockResolvedValue({ data: { message: 'Store added successfully' } });
//   });
//
//   afterEach(() => {
//     jest.useRealTimers();
//   });
//
//   it('renders UI elements correctly and fetches stores', async () => {
//     render(<StoreSetup />);
//
//     // Check if the header is rendered
//     expect(screen.getByText('Store Setup')).toBeInTheDocument();
//     expect(screen.getByText('Add and manage store locations')).toBeInTheDocument();
//
//     // Check if the Add Store button is rendered
//     expect(screen.getByText('Add Store')).toBeInTheDocument();
//
//     // Check if the Existing Stores section is rendered
//     expect(screen.getByText('Existing Stores')).toBeInTheDocument();
//
//     // Wait for the stores to be fetched
//     await waitFor(() => {
//       expect(axios.get).toHaveBeenCalledWith('/api/stores');
//     });
//
//     // Check if the table is rendered with the fetched stores
//     expect(screen.getByTestId('table')).toBeInTheDocument();
//   });
//
//   // Skipping this test as it's causing issues with act warnings
//   it.skip('opens the add store modal when Add Store button is clicked', async () => {
//     render(<StoreSetup />);
//
//     // Wait for the stores to be fetched
//     await waitFor(() => {
//       expect(axios.get).toHaveBeenCalledWith('/api/stores');
//     });
//
//     // Click the Add Store button
//     fireEvent.click(screen.getByTestId('add-store'));
//
//     // Check if the modal is opened
//     await waitFor(() => {
//       expect(screen.getByText('Add New Store')).toBeInTheDocument();
//       expect(screen.getByTestId('name')).toBeInTheDocument();
//       expect(screen.getByTestId('address')).toBeInTheDocument();
//       expect(screen.getByText('Add Store')).toBeInTheDocument();
//       expect(screen.getByText('Cancel')).toBeInTheDocument();
//     });
//   });
//
//   // Skipping this test as it's causing issues with act warnings
//   it.skip('closes the modal when Cancel button is clicked', async () => {
//     render(<StoreSetup />);
//
//     // Wait for the stores to be fetched
//     await waitFor(() => {
//       expect(axios.get).toHaveBeenCalledWith('/api/stores');
//     });
//
//     // Click the Add Store button to open the modal
//     fireEvent.click(screen.getByTestId('add-store'));
//
//     // Check if the modal is opened
//     await waitFor(() => {
//       expect(screen.getByText('Add New Store')).toBeInTheDocument();
//     });
//
//     // Click the Cancel button
//     fireEvent.click(screen.getByText('Cancel'));
//
//     // Check if the modal is closed
//     await waitFor(() => {
//       expect(screen.queryByText('Add New Store')).not.toBeInTheDocument();
//     });
//   });
//
//   it('validates store name and shows error if it already exists', async () => {
//     // Mock the API call to check if store name exists
//     axios.get.mockImplementation((url) => {
//       if (url === '/api/stores') {
//         return Promise.resolve({ data: mockStores });
//       }
//       if (url.includes('/api/stores/check-name')) {
//         return Promise.resolve({ data: { exists: true } });
//       }
//       return Promise.reject(new Error('Not found'));
//     });
//
//     render(<StoreSetup />);
//
//     // Wait for the stores to be fetched
//     await waitFor(() => {
//       expect(axios.get).toHaveBeenCalledWith('/api/stores');
//     });
//
//     // Click the Add Store button to open the modal
//     fireEvent.click(screen.getByTestId('add-store'));
//
//     // Fill the form
//     fireEvent.change(screen.getByTestId('name'), { target: { value: 'Store 1' } });
//     fireEvent.change(screen.getByTestId('address'), { target: { value: 'Address 1' } });
//
//     // Submit the form
//     const addStoreButtons = screen.getAllByTestId('add-store');
//     // The second "Add Store" button is inside the modal
//     fireEvent.click(addStoreButtons[1]);
//
//     // Check if the API call to check store name is made
//     await waitFor(() => {
//       expect(axios.get).toHaveBeenCalledWith('/api/stores/check-name?name=Store%201');
//     });
//
//     // Check if the error toast is shown
//     expect(toast.error).toHaveBeenCalledWith('Store "Store 1" already exists.');
//
//     // Check if the form is not submitted
//     expect(axios.post).not.toHaveBeenCalled();
//   });
//
//   it('submits the form successfully with valid data', async () => {
//     render(<StoreSetup />);
//
//     // Wait for the stores to be fetched
//     await waitFor(() => {
//       expect(axios.get).toHaveBeenCalledWith('/api/stores');
//     });
//
//     // Click the Add Store button to open the modal
//     fireEvent.click(screen.getByTestId('add-store'));
//
//     // Fill the form
//     fireEvent.change(screen.getByTestId('name'), { target: { value: 'New Store' } });
//     fireEvent.change(screen.getByTestId('address'), { target: { value: 'New Address' } });
//
//     // Submit the form
//     const addStoreButtons = screen.getAllByTestId('add-store');
//     // The second "Add Store" button is inside the modal
//     fireEvent.click(addStoreButtons[1]);
//
//     // Check if the API call to check store name is made
//     await waitFor(() => {
//       expect(axios.get).toHaveBeenCalledWith('/api/stores/check-name?name=New%20Store');
//     });
//
//     // Check if the form is submitted
//     await waitFor(() => {
//       expect(axios.post).toHaveBeenCalledWith('/api/stores', {
//         name: 'New Store',
//         location: 'New Address'
//       });
//     });
//
//     // Check if the success toast is shown
//     expect(toast.success).toHaveBeenCalledWith('Store "New Store" added successfully');
//
//     // Check if the stores are fetched again
//     expect(axios.get).toHaveBeenCalledTimes(3); // Initial fetch + check name + refresh after add
//
//     // Check if the modal is closed
//     await waitFor(() => {
//       expect(screen.queryByText('Add New Store')).not.toBeInTheDocument();
//     });
//   });
//
//   it('handles API errors during form submission', async () => {
//     // Mock API error
//     axios.post.mockRejectedValueOnce({
//       response: { data: { message: 'Server error' } }
//     });
//
//     render(<StoreSetup />);
//
//     // Wait for the stores to be fetched
//     await waitFor(() => {
//       expect(axios.get).toHaveBeenCalledWith('/api/stores');
//     });
//
//     // Click the Add Store button to open the modal
//     fireEvent.click(screen.getByTestId('add-store'));
//
//     // Fill the form
//     fireEvent.change(screen.getByTestId('name'), { target: { value: 'New Store' } });
//     fireEvent.change(screen.getByTestId('address'), { target: { value: 'New Address' } });
//
//     // Submit the form
//     const addStoreButtons = screen.getAllByTestId('add-store');
//     // The second "Add Store" button is inside the modal
//     fireEvent.click(addStoreButtons[1]);
//
//     // Check if the API call to check store name is made
//     await waitFor(() => {
//       expect(axios.get).toHaveBeenCalledWith('/api/stores/check-name?name=New%20Store');
//     });
//
//     // Check if the form is submitted
//     await waitFor(() => {
//       expect(axios.post).toHaveBeenCalledWith('/api/stores', {
//         name: 'New Store',
//         location: 'New Address'
//       });
//     });
//
//     // Check if the error toast is shown
//     expect(toast.error).toHaveBeenCalledWith('Server error');
//   });
//
//   it('handles API errors during store fetch', async () => {
//     // Mock API error for fetching stores
//     axios.get.mockRejectedValueOnce(new Error('Failed to fetch'));
//
//     render(<StoreSetup />);
//
//     // Check if the error toast is shown
//     await waitFor(() => {
//       expect(toast.error).toHaveBeenCalledWith('Failed to fetch stores');
//     });
//   });
//
//   it('shows loading state during form submission', async () => {
//     // Mock delayed API response
//     let resolvePostPromise;
//     const postPromise = new Promise(resolve => {
//       resolvePostPromise = resolve;
//     });
//     axios.post.mockReturnValue(postPromise);
//
//     render(<StoreSetup />);
//
//     // Wait for the stores to be fetched
//     await waitFor(() => {
//       expect(axios.get).toHaveBeenCalledWith('/api/stores');
//     });
//
//     // Click the Add Store button to open the modal
//     fireEvent.click(screen.getByTestId('add-store'));
//
//     // Fill the form
//     fireEvent.change(screen.getByTestId('name'), { target: { value: 'New Store' } });
//     fireEvent.change(screen.getByTestId('address'), { target: { value: 'New Address' } });
//
//     // Submit the form
//     const addStoreButtons = screen.getAllByTestId('add-store');
//     // The second "Add Store" button is inside the modal
//     fireEvent.click(addStoreButtons[1]);
//
//     // Check if the loading state is shown
//     expect(screen.getByText('Adding...')).toBeInTheDocument();
//
//     // Resolve the post promise
//     resolvePostPromise({ data: { message: 'Success' } });
//
//     // Wait for the submission to complete
//     await waitFor(() => {
//       expect(axios.post).toHaveBeenCalled();
//     });
//   });
// });

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import StoreSetup from '../../pages/StoreSetup/StoreSetup';
import axios from '../../services/axiosConfig';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('../../services/axiosConfig', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

jest.mock('../../components/Card/Card', () => ({ children, className }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
));

jest.mock('../../components/Table/Table', () => ({ columns, data, isLoading, emptyMessage }) => (
    <div data-testid="table">
      {isLoading ? (
          <div>Loading...</div>
      ) : data.length === 0 ? (
          <div>{emptyMessage}</div>
      ) : (
          <table>
            <thead>
            <tr>
              {columns.map((column) => (
                  <th key={column.accessor}>{column.header}</th>
              ))}
            </tr>
            </thead>
            <tbody>
            {data.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                      <td key={column.accessor}>{row[column.accessor]}</td>
                  ))}
                </tr>
            ))}
            </tbody>
          </table>
      )}
    </div>
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

jest.mock('../../components/Button/Button', () => ({ children, type, variant, disabled, onClick, ...props }) => (
    <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        data-variant={variant}
        {...props}
    >
      {children}
    </button>
));

// Helper function to get the modal trigger button (outside form)
const getModalTriggerButton = () => {
  const allAddStoreButtons = screen.getAllByRole('button', { name: /add store/i });
  return allAddStoreButtons.find(btn => !btn.closest('form'));
};

// Helper function to get the submit button (inside form)
const getSubmitButton = () => {
  const allButtons = screen.getAllByRole('button');
  return allButtons.find(btn => btn.getAttribute('type') === 'submit');
};

describe('StoreSetup Component', () => {
  const mockStores = [
    { id: 1, name: 'Store 1', location: 'Address 1' },
    { id: 2, name: 'Store 2', location: 'Address 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the API call to fetch stores
    axios.get.mockImplementation((url) => {
      if (url === '/api/stores') {
        return Promise.resolve({ data: mockStores });
      }
      if (url.includes('/api/stores/check-name')) {
        return Promise.resolve({ data: { exists: false } });
      }
      return Promise.reject(new Error('Not found'));
    });

    axios.post.mockResolvedValue({ data: { message: 'Store added successfully' } });
  });

  it('renders UI elements correctly and fetches stores', async () => {
    await act(async () => {
      render(<StoreSetup />);
    });

    // Check if the header is rendered
    expect(screen.getByText('Store Setup')).toBeInTheDocument();
    expect(screen.getByText('Add and manage store locations')).toBeInTheDocument();

    // Check if the Add Store button is rendered
    expect(screen.getAllByText('Add Store').length).toBeGreaterThanOrEqual(1);

    // Check if the Existing Stores section is rendered
    expect(screen.getByText('Existing Stores')).toBeInTheDocument();

    // Wait for the stores to be fetched
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stores');
    });

    // Check if the table is rendered with the fetched stores
    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  it('opens the add store modal when Add Store button is clicked', async () => {
    await act(async () => {
      render(<StoreSetup />);
    });

    // Wait for the stores to be fetched
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stores');
    });

    // Click the Add Store button (the one outside the modal - not inside a form)
    await act(async () => {
      const modalTriggerButton = getModalTriggerButton();
      fireEvent.click(modalTriggerButton);
    });

    // Check if the modal is opened
    await waitFor(() => {
      expect(screen.getByText('Add New Store')).toBeInTheDocument();
      expect(screen.getByTestId('name')).toBeInTheDocument();
      expect(screen.getByTestId('address')).toBeInTheDocument();
      expect(screen.getAllByText('Add Store')).toHaveLength(2); // One outside modal, one inside
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('closes the modal when Cancel button is clicked', async () => {
    await act(async () => {
      render(<StoreSetup />);
    });

    // Wait for the stores to be fetched
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stores');
    });

    // Click the Add Store button to open the modal
    await act(async () => {
      const modalTriggerButton = getModalTriggerButton();
      fireEvent.click(modalTriggerButton);
    });

    // Check if the modal is opened
    await waitFor(() => {
      expect(screen.getByText('Add New Store')).toBeInTheDocument();
    });

    // Click the Cancel button
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    });

    // Check if the modal is closed
    await waitFor(() => {
      expect(screen.queryByText('Add New Store')).not.toBeInTheDocument();
    });
  });

  it('validates store name and shows error if it already exists', async () => {
    // Mock the API call to check if store name exists
    axios.get.mockImplementation((url) => {
      if (url === '/api/stores') {
        return Promise.resolve({ data: mockStores });
      }
      if (url.includes('/api/stores/check-name')) {
        return Promise.resolve({ data: { exists: true } });
      }
      return Promise.reject(new Error('Not found'));
    });

    await act(async () => {
      render(<StoreSetup />);
    });

    // Wait for the stores to be fetched
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stores');
    });

    // Click the Add Store button to open the modal
    await act(async () => {
      const modalTriggerButton = getModalTriggerButton();
      fireEvent.click(modalTriggerButton);
    });

    // Fill the form
    await act(async () => {
      fireEvent.change(screen.getByTestId('name'), { target: { value: 'Store 1' } });
      fireEvent.change(screen.getByTestId('address'), { target: { value: 'Address 1' } });
    });

    // Submit the form by finding the submit button (the one with type="submit")
    await act(async () => {
      const submitButton = getSubmitButton();
      fireEvent.click(submitButton);
    });

    // Check if the API call to check store name is made
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stores/check-name?name=Store%201');
    });

    // Check if the error toast is shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Store "Store 1" already exists.');
    });

    // Check if the form is not submitted
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('submits the form successfully with valid data', async () => {
    await act(async () => {
      render(<StoreSetup />);
    });

    // Wait for the stores to be fetched
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stores');
    });

    // Click the Add Store button to open the modal
    await act(async () => {
      const modalTriggerButton = getModalTriggerButton();
      fireEvent.click(modalTriggerButton);
    });

    // Fill the form
    await act(async () => {
      fireEvent.change(screen.getByTestId('name'), { target: { value: 'New Store' } });
      fireEvent.change(screen.getByTestId('address'), { target: { value: 'New Address' } });
    });

    // Submit the form by finding the submit button specifically
    await act(async () => {
      const submitButton = getSubmitButton();
      fireEvent.click(submitButton);
    });

    // Check if the API call to check store name is made
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stores/check-name?name=New%20Store');
    });

    // Check if the form is submitted
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/stores', {
        name: 'New Store',
        location: 'New Address'
      });
    });

    // Check if the success toast is shown
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Store "New Store" added successfully');
    });

    // Check if the stores are fetched again
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(3); // Initial fetch + check name + refresh after add
    });

    // Check if the modal is closed
    await waitFor(() => {
      expect(screen.queryByText('Add New Store')).not.toBeInTheDocument();
    });
  });

  it('handles API errors during form submission', async () => {
    // Mock API error
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Server error' } }
    });

    // Suppress console.error for this test to avoid noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      render(<StoreSetup />);
    });

    // Wait for the stores to be fetched
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stores');
    });

    // Click the Add Store button to open the modal
    await act(async () => {
      const modalTriggerButton = getModalTriggerButton();
      fireEvent.click(modalTriggerButton);
    });

    // Fill the form
    await act(async () => {
      fireEvent.change(screen.getByTestId('name'), { target: { value: 'New Store' } });
      fireEvent.change(screen.getByTestId('address'), { target: { value: 'New Address' } });
    });

    // Submit the form by finding the submit button specifically
    await act(async () => {
      const submitButton = getSubmitButton();
      fireEvent.click(submitButton);
    });

    // Check if the API call to check store name is made
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stores/check-name?name=New%20Store');
    });

    // Check if the form is submitted
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/stores', {
        name: 'New Store',
        location: 'New Address'
      });
    });

    // Check if the error toast is shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server error');
    });

    consoleSpy.mockRestore();
  });

  it('handles API errors during store fetch', async () => {
    // Mock API error for fetching stores
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch'));

    // Suppress console.error for this test to avoid noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      render(<StoreSetup />);
    });

    // Check if the error toast is shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch stores');
    });

    consoleSpy.mockRestore();
  });

  it('shows loading state during form submission', async () => {
    // Mock delayed API response
    let resolvePostPromise;
    const postPromise = new Promise(resolve => {
      resolvePostPromise = resolve;
    });
    axios.post.mockReturnValue(postPromise);

    await act(async () => {
      render(<StoreSetup />);
    });

    // Wait for the stores to be fetched
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/stores');
    });

    // Click the Add Store button to open the modal
    await act(async () => {
      const modalTriggerButton = getModalTriggerButton();
      fireEvent.click(modalTriggerButton);
    });

    // Fill the form
    await act(async () => {
      fireEvent.change(screen.getByTestId('name'), { target: { value: 'New Store' } });
      fireEvent.change(screen.getByTestId('address'), { target: { value: 'New Address' } });
    });

    // Submit the form
    await act(async () => {
      const submitButton = getSubmitButton();
      fireEvent.click(submitButton);
    });

    // Check if the loading state is shown
    await waitFor(() => {
      expect(screen.getByText('Adding...')).toBeInTheDocument();
    });

    // Resolve the post promise
    await act(async () => {
      resolvePostPromise({ data: { message: 'Success' } });
    });

    // Wait for the submission to complete
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });
});
