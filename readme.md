## Authentication:

POST /api/register: Register a new user.
POST /api/login: Login a user.
POST /api/logout: Logout the user.

## Products:

POST /api/products: Create a new product (Admin only).
GET /api/products: List all products (available to all users).
GET /api/product/:id : GET PARTICULAR PRODUCT
DELETE /api/products/:id: Delete a product (Admin only).

## Cart:

POST /api/cart: Add a product to the cart.
GET /api/cart: View the user's cart.
POST /api/cart/checkout: Checkout the cart.
