
import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";
import "../styles/product.css";
const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
        toast.error("Could not load products right now");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="home-container">
      <div className="hero-banner">
        <h1>Welcome to ShopNest</h1>
        <p>Discover the best products at unbeatable prices.</p>
        <Link
          to="/shop"
          className="btn"
          style={{ marginTop: "25px", display: "inline-block" }}
        >
          Shop Now
        </Link>
      </div>
      <h2>Featured Products</h2>
      {loading ? (
        <Spinner label="Loading products..." />
      ) : products.length === 0 ? (
        <p style={{ color: "#a1a1aa" }}>
          No products available right now. Check back soon!
        </p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;