const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// @route  POST /api/orders
// @desc   Place a new order
// @access Private (logged-in users)
router.post('/', protect, asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No items in order' });
  }

  // Validate each item and check stock
  const orderItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
      });
    }

    orderItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.image,
    });

    totalAmount += product.price * item.quantity;

    // Decrement stock
    product.stock -= item.quantity;
    await product.save();
  }

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    totalAmount,
  });

  res.status(201).json({ success: true, message: 'Order placed successfully', order });
}));

// @route  GET /api/orders/my
// @desc   Get current user's orders
// @access Private
router.get('/my', protect, asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
}));

// @route  GET /api/orders
// @desc   Get all orders (admin)
// @access Private + Admin
router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status && status !== 'all') query.status = status;

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  res.json({ success: true, total, orders });
}));

// @route  GET /api/orders/:id
// @desc   Get a single order by ID
// @access Private (owner or admin)
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Users can only view their own orders
  if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  res.json({ success: true, order });
}));

// @route  PUT /api/orders/:id/status
// @desc   Update order status (admin only)
// @access Private + Admin
router.put('/:id/status', protect, adminOnly, asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'dispatched', 'shipped', 'delivered'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = status;
  await order.save();

  res.json({ success: true, message: 'Order status updated', order });
}));

module.exports = router;
