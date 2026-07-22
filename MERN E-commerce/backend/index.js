const express = require('express')
const cors =  require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes')
dotenv.config()
connectDB()

const app = express()
app.use(cors())
app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))
app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.use('/api/auth',userRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
