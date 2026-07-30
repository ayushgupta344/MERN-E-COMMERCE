import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "100px 20px",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "5rem", color: "#f97316", marginBottom: "10px" }}>
        404
      </h1>
      <h2 style={{ marginBottom: "15px" }}>Page Not Found</h2>
      <p style={{ color: "#a1a1aa", marginBottom: "30px" }}>
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="btn">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
