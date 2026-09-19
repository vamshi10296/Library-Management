/**
 * Database Seed Script
 * Populates MongoDB with initial Admin, Member, Books, and Sample Borrow Records.
 * 
 * Usage: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const { calculateFine, BORROW_DAYS } = require('../utils/fineCalculator');

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected successfully.');

    // Clear existing collections for a fresh development setup
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Book.deleteMany({}),
      Borrow.deleteMany({})
    ]);

    // 1. Seed Users (1 Admin, 1 Member)
    console.log('Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const memberPassword = await bcrypt.hash('member123', salt);

    const admin = await User.create({
      name: 'Chief Librarian Admin',
      email: 'admin@library.com',
      password: adminPassword,
      role: 'admin'
    });

    const member = await User.create({
      name: 'Vamshi Yarragorla',
      email: 'member@library.com',
      password: memberPassword,
      role: 'member'
    });

    console.log(`[Users Created]:`);
    console.log(`  Admin:  ${admin.email} (Password: admin123)`);
    console.log(`  Member: ${member.email} (Password: member123)`);

    // 2. Seed Books (10 realistic titles across required categories)
    console.log('Seeding library catalogue books...');
    const sampleBooks = [
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        isbn: '978-0132350884',
        category: 'Programming',
        totalCopies: 5,
        availableCopies: 5
      },
      {
        title: 'Introduction to Algorithms (CLRS)',
        author: 'Thomas H. Cormen, Charles E. Leiserson',
        isbn: '978-0262033848',
        category: 'Computer Science',
        totalCopies: 4,
        availableCopies: 4
      },
      {
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell, Peter Norvig',
        isbn: '978-0136042594',
        category: 'AI & Machine Learning',
        totalCopies: 3,
        availableCopies: 3
      },
      {
        title: 'Deep Learning with Python',
        author: 'François Chollet',
        isbn: '978-1617294433',
        category: 'AI & Machine Learning',
        totalCopies: 4,
        availableCopies: 4
      },
      {
        title: 'The Pragmatic Programmer: Your Journey to Mastery',
        author: 'David Thomas, Andrew Hunt',
        isbn: '978-0135957059',
        category: 'Software Engineering',
        totalCopies: 3,
        availableCopies: 3
      },
      {
        title: 'Dune',
        author: 'Frank Herbert',
        isbn: '978-0441013593',
        category: 'Fiction',
        totalCopies: 6,
        availableCopies: 6
      },
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        isbn: '978-0553380163',
        category: 'Science',
        totalCopies: 3,
        availableCopies: 3
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        isbn: '978-0062316097',
        category: 'History',
        totalCopies: 5,
        availableCopies: 5
      },
      {
        title: 'Linear Algebra and Its Applications',
        author: 'Gilbert Strang',
        isbn: '978-0030105678',
        category: 'Mathematics',
        totalCopies: 4,
        availableCopies: 4
      },
      {
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        isbn: '978-1449373320',
        category: 'Technology',
        totalCopies: 3,
        availableCopies: 3
      }
    ];

    const insertedBooks = await Book.insertMany(sampleBooks);
    console.log(`[Books Created]: ${insertedBooks.length} titles inserted.`);

    // 3. Seed Sample Borrow Records (Active on-time, Active overdue, Returned)
    console.log('Seeding sample borrow records for testing...');
    const now = new Date();

    // Record A: Currently Issued (Due in 7 days - Active & On-time)
    const issueDateA = new Date();
    issueDateA.setDate(now.getDate() - 7);
    const dueDateA = new Date(issueDateA);
    dueDateA.setDate(dueDateA.getDate() + BORROW_DAYS);

    await Borrow.create({
      user: member._id,
      book: insertedBooks[0]._id, // Clean Code
      issueDate: issueDateA,
      dueDate: dueDateA,
      status: 'Issued',
      fine: 0
    });
    // Adjust available copies
    insertedBooks[0].availableCopies -= 1;
    await insertedBooks[0].save();

    // Record B: Currently Issued (Overdue by 3 days - Fine should be ₹15)
    const issueDateB = new Date();
    issueDateB.setDate(now.getDate() - 17); // 17 days ago
    const dueDateB = new Date(issueDateB);
    dueDateB.setDate(dueDateB.getDate() + BORROW_DAYS); // Due 3 days ago

    await Borrow.create({
      user: member._id,
      book: insertedBooks[1]._id, // CLRS
      issueDate: issueDateB,
      dueDate: dueDateB,
      status: 'Issued',
      fine: 0
    });
    insertedBooks[1].availableCopies -= 1;
    await insertedBooks[1].save();

    // Record C: Returned Book
    const issueDateC = new Date();
    issueDateC.setDate(now.getDate() - 30);
    const dueDateC = new Date(issueDateC);
    dueDateC.setDate(dueDateC.getDate() + BORROW_DAYS);
    const returnDateC = new Date();
    returnDateC.setDate(now.getDate() - 14);

    await Borrow.create({
      user: member._id,
      book: insertedBooks[2]._id, // AI: A Modern Approach
      issueDate: issueDateC,
      dueDate: dueDateC,
      returnDate: returnDateC,
      status: 'Returned',
      fine: 0
    });

    console.log('Seeding complete! Sample borrow records initialized.');
    console.log('====================================================');
    console.log(' DEMO CREDENTIALS:');
    console.log(' Admin:  admin@library.com  | admin123');
    console.log(' Member: member@library.com | member123');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
