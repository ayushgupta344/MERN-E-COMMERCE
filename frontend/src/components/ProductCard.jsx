
import React from "react";
import { Link } from "react-router-dom";
import "../styles/product.css";

const ProductCard = ({ product }) => {
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;

  return (
    <div className="product-card">
      <div style={{ position: "relative" }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-image"
          style={
            outOfStock ? { filter: "grayscale(60%) opacity(0.6)" } : undefined
          }
        />
        {outOfStock && (
          <span className="card-badge card-badge-out">Out of Stock</span>
        )}
        {lowStock && (
          <span className="card-badge card-badge-low">
            Only {product.stock} left
          </span>
        )}
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="price">₹{product.price}</p>
        <Link to={`/product/${product._id}`} className="btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;