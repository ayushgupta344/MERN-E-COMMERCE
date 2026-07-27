import React from 'react'
import {Link} from 'react-router-dom'
const Footer = () => {
  return (
    <footer className="footer">
        <div className="footer_content">
            <p>&copy; 2024 Shopnest. All rights reserved.</p>
            <ul className="footer_links">
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
        </div>
    </footer>
  )
}
export default Footer