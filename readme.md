# E-Commerce API

This is a Node.js and Express.js based e-commerce API with user authentication, product management, and cart functionality. It uses Prisma as an ORM for database operations.

## Features

- User authentication (register, login, logout)
- User roles (Admin and User)
- Product management (create, read, update, delete)
- Shopping cart functionality (add to cart, view cart, checkout)

## Prerequisites

- Node.js
- npm or yarn
- PostgreSQL (or any other database supported by Prisma)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/your-repo-name.git
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up your environment variables in a `.env` file:

   ```
   DATABASE_URL="your-database-url"
   JWT_SECRET="your-jwt-secret"
   ```

4. Run Prisma migrations:
   ```
   npx prisma migrate dev
   ```

## Usage

To start the server:

```
npm run start
```

For development with auto-restart:

```
npm run dev
```

## API Endpoints

### User Routes

- `POST /api/user/register`: Register a new user
- `POST /api/user/register-admin`: Register a new admin
- `GET /api/user`: Get user information (requires authentication)
- `POST /api/user/login`: User login
- `POST /api/user/logout`: User logout (requires authentication)

### Product Routes

- `POST /api/product/create`: Create a new product (Admin only)
- `GET /api/products`: Get all products
- `GET /api/product/:id`: Get a specific product
- `DELETE /api/product/:id`: Delete a product (Admin only)
- `PUT /api/product/:id`: Change product status (Admin only)

### Cart Routes

- `POST /api/cart`: Add item to cart (User only)
- `GET /api/cart`: Get cart contents (User only)
- `POST /api/cart/checkout`: Checkout cart (User only)

## Testing

Integration tests are included in the `app.test.ts` file. To run the tests:

```
npm run test
```
