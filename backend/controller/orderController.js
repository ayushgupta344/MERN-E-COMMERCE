const Order = require("../models/Order");
const Product = require("../models/Product");
const { sendEmail } = require("../utils/sendEmail");

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, address, paymentId } = req.body;
    if (!items || !items.length || !totalAmount || !address) {
      return res.status(400).json({ message: "Missing required fields" });
    } else {
      // Verify stock availability before committing the order, then decrement it.
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res
            .status(404)
            .json({ message: `Product ${item.productId} not found` });
        }
        if (product.stock < item.qty) {
          return res
            .status(400)
            .json({ message: `Insufficient stock for ${product.name}` });
        }
      }
      await Promise.all(
        items.map((item) =>
          Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.qty },
          }),
        ),
      );

      const order = new Order({
        userId: req.user._id,
        items,
        totalAmount,
        address,
        paymentId,
      });
      await order.save();
      // Order is already saved at this point - a flaky email provider should
      // never turn a successful order into a 500 for the customer.
      // Fire the confirmation email without awaiting it - same reason as
      // registration: Gmail SMTP latency shouldn't hold up the order response.
      sendEmail(
        req.user.email,
        "Order Confirmation",
        ` Dear ${req.user.name}, \nYour order has been placed successfully.\n Order ID: ${order._id} Address: ${address.fullName}, ${address.street}, ${address.city}, ${address.postalCode}, ${address.country}. \nTotal Amount: ₹${totalAmount}. \nThank you for shopping with us!`,
      ).catch((emailError) => {
        console.error("Order confirmation email failed:", emailError.message);
      });
      res.status(201).json({ message: "Order created successfully", order });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).populate(
      "items.productId",
      "name price",
    );
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("userId", "id name");
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.status = status;
    await order.save();
    res
      .status(200)
      .json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { createOrder, getOrders, getMyOrders, updateOrderStatus };
