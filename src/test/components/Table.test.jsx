import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Table from '../../components/Table/Table';

const columns = [
  { header: 'Name', accessor: 'name' },
  { header: 'Age', accessor: 'age' },
];

const data = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
];

describe('Table component', () => {
  test('renders loading state', () => {
    render(<Table isLoading={true} columns={columns} data={[]} />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  test('renders empty state', () => {
    render(<Table isLoading={false} columns={columns} data={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  test('renders table headers and data rows', () => {
    render(<Table columns={columns} data={data} />);
    
    // Headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();

    // Data
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  test('calls onRowClick when row is clicked', () => {
    const onRowClick = jest.fn();
    render(<Table columns={columns} data={data} onRowClick={onRowClick} />);
    
    const row = screen.getByText('Alice').closest('tr');
    fireEvent.click(row);

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  test('renders custom cell with render function', () => {
    const customColumns = [
      { header: 'Name', accessor: 'name', render: row => `Hello ${row.name}` }
    ];
    render(<Table columns={customColumns} data={[{ name: 'John' }]} />);
    expect(screen.getByText('Hello John')).toBeInTheDocument();
  });
});
