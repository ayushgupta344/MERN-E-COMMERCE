
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";
import "../styles/admin.css";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/analytics", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        } else {
          if (res.status === 401) {
            navigate("/login");
          }
          toast.error(data.message || "Could not load dashboard stats");
          setStats({
            totalOrders: 0,
            totalProducts: 0,
            totalUsers: 0,
            totalRevenue: 0,
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Could not load dashboard stats");
      }
    };
    fetchStats();
  }, [user, navigate]);

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          marginBottom: "5px",
        }}
      >
        <img
          src="/ShopNestLogo.png"
          alt="Logo"
          style={{
            height: "40px",
            width: "40px",
            borderRadius: "8px",
            objectFit: "cover",
            filter: "drop-shadow(0 0px 10px rgba(249, 115, 22, 0.3))",
          }}
        />
        <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
      </div>
      <p style={{ color: "#a1a1aa", marginBottom: "30px", fontSize: "1.1rem" }}>
        Welcome back, <span style={{ color: "#fff" }}>{user?.name}</span>
      </p>

      {stats ? (
        <div className="stat-grid">
          <div className="stat-card">
            <h4>Total Orders</h4>
            <div className="stat-number">{stats.totalOrders}</div>
          </div>
          <div className="stat-card">
            <h4>Total Products</h4>
            <div className="stat-number">{stats.totalProducts}</div>
          </div>
          <div className="stat-card">
            <h4>Total Users</h4>
            <div className="stat-number">{stats.totalUsers}</div>
          </div>
          <div className="stat-card">
            <h4>Total Revenue</h4>
            <div className="stat-number">₹{stats.totalRevenue.toFixed(2)}</div>
          </div>
        </div>
      ) : (
        <Spinner label="Loading metrics..." />
      )}

      <div
        style={{
          marginTop: "40px",
          padding: "30px",
          background: "#18181b",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <h3 style={{ marginBottom: "25px", color: "#f97316" }}>
          Administrative Controls
        </h3>
        <div className="quick-actions">
          <button
            className="btn"
            onClick={() => navigate("/admin/add-product")}
          >
            + Add Product
          </button>
          <button
            className="btn"
            onClick={() => navigate("/admin/products")}
            style={{ background: "#3f3f46" }}
          >
            📦 Manage Products
          </button>
          <button
            className="btn"
            onClick={() => navigate("/admin/orders")}
            style={{ background: "#3f3f46" }}
          >
            🚚 Manage Orders
          </button>
          <button
            className="btn"
            onClick={() => navigate("/admin/users")}
            style={{ background: "#3f3f46" }}
          >
            👥 Users Directory
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;