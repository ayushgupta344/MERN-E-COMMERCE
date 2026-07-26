const express = require('express')
const router = express.Router()
const {createdOrder,verifyPayment} = require('../controller/paymentController')
router.post('/order',createdOrder)
router.post('/verify',verifyPayment)
module.exports = router