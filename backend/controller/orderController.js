const Order=require("../models/Order");
const {sendEmail}=require("../utils/sendEmail");

// Create a new order
const createOrder = async (req, res) => {
  try {
    const {items, totalAmount, address, paymentId } = req.body;
    if(!items || !totalAmount || !address) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    else {
      const order = new Order({
        userId: req.user._id,
        items,
        totalAmount,
        address,
        paymentId,
      });
      await order.save(); 
      const message = ` Dear ${req.user.name}, \nYour order has been placed successfully.\n Order ID: ${order._id} Address: ${address.fullName}, ${address.street}, ${address.city}, ${address.postalCode}, ${address.country}. \nTotal Amount: $${totalAmount}. \nThank you for shopping with us!`;
      await sendEmail(req.user.email, "Order Confirmation", message);
      res.status(201).json({ message: "Order created successfully", order });
    } 
}
    catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }   
}
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).populate("items.productId", "name price");
    res.status(200).json(orders);
  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  } 
}
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("userId", "id name")
    res.status(200).json(orders);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }   
    order.status = status;
    await order.save();
    res.status(200).json({ message: "Order status updated successfully", order });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
module.exports = { createOrder, getOrders, getMyOrders, updateOrderStatus };




