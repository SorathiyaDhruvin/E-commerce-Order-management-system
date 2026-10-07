# ShopSphere - E-Commerce & Order Management System

A full-stack e-commerce web application built using **React.js**, **Spring Boot**, **Spring Security (JWT)**, and **PostgreSQL**. This project demonstrates a robust, scalable backend layered architecture coupled with a modern, responsive React frontend.

## Features

### 🔐 Security & Authentication
- Stateless JWT-based authentication
- Role-Based Access Control (Customer vs. Admin)
- Secure password hashing using BCrypt
- Interceptor-based token attachment in the frontend

### 🛍️ Customer Features
- Browse and search products with pagination
- View products by category
- View detailed product information
- Add/remove items to cart, adjust quantities
- Manage shipping addresses
- Place orders with simulated payments
- View personal order history

### 👨‍💼 Admin Features
- Comprehensive dashboard with analytics and KPIs (revenue, orders, users)
- Product management (Create, Read, Update, Delete)
- Order management (Update order status to Pending, Shipped, Delivered, Cancelled)
- Inventory monitoring (Low stock alerts)

## Technology Stack

**Frontend:**
- React.js (Vite)
- React Router DOM
- Context API (Auth & Cart state management)
- Axios
- Vanilla CSS (Custom premium styling)
- React Hot Toast

**Backend:**
- Java 17
- Spring Boot 3
- Spring Security 6
- Spring Data JPA
- PostgreSQL
- JSON Web Token (jjwt)
- Validation API & Global Exception Handling
- Lombok
- JUnit 5 & Mockito (Testing)

## Architecture

The backend follows a classic **3-Tier Architecture**:
1. **Controller Layer**: Handles HTTP requests, input validation, and returns DTOs.
2. **Service Layer**: Contains core business logic, transactional boundaries, and handles entity-DTO mapping.
3. **Repository Layer**: Interfaces with PostgreSQL using Spring Data JPA.

*Note: Entities are strictly isolated from controllers. All API requests and responses use Data Transfer Objects (DTOs) for security and separation of concerns.*

## Setup Instructions

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL
- Maven

### 1. Database Setup
1. Create a PostgreSQL database named `shopsphere_db`.
2. Ensure your local Postgres server is running.

### 2. Backend Setup
1. Navigate to the `backend` directory.
2. Configure environment variables or modify `src/main/resources/application.yml` directly:
   ```env
   DB_URL=jdbc:postgresql://localhost:5432/shopsphere_db
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_base64_encoded_secret_key_that_is_long_enough
   JWT_EXPIRATION=86400000
   ```
3. Run `mvn clean install` to build the project.
4. Run the application: `mvn spring-boot:run`
5. The backend will start on `http://localhost:8080`.

### 3. Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Access the application in your browser (usually `http://localhost:5173`).

## API Documentation

- **Auth**: `/api/auth/register`, `/api/auth/login`
- **Products**: `/api/products` (GET: public, POST/PUT/DELETE: Admin)
- **Categories**: `/api/categories` (GET: public, POST/PUT/DELETE: Admin)
- **Cart**: `/api/cart`, `/api/cart/items`, `/api/cart/clear` (Customer only)
- **Addresses**: `/api/addresses` (Customer only)
- **Orders**: `/api/orders` (Customer), `/api/admin/orders` (Admin)
- **Dashboard**: `/api/admin/dashboard` (Admin)

## Testing
- Backend unit tests for business logic are located in `backend/src/test/java`.
- Run tests using: `mvn test`

---
*Created as a Software Engineering Portfolio Project*
