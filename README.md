# Library Management & Book Lending System

> **Course:** B.Tech CSE AI/ML  
> **Project:** Assignment-2  
> **Problem Statement:** PS 0 — Library Management & Book Lending System  
> **Author:** Vamshi Yarragorla  
> **Architecture:** Model-View-Controller (MVC) with Server-Side Rendering (EJS)

---

## Table of Contents
1. [Project Title](#1-project-title)
2. [Project Overview](#2-project-overview)
3. [Problem Statement](#3-problem-statement)
4. [Objectives](#4-objectives)
5. [Features](#5-features)
6. [User Roles](#6-user-roles)
7. [Technology Stack](#7-technology-stack)
8. [System Architecture](#8-system-architecture)
9. [MVC Architecture](#9-mvc-architecture)
10. [Folder Structure](#10-folder-structure)
11. [Database Schema](#11-database-schema)
12. [Database Relationships](#12-database-relationships)
13. [Authentication Flow](#13-authentication-flow)
14. [Authorization & Role Control](#14-authorization--role-control)
15. [Book CRUD Flow](#15-book-crud-flow)
16. [Book Issue Flow](#16-book-issue-flow)
17. [Book Return Flow](#17-book-return-flow)
18. [Fine Calculation Logic](#18-fine-calculation-logic)
19. [Dashboard Architecture & Queries](#19-dashboard-architecture--queries)
20. [Search and Filter Operations](#20-search-and-filter-operations)
21. [Input Validation](#21-input-validation)
22. [Security Measures](#22-security-measures)
23. [Error Handling Strategy](#23-error-handling-strategy)
24. [UI/UX Design System](#24-uiux-design-system)
25. [Installation Guide](#25-installation-guide)
26. [Environment Variables](#26-environment-variables)
27. [MongoDB Atlas Setup Guide](#27-mongodb-atlas-setup-guide)
28. [Database Seed Data](#28-database-seed-data)
29. [Local Development](#29-local-development)
30. [Route Documentation](#30-route-documentation)
31. [Testing Checklist](#31-testing-checklist)
32. [Step-by-Step Viva Demo Flow](#32-step-by-step-viva-demo-flow)
33. [GitHub Setup & Best Practices](#33-github-setup--best-practices)
34. [Render Deployment Guide](#34-render-deployment-guide)
35. [System Limitations](#35-system-limitations)
36. [Future Enhancements](#36-future-enhancements)
37. [Key Learning Outcomes](#37-key-learning-outcomes)
38. [Author & Academic Submission Details](#38-author--academic-submission-details)

---

## 1. Project Title
**Library Management & Book Lending System (PS 0)**

---

## 2. Project Overview
The **Library Management & Book Lending System** is a full-stack web application developed using **Node.js, Express.js, MongoDB Atlas (via Mongoose), and EJS Server-Side Rendering**. Designed for academic and municipal libraries, it automates catalogue tracking, member borrowing limits, loan durations, and overdue fines without relying on client-side SPA frameworks or mock data.

---

## 3. Problem Statement
**PS 0 — Library Management & Book Lending System**  
*Domain:* Education / Public Services  
*Requirement:* Build an end-to-end web system to manage a library catalogue, issue and return books, calculate overdue penalties, and maintain member borrowing records with role-based access control.

---

## 4. Objectives
- Implement complete **Model-View-Controller (MVC)** separation.
- Provide secure session-based authentication with `bcryptjs` and `connect-mongo`.
- Enforce strict role authorization distinguishing **Members** from **Administrators**.
- Ensure atomic stock tracking to prevent race conditions and negative inventory.
- Implement an automated fine calculation engine (₹5/day overdue penalty).
- Render server-side EJS templates with a modern, responsive, accessible design.

---

## 5. Features
- **Public Showcase:** Landing page with real-time catalogue metrics, core pillar cards, and fresh arrivals.
- **Member Self-Service:** Browse catalogue with search/category filters, inspect copies, 1-click book issuance (max 3 books, 14-day loan), and view loan history.
- **Admin Management Console:** Real-time database metrics, book inventory CRUD, member directory with active borrow counts, and circulation audit records.
- **Automated Fine Calculator:** Real-time calculation of late penalties upon return and live display of outstanding fines for overdue loans.
- **Flash Alerts:** Real-time feedback for operations using `connect-flash`.

---

## 6. User Roles

| Role | Access Scope | Key Permissions |
| :--- | :--- | :--- |
| **Guest** | Public Pages | View landing page, search/filter book catalogue, view book details, register, log in. |
| **Member** | Member Portal | Browse catalogue, issue books (up to 3), return books, view active loans and return history. |
| **Admin** | Admin Panel | Add, edit, and delete books; view member directory; audit circulation logs; process returns. |

---

## 7. Technology Stack
- **Runtime Environment:** Node.js (v18+)
- **Backend Framework:** Express.js (v4.21)
- **Database:** MongoDB & MongoDB Atlas
- **ODM (Object Data Modeling):** Mongoose (v8.9)
- **View Engine:** EJS (Embedded JavaScript) Server-Side Rendering
- **Authentication:** `express-session`, `connect-mongo`, `bcryptjs`
- **Validation & Sanitization:** `express-validator`
- **Session Flash Messaging:** `connect-flash`
- **RESTful Method Emulation:** `method-override` (PUT / DELETE via forms)
- **Styling:** Vanilla CSS3 (Custom design system, CSS variables, flexbox, grid, Inter font)

---

## 8. System Architecture
The application runs on a monolithic, server-rendered Express architecture:

```
Client Browser (HTML5 / CSS3 / Vanilla JS)
        │
        ▼  HTTP Requests (GET, POST, PUT, DELETE)
Express.js Web Server (app.js)
        ├── Global Middleware (Sessions, Flash, Context)
        ├── Router Layer (/routes)
        ├── Auth / Role Guards (/middleware)
        ├── Controllers (/controllers)
        │       ├── Validation (express-validator)
        │       └── Business Utilities (/utils/fineCalculator.js)
        ├── Mongoose Models (/models)
        │       └── MongoDB Database (Atlas / Local)
        └── View Rendering Engine (/views EJS)
                └── HTML Response with Flash Notifications
```

---

## 9. MVC Architecture
- **Model (`/models`):** Defines database schemas, field validations, and relationships (`User.js`, `Book.js`, `Borrow.js`).
- **View (`/views`):** Server-rendered EJS templates containing presentation logic, structured layouts, and partials.
- **Controller (`/controllers`):** Executes business rules, queries models using `async/await`, handles errors with `try/catch`, and passes data to views.

---

## 10. Folder Structure

```
library-management-system/
├── app.js
├── package.json
├── .env
├── .env.example
├── .gitignore
├── README.md
│
├── config/
│   └── db.js
│
├── models/
│   ├── User.js
│   ├── Book.js
│   └── Borrow.js
│
├── controllers/
│   ├── authController.js
│   ├── bookController.js
│   ├── borrowController.js
│   └── dashboardController.js
│
├── routes/
│   ├── authRoutes.js
│   ├── bookRoutes.js
│   ├── borrowRoutes.js
│   └── dashboardRoutes.js
│
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
│
├── utils/
│   └── fineCalculator.js
│
├── views/
│   ├── partials/
│   │   ├── head.ejs
│   │   ├── navbar.ejs
│   │   ├── sidebar.ejs
│   │   ├── footer.ejs
│   │   └── flash-message.ejs
│   ├── auth/
│   │   ├── login.ejs
│   │   └── register.ejs
│   ├── member/
│   │   ├── dashboard.ejs
│   │   ├── books.ejs
│   │   ├── book-details.ejs
│   │   └── my-books.ejs
│   ├── admin/
│   │   ├── dashboard.ejs
│   │   ├── books.ejs
│   │   ├── add-book.ejs
│   │   ├── edit-book.ejs
│   │   ├── members.ejs
│   │   └── borrow-records.ejs
│   ├── errors/
│   │   ├── 404.ejs
│   │   └── 500.ejs
│   └── home.ejs
│
├── public/
│   ├── css/
│   │   ├── style.css
│   │   ├── auth.css
│   │   └── dashboard.css
│   ├── js/
│   │   ├── script.js
│   │   └── dashboard.js
│   └── images/
│
└── seed/
    └── seed.js
```

---

## 11. Database Schema

### User Schema (`models/User.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Required, Trimmed | Full name of the patron or administrator |
| `email` | String | Required, Unique, Lowercase | Normalized account email address |
| `password` | String | Required | Bcrypt salted hash (never stored in plaintext) |
| `role` | String | Enum: `['member', 'admin']`, Default: `'member'` | Authorization level |
| `createdAt` | Date | Default: `Date.now` | Account registration timestamp |

### Book Schema (`models/Book.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | Required, Trimmed | Book title |
| `author` | String | Required, Trimmed | Author name(s) |
| `isbn` | String | Required, Unique, Uppercase | International Standard Book Number |
| `category` | String | Required, Trimmed | Academic subject or genre |
| `totalCopies`| Number | Required, Min: 1 | Total inventory count owned by the library |
| `availableCopies` | Number | Required, Min: 0 | Available copies on shelf (`<= totalCopies`) |
| `createdAt` | Date | Default: `Date.now` | Date added to library catalogue |

### Borrow Schema (`models/Borrow.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `user` | ObjectId | Ref: `'User'`, Required | Reference to the borrowing member |
| `book` | ObjectId | Ref: `'Book'`, Required | Reference to the borrowed book |
| `issueDate` | Date | Default: `Date.now`, Required | Timestamp when book was issued |
| `dueDate` | Date | Required | Agreed return deadline (Issue date + 14 days) |
| `returnDate` | Date | Default: `null` | Actual timestamp of book return |
| `status` | String | Enum: `['Issued', 'Returned']`, Default: `'Issued'` | Circulation status |
| `fine` | Number | Default: `0`, Min: `0` | Calculated late fee in Rupees (₹) |
| `createdAt` | Date | Default: `Date.now` | Record generation timestamp |

---

## 12. Database Relationships
- **User to Borrow:** One-to-Many. One member can have multiple borrow records over time.
- **Book to Borrow:** One-to-Many. One book can appear in multiple historical borrow records.
- **Referential Population:** Queries populate `user` (name, email) and `book` (title, author, isbn, category) via Mongoose `populate()`.

---

## 13. Authentication Flow
1. **Registration:**
   - Member submits Name, Email, Password, and Confirm Password.
   - `express-validator` checks field lengths, email validity, and password confirmation.
   - Controller checks for duplicate email.
   - Password is encrypted using `bcrypt.hash(password, 10)` and stored.
2. **Login:**
   - User submits email and password.
   - Controller finds user record and verifies password with `bcrypt.compare()`.
   - `req.session.user` is populated with `{ id, name, email, role }`.
   - Role determines destination: Admins redirect to `/admin/dashboard`, Members to `/dashboard`.
3. **Logout:**
   - `POST /logout` destroys session in MongoDB and clears the `connect.sid` cookie.

---

## 14. Authorization & Role Control
- **`isAuthenticated` (`middleware/authMiddleware.js`):** Checks if `req.session.user` exists. Redirects unauthenticated users to `/login`.
- **`isAdmin` (`middleware/roleMiddleware.js`):** Verifies `req.session.user.role === 'admin'`. Blocks members from administrative routes (`/admin/*`).
- **`isMember` (`middleware/roleMiddleware.js`):** Verifies `req.session.user.role === 'member'`. Blocks admins from borrowing books to maintain data integrity.

---

## 15. Book CRUD Flow
- **Create:** Admin enters book details at `GET /admin/books/add`. `POST /admin/books/add` validates input and initializes `availableCopies = totalCopies`.
- **Read:**
  - Members/Guests: `GET /books` (catalogue) & `GET /books/:id` (detail page).
  - Admin: `GET /admin/books` with management actions.
- **Update:** Admin edits details at `GET /admin/books/:id/edit`. `PUT /admin/books/:id` ensures `totalCopies` cannot be set lower than currently loaned copies.
- **Delete:** `DELETE /admin/books/:id` prevents deletion if copies of the book are actively issued to members.

---

## 16. Book Issue Flow
When a member clicks **Issue Book**:
1. Checks member authentication and role.
2. Verifies book exists and `availableCopies > 0`.
3. Counts member's active borrow records; rejects if `>= 3` (`MAX_BOOKS_PER_MEMBER`).
4. Checks if member already holds an active copy of the same book; rejects duplicates.
5. Executes an atomic decrement on `availableCopies` (`$inc: { availableCopies: -1 }`).
6. Computes `dueDate = issueDate + 14 days` (`BORROW_DAYS = 14`).
7. Creates a Borrow record with `status: 'Issued'` and `fine: 0`.
8. Redirects to `/my-books` with flash confirmation.

---

## 17. Book Return Flow
When a book is returned:
1. Locates the Borrow record and verifies `status === 'Issued'`.
2. Validates that either the borrowing member or an admin initiated the return.
3. Calculates overdue days: `calculateOverdueDays(borrow.dueDate, now)`.
4. Computes fine: `calculateFine(borrow.dueDate, now)`.
5. Updates Borrow record: sets `returnDate = now`, `status = 'Returned'`, and `fine = calculatedFine`.
6. Increments book inventory safely (`$inc: { availableCopies: 1 }`).
7. Displays success message with fine breakdown if overdue.

---

## 18. Fine Calculation Logic (`utils/fineCalculator.js`)

### Centralized Constants
- `MAX_BOOKS_PER_MEMBER = 3`
- `BORROW_DAYS = 14`
- `FINE_PER_DAY = 5` (₹5 per overdue day)

### Rules & Scenarios
- **On or before due date:** `overdueDays = 0`, Fine = **₹0**.
- **After due date:** `overdueDays = returnDate - dueDate` (calendar days), Fine = `overdueDays × ₹5`.
- **Non-negative guarantee:** `Math.max(0, fine)` prevents negative values.
- **Live Overdue Assessment:** Unreturned books overdue on member and admin dashboards display dynamic live fine balances before check-in.

---

## 19. Dashboard Architecture & Queries

### Member Dashboard (`/dashboard`)
- **Currently Borrowed:** `Borrow.countDocuments({ user: userId, status: 'Issued' })`
- **Available Titles:** `Book.countDocuments({ availableCopies: { $gt: 0 } })`
- **Overdue Count:** `Borrow.countDocuments({ user: userId, status: 'Issued', dueDate: { $lt: now } })`
- **Lifetime Loans:** `Borrow.countDocuments({ user: userId })`
- **Due Soon Section:** Loans expiring within the next 3 days.

### Admin Dashboard (`/admin/dashboard`)
- **Total Books:** `Book.countDocuments()`
- **Total Members:** `User.countDocuments({ role: 'member' })`
- **Issued Books:** `Borrow.countDocuments({ status: 'Issued' })`
- **Overdue Books:** `Borrow.countDocuments({ status: 'Issued', dueDate: { $lt: now } })`
- **Most Borrowed Titles:** MongoDB Aggregation Pipeline:
  ```javascript
  Borrow.aggregate([
    { $group: { _id: '$book', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);
  ```
- **Recent Activity:** Latest 6 borrow records populated with user and book.
- **Low Stock Alerts:** Books with `availableCopies <= 2`.

---

## 20. Search and Filter Operations
- **Text Search:** Case-insensitive regex matching against `title`, `author`, and `isbn`:
  ```javascript
  query.$or = [
    { title: new RegExp(search, 'i') },
    { author: new RegExp(search, 'i') },
    { isbn: new RegExp(search, 'i') }
  ];
  ```
- **Category Filter:** Filter by distinct subjects (`category: selectedCategory`).
- **Circulation Filters:** Filter audit records by `All`, `Issued`, `Returned`, or `Overdue`.

---

## 21. Input Validation
Using `express-validator`:
- **Registration:** Name (min 2 chars), valid email, password (min 6 chars), password confirmation match.
- **Login:** Non-empty email format and password presence.
- **Book Add/Edit:** Title and author (min 2 chars), ISBN (min 3 chars), valid category, integer total copies (`min: 1`).

---

## 22. Security Measures
- **Password Hashing:** `bcryptjs` with salt work factor of 10. Plaintext passwords are never stored or logged.
- **MongoDB Session Store:** Sessions stored in MongoDB via `connect-mongo` with HTTP-only cookies.
- **Credential Protection:** Passwords excluded in queries (`select('-password')`).
- **Environment Isolation:** Secrets kept in `.env` and excluded via `.gitignore`.
- **Atomic Operations:** Uses MongoDB `$inc` and condition-guarded updates to eliminate race conditions.

---

## 23. Error Handling Strategy
- **Client Route Errors (404):** Handled via `views/errors/404.ejs`.
- **Server Errors (500):** Handled via central middleware in `views/errors/500.ejs`. Stack traces are hidden in production (`NODE_ENV=production`).
- **Validation Failures (422):** Returns highlighted inputs and error lists without dropping user form input.

---

## 24. UI/UX Design System
- **Color Palette:**
  - Deep Navy (`#0f172a`, `#1e293b`)
  - Accent Blue (`#2563eb`)
  - Warm Amber/Gold (`#d97706`)
  - Status: Emerald Green (`#059669`), Warning Gold (`#d97706`), Crimson Red (`#dc2626`)
- **Typography:** Inter (Google Fonts)
- **Responsiveness:** Verified across 1440px (Desktop), 1200px (Laptop), 768px (Tablet), and 390px (Mobile).
- **Accessibility:** High-contrast color ratios, semantic HTML5, descriptive form labels, and keyboard-accessible buttons.

---

## 25. Installation Guide

### Prerequisites
- Node.js (v18.x or higher)
- MongoDB (Local instance or MongoDB Atlas account)
- Git

### Steps
```bash
# 1. Clone repository
git clone <your-repository-url>
cd Library-Management

# 2. Install dependencies
npm install

# 3. Create environment configuration
cp .env.example .env
```

---

## 26. Environment Variables
Configure `.env`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/library_management_db
SESSION_SECRET=your_super_secret_session_key_2026
PORT=3000
NODE_ENV=development
```

---

## 27. MongoDB Atlas Setup Guide
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a free M0 cluster.
3. In **Database Access**, create a user with read/write permissions.
4. In **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere for cloud deployment).
5. Click **Connect** > **Drivers** > **Node.js** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/libraryDB?retryWrites=true&w=majority
   ```
6. Paste into your `.env` as `MONGODB_URI`.

---

## 28. Database Seed Data
Run the built-in seed script to populate realistic demo data:
```bash
npm run seed
```
Seeds:
- **Admin:** `admin@library.com` | `admin123`
- **Member:** `member@library.com` | `member123`
- **10 Books:** Across Computer Science, AI, Programming, History, Science, Fiction, Mathematics.
- **Sample Loans:** Active on-time loan, active overdue loan (with ₹15 fine), and returned loan.

---

## 29. Local Development
Start the application:
```bash
# Production mode
npm start

# Development mode (auto-reload via nodemon)
npm run dev
```
Open: `http://localhost:3000`

---

## 30. Route Documentation

| Method | Route | Access | Controller Handler | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | `app.js (inline)` | Public landing page with live stats |
| `GET` | `/login` | Guest | `authController.getLogin` | Render login form |
| `POST` | `/login` | Guest | `authController.postLogin` | Authenticate user & start session |
| `GET` | `/register` | Guest | `authController.getRegister` | Render registration form |
| `POST` | `/register` | Guest | `authController.postRegister` | Create new member account |
| `POST` | `/logout` | Authenticated | `authController.postLogout` | Destroy session & logout |
| `GET` | `/dashboard` | Authenticated | `dashboardController.getDashboard` | Role-based dashboard redirect / member dashboard |
| `GET` | `/books` | Public / Member | `bookController.getBooks` | Browse catalogue with search & category filter |
| `GET` | `/books/:id` | Public / Member | `bookController.getBookDetails` | View single book details & issue button |
| `POST` | `/books/:id/issue` | Member | `borrowController.issueBook` | Issue book to member (Max 3, 14 days) |
| `POST` | `/borrow/:id/return` | Member / Admin | `borrowController.returnBook` | Return book and compute late fines |
| `GET` | `/my-books` | Member | `borrowController.getMyBooks` | View personal active loans & returned history |
| `GET` | `/admin/dashboard` | Admin | `dashboardController.getAdminDashboard` | Real-time admin statistics & analytics |
| `GET` | `/admin/books` | Admin | `bookController.getAdminBooks` | Admin book inventory management |
| `GET` | `/admin/books/add` | Admin | `bookController.getAddBook` | Form to catalogue new book |
| `POST` | `/admin/books/add` | Admin | `bookController.postAddBook` | Create book in database |
| `GET` | `/admin/books/:id/edit` | Admin | `bookController.getEditBook` | Form to edit existing book |
| `PUT` | `/admin/books/:id` | Admin | `bookController.putEditBook` | Update book details and copies |
| `DELETE`| `/admin/books/:id` | Admin | `bookController.deleteBook` | Safely remove book from inventory |
| `GET` | `/admin/members` | Admin | `borrowController.getAdminMembers` | View patron directory & active loan counts |
| `GET` | `/admin/borrow-records`| Admin | `borrowController.getAdminBorrowRecords`| Complete circulation audit log with filters |

---

## 31. Testing Checklist

### Authentication
- [x] Register new account with validation.
- [x] Reject duplicate email registration.
- [x] Login with valid credentials and establish session.
- [x] Reject invalid email or wrong password.
- [x] Terminate session on logout.

### Authorization
- [x] Unauthenticated guests blocked from `/dashboard` and `/admin/*`.
- [x] Members blocked from administrative routes (`/admin/*`).
- [x] Admins redirected to Admin Console on dashboard access.

### Book Management (CRUD)
- [x] Add new book with `availableCopies = totalCopies`.
- [x] View catalogue with title/author/ISBN search.
- [x] Filter catalogue by subject category.
- [x] Edit book copies and validate against active loans.
- [x] Block deletion of books with active loans.

### Borrowing & Circulation
- [x] Issue available book; decrement `availableCopies`.
- [x] Block issuance when `availableCopies === 0`.
- [x] Block duplicate issuance of the same book to the same member.
- [x] Block issuance exceeding the 3-book limit.
- [x] Calculate 14-day due date accurately.
- [x] Return book; increment `availableCopies`.
- [x] Prevent duplicate return of already returned book.

### Fine Calculation
- [x] Return on or before due date incurs ₹0 fine.
- [x] Late return calculates ₹5 per overdue day.
- [x] Fines are never negative.
- [x] Live fines display accurately on member and admin dashboards.

---

## 32. Step-by-Step Viva Demo Flow
1. **Landing Page:** Open `http://localhost:3000` to show live catalogue counters.
2. **Registration & Login:** Register a new member, log in, or use the 1-click **Fill Member** button on `/login`.
3. **Member Dashboard:** Show current borrow count (`2/3`), overdue alert, and catalogue shortcuts.
4. **Catalogue & Search:** Search for `"Clean"` or filter by `"AI & Machine Learning"`.
5. **Issue Book:** Open a book, click **Issue Book Now**, observe available copies decrease, and verify redirection to **My Books**.
6. **Limit Enforcement:** Attempt to borrow a 4th book; observe the limit warning.
7. **Return Book:** Return an issued book; observe available copies increment and fine receipt display.
8. **Admin Login:** Log in using `admin@library.com` / `admin123`.
9. **Admin Dashboard:** Review total books, members, active loans, most borrowed books aggregation, and low-stock alerts.
10. **Admin Actions:** Add a book, edit copies, inspect the **Members Directory**, and review the **Circulation Audit Log**.

---

## 33. GitHub Setup & Best Practices
```bash
git init
git add .
git commit -m "Initial commit: Production-ready Library Management System"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```
*Note: `.env` and `node_modules` are excluded via `.gitignore`.*

---

## 34. Render Deployment Guide
1. Push repository to GitHub.
2. Log into [render.com](https://render.com) and click **New Web Service**.
3. Connect your repository.
4. Configure service settings:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<your_mongodb_atlas_connection_string>`
   - `SESSION_SECRET`: `<random_secure_hex_string>`
6. Deploy service. Render automatically assigns `PORT` and manages SSL/HTTPS.

---

## 35. System Limitations
- No online payment gateway integration (fines are recorded on account for library desk collection).
- Barcode/RFID hardware scanners not integrated (ISBN and manual entry used).
- Email notifications require an external SMTP server (e.g. Nodemailer with SendGrid).

---

## 36. Future Enhancements
- Automated email reminder alerts 2 days before loan expiration.
- Book reservations/holds for out-of-stock titles.
- Razorpay/Stripe payment gateway integration for online fine clearance.
- PDF circulation receipt export.

---

## 37. Key Learning Outcomes
- Mastered full-stack **Model-View-Controller (MVC)** architecture.
- Implemented secure stateful sessions using MongoDB session stores.
- Designed atomic database queries with Mongoose to prevent race conditions.
- Constructed server-side dynamic user interfaces using EJS templating.
- Developed an automated financial business logic module for overdue fines.

---

## 38. Author & Academic Submission Details
- **Student Name:** Vamshi Yarragorla
- **Course:** B.Tech Computer Science and Engineering (AI/ML)
- **Assignment:** Assignment-2
- **Problem Statement:** PS 0 — Library Management & Book Lending System
- **Academic Year:** 2026
# Library-Management
