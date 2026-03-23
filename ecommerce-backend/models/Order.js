const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: '' },
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zip: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true, default: 'India' },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: [(arr) => arr.length > 0, 'Order must have at least one item'],
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'dispatched', 'shipped', 'delivered'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
