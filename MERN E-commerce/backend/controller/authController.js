const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/sendEmail");
const generateToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30d"})   
}
const registerUser = async (req, res) => {
    const { name, email, password } = req.body; 
    try {
        const existingUser = await User.findOne({ email})
        if(existingUser){
            return res.status(400).json({ message: "User already exists"})
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const user = await User.create({ name, email, password: hashedPassword})
        if(user){
            const otp= Math.floor(100000 + Math.random() * 900000)
            const message=
            `Welcome to ShopNest,${name}! Thank you for registering.
             Your OTP for ShopNest is ${otp}` 
            await sendEmail(email, "Welcome to ShopNest - Your OTP for registration!", message)
        }
        res.status(201).json(
            {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                message: "User registered successfully. Please check your email for the OTP."
            }
        )
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if(user && (await bcrypt.compare(password, user.password))){
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,    
                token: generateToken(user._id),
            })
        } else {
            res.status(401).json({ message: "Invalid email or password" })
        }  
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    } 
} 
const getUsers = async (req, res) => {
    try{
        const users = await User.find({}).select("-password");
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }  
}
module.exports = { registerUser, loginUser, getUsers };  