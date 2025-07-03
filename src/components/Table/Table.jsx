import React from 'react';
import styles from './Table.module.css';

const Table = ({ 
  columns, 
  data, 
  onRowClick,
  isLoading = false,
  emptyMessage = 'No data available',
  className = '',
  ...props 
}) => {
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={`${styles.table} ${className}`} {...props}>
        <thead className={styles.tableHeader}>
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index} 
                className={styles.tableHeaderCell}
                style={{ width: column.width || 'auto' }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={`${styles.tableRow} ${onRowClick ? styles.clickable : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={styles.tableCell}>
                  {column.render ? column.render(row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;