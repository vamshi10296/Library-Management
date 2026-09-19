const mongoose = require('mongoose');

/**
 * Book Schema
 * Represents library catalogue books.
 */
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  totalCopies: {
    type: Number,
    required: [true, 'Total copies count is required'],
    min: [1, 'Total copies must be at least 1']
  },
  availableCopies: {
    type: Number,
    required: [true, 'Available copies count is required'],
    min: [0, 'Available copies cannot be negative'],
    validate: {
      validator: function(val) {
        return val <= this.totalCopies;
      },
      message: 'Available copies ({VALUE}) cannot exceed total copies'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Book', bookSchema);
