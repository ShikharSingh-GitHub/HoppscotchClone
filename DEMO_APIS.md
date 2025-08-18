# Hoppscotch Clone - Demo APIs Documentation

This document provides a comprehensive list of dummy APIs available for testing and showcasing all HTTP methods in your Hoppscotch clone application.

**Base URL**: `http://localhost:5001`

## 🧪 Quick Test URLs for Frontend Demo

### Basic GET Requests

- `http://localhost:5001/api/demo/users` - Get all users
- `http://localhost:5001/api/demo/products` - Get all products
- `http://localhost:5001/api/demo/orders` - Get all orders
- `http://localhost:5001/api/demo/status/200` - Success response
- `http://localhost:5001/health` - Health check

---

## 👥 User Management APIs

### GET Requests

| Endpoint                             | Description          | Query Parameters        |
| ------------------------------------ | -------------------- | ----------------------- |
| `GET /api/demo/users`                | Get all users        | `page`, `limit`, `role` |
| `GET /api/demo/users/1`              | Get user by ID       | -                       |
| `GET /api/demo/users?role=admin`     | Filter users by role | -                       |
| `GET /api/demo/users?page=1&limit=2` | Paginated users      | -                       |

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30,
      "role": "admin"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

### POST Request

| Endpoint               | Description     | Required Body   |
| ---------------------- | --------------- | --------------- |
| `POST /api/demo/users` | Create new user | `name`, `email` |

**Example Body:**

```json
{
  "name": "Alice Cooper",
  "email": "alice@example.com",
  "age": 28,
  "role": "user"
}
```

### PUT Request

| Endpoint                | Description        | Required Body   |
| ----------------------- | ------------------ | --------------- |
| `PUT /api/demo/users/1` | Update entire user | `name`, `email` |

**Example Body:**

```json
{
  "name": "John Smith Updated",
  "email": "johnsmith@example.com",
  "age": 31,
  "role": "admin"
}
```

### PATCH Request

| Endpoint                  | Description           | Optional Body  |
| ------------------------- | --------------------- | -------------- |
| `PATCH /api/demo/users/1` | Partially update user | Any user field |

**Example Body:**

```json
{
  "age": 32
}
```

### DELETE Request

| Endpoint                   | Description       |
| -------------------------- | ----------------- |
| `DELETE /api/demo/users/1` | Delete user by ID |

---

## 🛍️ Product Management APIs

### GET Requests

