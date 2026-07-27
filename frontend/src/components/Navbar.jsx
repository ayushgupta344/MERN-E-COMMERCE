import React from "react";
import { Link } from "react-router-dom";
const Navbar = () => {
  return (
    <nav className="navbar">
        <div className="navbar_brand">
            <Link to="/">
            <img src="/logo.png" alt="Logo" className="navbar_logo" />
            Shopnest</Link>
        </div>
        <ul className="navbar_links">
            <li><Link to="/Shop">Shop</Link></li>
            <li><Link to="/Cart">Cart</Link></li>
            <li><Link to="/Profile">Profile</Link></li>
        </ul>
    </nav>
  );
}   
export default Navbar;  