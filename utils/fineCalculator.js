/**
 * Centralized Library Lending & Fine Calculation Utilities
 * 
 * Contains business constants and pure helper functions
 * for overdue days and fine calculations.
 */

// Centralized System Constants
const MAX_BOOKS_PER_MEMBER = 3;
const BORROW_DAYS = 14;
const FINE_PER_DAY = 5; // In Rupees (₹5/day)

/**
 * Calculates how many days overdue a return is.
 * Compares dueDate with returnDate (or current date if still issued).
 * 
 * @param {Date|string} dueDate - The agreed due date.
 * @param {Date|string} [actualDate=new Date()] - The actual return date or current date.
 * @returns {number} Integer number of overdue days (0 if on-time or early).
 */
const calculateOverdueDays = (dueDate, actualDate = new Date()) => {
  const due = new Date(dueDate);
  const actual = new Date(actualDate);

  // Normalize times to midnight to avoid hour/minute discrepancies
  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const actualMidnight = new Date(actual.getFullYear(), actual.getMonth(), actual.getDate());

  const differenceInTime = actualMidnight.getTime() - dueMidnight.getTime();
  const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));

  return differenceInDays > 0 ? differenceInDays : 0;
};

/**
 * Calculates the fine for an overdue book.
 * 
 * Rules:
 * - Return before due date: ₹0
 * - Return on due date: ₹0
 * - Return after due date: overdueDays × FINE_PER_DAY
 * - Never returns a negative value.
 * 
 * @param {Date|string} dueDate - The book's due date.
 * @param {Date|string} [returnDate=new Date()] - The actual return date or current date.
 * @returns {number} Total fine in Rupees (₹).
 */
const calculateFine = (dueDate, returnDate = new Date()) => {
  const overdueDays = calculateOverdueDays(dueDate, returnDate);
  const fine = overdueDays * FINE_PER_DAY;
  return Math.max(0, fine);
};

module.exports = {
  MAX_BOOKS_PER_MEMBER,
  BORROW_DAYS,
  FINE_PER_DAY,
  calculateOverdueDays,
  calculateFine
};
