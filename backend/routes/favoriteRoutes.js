const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const Favorite = require('../models/Favorite');

// Get all favorites của user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id })
      .populate('productId'); // lấy full thông tin product
    res.json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if product is favorited
router.get('/check/:productId', authMiddleware, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      userId: req.user.id,
      productId: req.params.productId
    });
    
    res.json({ isFavorite: !!favorite });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle favorite (add/remove)
router.post('/toggle/:productId', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const existing = await Favorite.findOne({ userId: req.user.id, productId });

    if (existing) {
      await existing.deleteOne();
      return res.json({ isFavorite: false });
    } else {
      await Favorite.create({ userId: req.user.id, productId });
      return res.json({ isFavorite: true });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove favorite
router.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    await Favorite.deleteOne({ userId: req.user.id, productId });
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;