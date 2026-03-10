// routes/reviewRoute.js
const express = require('express')
const router = express.Router()
const { createReview, getReviewsByProduct } = require('../controllers/reviewController')
const authMiddleware = require('../middlewares/authMiddleware')

// Get all reviews of a product
router.get('/:productId', getReviewsByProduct)

// Create review (login required)
router.post('/', authMiddleware, createReview)

// Edit reviews
// router.put('/:id', authMiddleware, updateReview);

// // Delete reviews
// router.delete('/:id', authMiddleware, deleteReview);

module.exports = router
