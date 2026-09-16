const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      default: () => 'ORD-' + Math.floor(100000 + Math.random() * 900000)
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true
    },
    plan: {
      type: String,
      required: true
    },
    amount: {
      type: String,
      required: true
    },
    paymentMethod: {
      type: String,
      default: 'Not Selected'
    },
    channel: {
      type: String,
      enum: ['web', 'whatsapp', 'email'],
      default: 'web'
    },
    type: {
      type: String,
      enum: ['subscription', 'trial', 'reseller'],
      default: 'subscription'
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'active', 'completed', 'cancelled'],
      default: 'pending'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);
