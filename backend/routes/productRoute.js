// routes/productRoute.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Thêm sản phẩm
router.post('/', productController.createProduct);

// Lấy danh sách sản phẩm
router.get('/', productController.getAllProducts);

// Lấy chi tiết sản phẩm theo ID
router.get('/:id', productController.getProductById);

router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);


module.exports = router;