| Endpoint                                          | Description           | Query Parameters                   |
| ------------------------------------------------- | --------------------- | ---------------------------------- |
| `GET /api/demo/products`                          | Get all products      | `category`, `minPrice`, `maxPrice` |
| `GET /api/demo/products?category=Electronics`     | Filter by category    | -                                  |
| `GET /api/demo/products?minPrice=20&maxPrice=100` | Filter by price range | -                                  |

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Laptop",
      "price": 999.99,
      "category": "Electronics",
      "stock": 50
    }
  ],
  "meta": {
    "total": 1,
    "filters": {
      "category": "Electronics"
    }
  }
}
```

### POST Request

| Endpoint                  | Description        | Required Body               |
| ------------------------- | ------------------ | --------------------------- |
| `POST /api/demo/products` | Create new product | `name`, `price`, `category` |

**Example Body:**

```json
{
  "name": "Gaming Mouse",
  "price": 79.99,
  "category": "Electronics",
  "stock": 25
}
```

---

## 📦 Order Management APIs

### GET Requests

| Endpoint                              | Description      | Query Parameters   |
| ------------------------------------- | ---------------- | ------------------ |
| `GET /api/demo/orders`                | Get all orders   | `status`, `userId` |
| `GET /api/demo/orders?status=pending` | Filter by status | -                  |
| `GET /api/demo/orders?userId=1`       | Filter by user   | -                  |

### POST Request

| Endpoint                | Description      | Required Body         |
| ----------------------- | ---------------- | --------------------- |
| `POST /api/demo/orders` | Create new order | `userId`, `productId` |

**Example Body:**

```json
{
  "userId": 1,
  "productId": 2,
  "quantity": 3
}
```

---

## 🔧 Utility & Test APIs

### Status Code Testing

| Endpoint                   | Description      | Response   |
| -------------------------- | ---------------- | ---------- |
| `GET /api/demo/status/200` | Success response | Status 200 |
| `GET /api/demo/status/400` | Bad request      | Status 400 |
| `GET /api/demo/status/401` | Unauthorized     | Status 401 |
| `GET /api/demo/status/404` | Not found        | Status 404 |
| `GET /api/demo/status/500` | Server error     | Status 500 |

### Echo API

| Endpoint              | Description       | Body     |
| --------------------- | ----------------- | -------- |
| `POST /api/demo/echo` | Echo request data | Any JSON |

**Example Body:**

```json
{
  "message": "Hello World",
  "data": [1, 2, 3]
}
```

### Random Data Generator

| Endpoint                       | Description    |
| ------------------------------ | -------------- |
| `GET /api/demo/random/number`  | Random number  |
| `GET /api/demo/random/string`  | Random string  |
| `GET /api/demo/random/boolean` | Random boolean |
| `GET /api/demo/random/uuid`    | Random UUID    |
| `GET /api/demo/random/email`   | Random email   |

### Delayed Response

| Endpoint                | Description               |
| ----------------------- | ------------------------- |
| `GET /api/demo/delay/3` | 3-second delayed response |
| `GET /api/demo/delay/5` | 5-second delayed response |

---

## 🎯 Demo Scenarios for Client Showcase

### 1. **Complete CRUD Operations** (User Management)

1. **GET** `/api/demo/users` - Show existing users
2. **POST** `/api/demo/users` - Create a new user
3. **GET** `/api/demo/users/4` - Get the newly created user
4. **PUT** `/api/demo/users/4` - Update entire user record
5. **PATCH** `/api/demo/users/4` - Update just the age field
6. **DELETE** `/api/demo/users/4` - Delete the user

### 2. **API Filtering & Querying**

1. **GET** `/api/demo/users?role=admin` - Filter users by role
2. **GET** `/api/demo/products?category=Electronics` - Filter products
3. **GET** `/api/demo/products?minPrice=50&maxPrice=500` - Price range filter

### 3. **Error Handling Demonstration**

1. **GET** `/api/demo/status/400` - Bad Request
2. **GET** `/api/demo/status/404` - Not Found
3. **GET** `/api/demo/users/999` - User not found
4. **POST** `/api/demo/users` with missing fields - Validation error

### 4. **Response Time Testing**

1. **GET** `/api/demo/delay/2` - Quick response
2. **GET** `/api/demo/delay/5` - Slower response

### 5. **Data Processing**

1. **POST** `/api/demo/echo` - Show request/response cycle
2. **GET** `/api/demo/random/uuid` - Generate unique data

---

## 🚀 Sample Requests for Live Demo

### Create User (POST)

```bash
URL: http://localhost:5001/api/demo/users
Method: POST
Headers: Content-Type: application/json
Body:
{
  "name": "Demo User",
  "email": "demo@example.com",
  "age": 25,
  "role": "user"
}
```

### Update User (PATCH)

```bash
URL: http://localhost:5001/api/demo/users/1
Method: PATCH
Headers: Content-Type: application/json
Body:
{
  "age": 31
}
```

### Create Product (POST)

```bash
URL: http://localhost:5001/api/demo/products
Method: POST
Headers: Content-Type: application/json
Body:
{
  "name": "Demo Product",
  "price": 49.99,
  "category": "Demo",
  "stock": 100
}
```

### Echo Test (POST)

```bash
URL: http://localhost:5001/api/demo/echo
Method: POST
Headers: Content-Type: application/json
Body:
{
  "client": "Hoppscotch Clone",
  "test": true,
  "timestamp": "2025-08-18"
}
```

---

## 💡 Pro Tips for Demo

1. **Start with GET requests** to show data retrieval
2. **Use POST to create** new resources and show them appear
3. **Demonstrate PATCH vs PUT** difference with user updates
4. **Show error handling** with invalid requests
5. **Use query parameters** to show filtering capabilities
6. **Test different response codes** to show status handling
7. **Use delay endpoints** to show loading states in UI

## 🔗 External API Testing

You can also test external APIs through the CORS proxy:

- `http://jsonplaceholder.typicode.com/posts/1`
- `https://httpbin.org/get`
- `https://api.github.com/users/octocat`

Your app will automatically use the proxy for CORS-blocked requests!
