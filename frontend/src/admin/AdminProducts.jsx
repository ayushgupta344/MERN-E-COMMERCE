
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";
import "../styles/admin.css";

const stockBadge = (stock) => {
  if (stock <= 0)
    return <span className="stock-pill stock-out">Out of stock</span>;
  if (stock <= 5)
    return <span className="stock-pill stock-low">{stock} left</span>;
  return <span className="stock-pill stock-ok">{stock} in stock</span>;
};

const AdminProducts = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        toast.error("Could not load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product? This cannot be undone.",
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        toast.success("Product deleted");
      } else {
        const data = await res.json();
        toast.error(data.message || "Could not delete product");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>
          Manage <span>Products</span>
        </h2>
        <Link to="/admin/add-product" className="btn">
          + Add Product
        </Link>
      </div>

      {loading ? (
        <Spinner label="Loading products..." />
      ) : products.length === 0 ? (
        <p className="admin-empty">
          No products yet. Add your first one to get started.
        </p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="mono">{product._id.substring(0, 8)}...</td>
                  <td>{product.name}</td>
                  <td>₹{product.price.toFixed(2)}</td>
                  <td>{product.category}</td>
                  <td>{stockBadge(product.stock)}</td>
                  <td>
                    <Link
                      to={`/admin/edit-product/${product._id}`}
                      className="icon-btn icon-btn-edit"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="icon-btn icon-btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;