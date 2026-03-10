// controllers/reviewController.js
const Review = require('../models/Review')

// GET /api/reviews/:productId
exports.getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).populate('userId', 'name avatar')
    res.status(200).json(reviews)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/reviews
const mongoose = require('mongoose')

exports.createReview = async (req, res) => {
  const { productId, rating, comment } = req.body

  console.log('📦 BODY:', req.body)
  console.log('🔐 USER:', req.user)

  if (!productId || !rating || !comment) {
    return res.status(400).json({ message: 'Missing fields' })
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid productId' })
  }

  try {
    const newReview = new Review({
      productId,
      userId: req.user.id,
      rating,
      comment,
    })
    await newReview.save()
    res.status(201).json(newReview)
  } catch (err) {
    console.error('❌ Error saving review:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'You can only edit your own review' });

    review.comment = req.body.comment || review.comment;
    review.rating = req.body.rating || review.rating;
    await review.save();

    res.json({ message: 'Review updated', review });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'You can only delete your own review' });

    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

