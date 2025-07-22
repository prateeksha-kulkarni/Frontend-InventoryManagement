import React from 'react';
import styled from 'styled-components';

const AddProduct = () => {
  return (
    <StyledWrapper>
      <button type="button" className="button">
        <span className="button__text">Add Item</span>
        <span className="button__icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            stroke="#fff" // blue-600/white icon
            fill="none"
            className="svg"
            style={{ borderRadius: '8px' }} // rounded icon
          >
            <line y2={19} y1={5} x2={12} x1={12} />
            <line y2={12} y1={12} x2={19} x1={5} />
          </svg>
        </span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .button {
    position: relative;
    width: 150px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    border: 1px solid #2563eb; /* blue-600 */
    background-color: #2563eb;  /* blue-600 */
    transition: background 0.3s, border 0.3s;
    border-radius: 8px; /* rounded corners */
  }

  .button, .button__icon, .button__text {
    transition: all 0.3s;
  }

  .button .button__text {
    transform: translateX(30px);
    color: #fff;
    font-weight: 600;
  }

  .button .button__icon {
    position: absolute;
    transform: translateX(109px);
    height: 100%;
    width: 39px;
    background-color: #2563eb; /* blue-600 */
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px; /* rounded icon background */
  }

  .button .svg {
    width: 30px;
    stroke: #fff;
    border-radius: 8px; /* rounded icon */
    background: transparent;
  }

  .button:hover {
    background: #1d4ed8; /* blue-700 */
    border: 1px solid #1d4ed8; /* blue-700 */
  }

  .button:hover .button__icon {
    background-color: #1d4ed8; /* blue-700 */
  }

  .button:hover .button__text {
    color: transparent;
  }

  .button:hover .button__icon {
    width: 148px;
    transform: translateX(0);
  }

  .button:active .button__icon {
    background-color: #1e40af; /* blue-800 for pressed */
  }

  .button:active {
    border: 1px solid #1e40af; /* blue-800 for pressed */
  }
`;

export default AddProduct;
