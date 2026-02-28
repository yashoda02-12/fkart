# Fkart App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full e-commerce shopping application called "Fkart"
- Product catalog with categories (Electronics, Clothing, Home, Books, etc.)
- Product listing page with search, filter by category, sort by price/rating
- Product detail page with images, description, price, rating, add-to-cart
- Shopping cart with quantity management, subtotal, and checkout
- Order placement and order history
- User authentication (login/register)
- Admin panel to add/edit/delete products and view all orders
- Responsive design that works on mobile, tablet, and desktop

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
- User management: register, login, get profile
- Product management: create, read, update, delete products with fields (id, name, description, price, category, imageUrl, stock, rating, numReviews)
- Cart management: add item, remove item, update quantity, get cart per user
- Order management: place order, get order by user, get all orders (admin), update order status
- Review management: add review to product, get reviews
- Role-based access: user vs admin

### Frontend (React + TypeScript)
- Responsive layout with top navbar (search bar, cart icon, user menu)
- Home page: hero banner, featured categories, top products grid
- Product listing page: filter sidebar (category, price range), product cards grid with pagination
- Product detail page: image gallery, product info, add to cart button, reviews section
- Cart page: line items, quantity stepper, remove button, order summary panel, proceed to checkout
- Checkout page: shipping address form, order review, place order button
- Order history page: list of past orders with status badges
- Auth pages: login and register forms
- Admin dashboard: product CRUD table, orders management table
- Sample products seeded for demo
