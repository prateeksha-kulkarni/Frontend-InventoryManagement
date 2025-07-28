import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// ✅ Mock react-modal to prevent crash from setAppElement
jest.mock("react-modal", () => {
  const actual = jest.requireActual("react-modal");
  return {
    ...actual,
    setAppElement: () => null,
  };
});

// ✅ Mock axiosConfig service
jest.mock("../../services/axiosConfig", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

import AddProductModal from "../../pages/AddProduct/AddProductModal";
import axios from "../../services/axiosConfig";
console.log("Component type:", AddProductModal);
// ✅ Helper render setup
const mockOnClose = jest.fn();
const mockReloadDashboard = jest.fn();

const setup = (props = {}) => {
  return render(
    <BrowserRouter>
      <ToastContainer />
      <AddProductModal
        isOpen={true}
        onClose={mockOnClose}
        storeId="store-1"
        reloadDashboard={mockReloadDashboard}
        {...props}
      />
    </BrowserRouter>
  );
};

describe("AddProductModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders modal with inputs", () => {
    setup();
    expect(screen.getByPlaceholderText("Enter product name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter SKU")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter threshold")).toBeInTheDocument();
    expect(screen.getByText("Add New Product")).toBeInTheDocument();
  });

  test("shows error if product already exists in store", async () => {
    axios.get.mockImplementation((url) => {
      if (url === "/api/products") {
        return Promise.resolve({
          data: [{ productId: "p1", sku: "ABC123", name: "Test Product" }],
        });
      }
      if (url === "/api/inventory") {
        return Promise.resolve({
          data: [
            {
              product: { productId: "p1", name: "Test Product" },
              store: { storeId: "store-1" },
            },
          ],
        });
      }
    });

    setup();
    fireEvent.change(screen.getByPlaceholderText("Enter SKU"), {
      target: { name: "sku", value: "ABC123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter threshold"), {
      target: { name: "threshold", value: "5" },
    });

    fireEvent.click(screen.getByText("Add"));

    await waitFor(() =>
      expect(
        screen.getByText("This product already exists in this store.")
      ).toBeInTheDocument()
    );
  });

  test("adds new product and inventory if not present", async () => {
    axios.get.mockResolvedValueOnce({ data: [] }); // for /api/products
    axios.post.mockResolvedValueOnce({
      data: { productId: "newProductId" },
    }); // create product
    axios.post.mockResolvedValueOnce({}); // add to inventory

    setup();

    fireEvent.change(screen.getByPlaceholderText("Enter product name"), {
      target: { name: "name", value: "New Phone" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter SKU"), {
      target: { name: "sku", value: "NEW123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter threshold"), {
      target: { name: "threshold", value: "10" },
    });

    fireEvent.click(screen.getByText("Add"));

    await waitFor(() => {
      expect(mockReloadDashboard).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
