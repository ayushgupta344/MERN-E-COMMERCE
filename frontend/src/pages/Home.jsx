import React from 'react'
import {Link} from 'react-router-dom'
const Home = () => {
  return (
    <div className="home">
        <h1>Welcome to Shopnest</h1>
        <p>Your one-stop shop for all your needs.</p>
        <Link to="/Shop" className="shop_now_button">Shop Now</Link> 
        </div>
  )
}
export default Home