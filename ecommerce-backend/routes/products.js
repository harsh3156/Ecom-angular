const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// @route GET /api/products
router.get('/', asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 12, sort = '-createdAt' } = req.query;
  const query = {};

  if (category && category !== 'all') query.category = category;
  if (search) query.name = { $regex: search, $options: 'i' };

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sort)
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    products,
  });
}));

// @route GET /api/products/categories/all - must be before /:id
router.get('/categories/all', asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json({ success: true, categories });
}));

// @route GET /api/products/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, product });
}));

// Multer error handler - wraps upload to catch multer errors
const handleUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large. Max 5MB allowed.' });
      }
      if (err.message === 'Only image files are allowed') {
        return res.status(400).json({ success: false, message: err.message });
      }
      return next(err);
    }
    next();
  });
};

// @route POST /api/products
router.post('/', protect, adminOnly, handleUpload, asyncHandler(async (req, res) => {
  const { name, description, price, category, stock } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    category,
    stock: Number(stock),
    image,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, message: 'Product created successfully', product });
}));

// @route PUT /api/products/:id
router.put('/:id', protect, adminOnly, handleUpload, asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const { name, description, price, category, stock } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : product.image;

  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    { name, description, price: Number(price), category, stock: Number(stock), image, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  res.json({ success: true, message: 'Product updated successfully', product: updated });
}));

// @route DELETE /api/products/:id
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Product deleted successfully' });
}));

module.exports = router;
