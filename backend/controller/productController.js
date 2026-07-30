
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// Uploads a buffer (from multer memoryStorage) to Cloudinary without touching disk.
// This matters because serverless platforms like Vercel have a read-only,
// ephemeral filesystem - writing to ./uploads works locally but breaks in production.
const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "shopnest/products" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (!name || !description || !price || !category || stock === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let imageUrl = "";

    if (req.file) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer);
        imageUrl = result.secure_url;
      } catch (cloudErr) {
        console.error("CLOUDINARY UPLOAD ERROR:", cloudErr.message);
        return res.status(500).json({
          message: "Cloudinary upload failed",
          error: cloudErr.message,
        });
      }
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      imageUrl,
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.file) {
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer);
        product.imageUrl = result.secure_url;
      } catch (cloudErr) {
        console.error("CLOUDINARY UPLOAD ERROR:", cloudErr.message);
        return res.status(500).json({
          message: "Cloudinary upload failed",
          error: cloudErr.message,
        });
      }
    }

    // Use `!== undefined` rather than `||` so that legitimate falsy values
    // like price 0 or stock 0 don't silently get ignored.
    product.name = name !== undefined ? name : product.name;
    product.description =
      description !== undefined ? description : product.description;
    product.price = price !== undefined ? price : product.price;
    product.category = category !== undefined ? category : product.category;
    product.stock = stock !== undefined ? stock : product.stock;

    const updatedProduct = await product.save();

    res.json(updatedProduct);
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};