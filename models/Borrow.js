const mongoose = require('mongoose');

/**
 * Borrow Schema
 * Tracks book lending, due dates, returns, and calculated fines.
 */
const borrowSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book reference is required']
  },
  issueDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  returnDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['Issued', 'Returned'],
    default: 'Issued'
  },
  fine: {
    type: Number,
    default: 0,
    min: [0, 'Fine cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Borrow', borrowSchema);
