# Pharmacy Inventory Management System - Backend

A cloud-based pharmacy inventory management system built with Node.js, Express, MongoDB, and Mongoose.

## Project Structure

```
src/
├── config/          # Configuration files (database connection, etc.)
├── controllers/     # Request handlers and business logic
├── middleware/      # Custom middleware (auth, validation, error handling, logging)
├── models/          # Mongoose schemas and models
├── routes/          # Express route definitions
├── services/        # Business logic and database operations
├── utils/           # Utility functions and helpers
logs/                # Application logs
.env                 # Environment variables (create from .env.example)
server.js           # Application entry point
package.json        # Project dependencies and scripts
```

## Setup Instructions

### 1. Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account

### 2. Installation

```bash
npm install
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and update with your settings:

```bash
cp .env.example .env
```

Required variables:
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Secret key for JWT signing (change this in production)
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Development or production
- `CORS_ORIGIN`: Frontend URL

### 4. Running the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on the configured port (default: 5000).

## Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start with nodemon (auto-reload)
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Middleware Architecture

- **helmet**: Security headers
- **cors**: Cross-origin resource sharing
- **compression**: Response compression
- **express.json**: JSON request parsing
- **requestLogger**: HTTP request logging
- **errorHandler**: Global error handling

## Database Connection

MongoDB Atlas connection is configured in `src/config/database.js`. The connection is automatically established when the server starts.

### Getting MongoDB Atlas URI

1. Create a cluster on MongoDB Atlas
2. Create a database user with appropriate permissions
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`
4. Add to `.env` file

## Error Handling

The application includes:
- Custom `AppError` class for consistent error responses
- Global error handler middleware
- Request validation with Joi
- Comprehensive logging with Winston

## Logging

Logs are stored in the `logs/` directory:
- `combined.log` - All application logs
- `error.log` - Error-level logs only

Console output is available in development mode.

## Production Considerations

- Use environment variables for sensitive data
- Enable HTTPS in production
- Configure proper CORS origins
- Set `NODE_ENV=production`
- Monitor logs regularly
- Use MongoDB Atlas backup features

## Implemented Features

### ✅ Complete Modules
- Authentication (JWT, role-based access control)
- Medicine Management (CRUD, search, filtering)
- Batch Management (expiry tracking, stock levels)
- Purchase Orders (batch auto-creation, transaction-like handling)
- Sales Processing (FIFO batch deduction, profit calculation)
- Reports & Analytics (10 comprehensive report endpoints)

## Authentication Module

The application includes a complete JWT-based authentication system with role-based access control.

### User Roles

- **admin**: Full system access, can manage users and view all data
- **pharmacist**: Can manage inventory and view sales
- **cashier**: Can process sales and update stock levels

### API Endpoints

#### Public Endpoints

**Register User**
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "pharmacist"
}

Response (201):
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "pharmacist",
      "isActive": true,
      "createdAt": "..."
    }
  }
}
```

**Login User**
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response (200):
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}
```

#### Protected Endpoints (Requires Authentication)

**Get Current User**
```
GET /api/v1/auth/me
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": {
    "user": { ... }
  }
}
```

**Update Profile**
```
PUT /api/v1/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe"
}

Response (200):
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "user": { ... }
  }
}
```

**Get All Users (Admin Only)**
```
GET /api/v1/auth/users
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "count": 5,
  "data": {
    "users": [ ... ]
  }
}
```

### Using Protected Routes

Include the JWT token in the Authorization header:

```javascript
// JavaScript fetch example
const response = await fetch('/api/v1/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Using Role-Based Access

Routes can be protected by role:

```javascript
// In routes
router.get('/admin/dashboard', authenticate, authorize('admin'), controller);
router.get('/pharmacist/reports', authenticate, authorize('pharmacist'), controller);
router.post('/sales', authenticate, authorize('pharmacist', 'cashier'), controller);
```

### Password Security

- Passwords are hashed using bcryptjs with a salt factor of 10
- Passwords are never returned in API responses
- Password comparison is done securely using bcrypt

### JWT Configuration

- Secret key should be set in `.env` as `JWT_SECRET`
- Token expiration is configurable via `JWT_EXPIRE` (default: 7 days)
- Tokens are verified on every protected route request

### Error Handling

Authentication errors return appropriate HTTP status codes:
- `400`: Bad request (missing fields, validation errors)
- `401`: Unauthorized (invalid credentials, expired token)
- `403`: Forbidden (insufficient permissions)

All errors follow the standard error response format:
```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

## Sales Module

The application includes a complete sales processing system with FIFO (First-In-First-Out) batch deduction logic.

### Key Features

- **FIFO Batch Deduction**: Automatically deducts stock from the oldest batch first
- **Atomic Operations**: Transaction-like behavior with automatic rollback on failure
- **Profit Calculation**: Tracks cost per unit and calculates margins
- **Stock Validation**: Prevents overselling across multiple batches
- **Error Handling**: Comprehensive validation and error messages

### Sales API Endpoints

**Create Sale (Cashier/Pharmacist Only)**
```
POST /api/v1/sales
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "items": [
    {
      "medicine": "medicineId",
      "quantity": 10,
      "pricePerUnit": 15.99
    }
  ],
  "paymentMethod": "cash",
  "discountAmount": 5.00,
  "taxAmount": 12.50
}

Response (201):
{
  "status": "success",
  "message": "Sale recorded successfully",
  "data": {
    "sale": {
      "_id": "...",
      "totalAmount": 165.40,
      "items": [...]
    }
  }
}
```

**Get All Sales**
```
GET /api/v1/sales?startDate=2026-02-01&endDate=2026-02-28
Authorization: Bearer <token>
```

**Get Available Stock for Medicine**
```
GET /api/v1/sales/stock/:medicineId
Authorization: Bearer <token>
```

### FIFO Deduction Logic

When a sale is created, the system:
1. Validates all medicines exist and sufficient stock is available
2. Fetches batches sorted by earliest expiry date
3. Deducts from oldest batch first
4. Updates all affected batch records
5. Creates the sale document
6. Automatically rolls back all changes if any step fails

## Reports & Analytics API

10 comprehensive report endpoints powered by MongoDB aggregation pipelines.

### Available Report Endpoints

| Endpoint | Purpose | Query Parameters |
|----------|---------|------------------|
| `GET /api/v1/reports/sales/today` | Daily sales totals | - |
| `GET /api/v1/reports/sales/monthly` | Monthly breakdown | year, month |
| `GET /api/v1/reports/medicines/top-selling` | Top medicines by revenue | limit, startDate, endDate |
| `GET /api/v1/reports/medicines/low-stock` | Low inventory alerts | threshold |
| `GET /api/v1/reports/medicines/expiring` | Expiry warnings | days |
| `GET /api/v1/reports/profit` | Profit & margin analysis | startDate, endDate |
| `GET /api/v1/reports/sales/trend` | Sales trends over time | groupBy, startDate, endDate |
| `GET /api/v1/reports/inventory/health` | Inventory health score | - |
| `GET /api/v1/reports/medicines/category` | Category analysis | startDate, endDate |
| `GET /api/v1/reports/suppliers/performance` | Supplier metrics | - |

### Sample Report Response

**Get Total Sales Today:**
```
GET /api/v1/reports/sales/today
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": {
    "report": {
      "date": "2026-02-25",
      "totalAmount": 5420.50,
      "transactionCount": 24,
      "averageTransaction": 225.85,
      "netRevenue": 5275.50,
      "totalDiscount": 145.00,
      "totalTax": 380.00
    }
  }
}
```

### Report Features

- ✅ MongoDB aggregation pipelines for performance
- ✅ Date range filtering and grouping
- ✅ Automatic calculations (sum, avg, min, max)
- ✅ Nested data population via lookups
- ✅ Chart-ready JSON output
- ✅ Response times: 95-1400ms depending on data volume

### Tested & Verified

All 10 report endpoints have been tested and verified working:
- ✅ 100% test pass rate
- ✅ All endpoints return 200 OK
- ✅ Authentication working correctly
- ✅ Data aggregation accurate
- See `TESTING_REPORT.md` for detailed test results

## API Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Database Models

The application includes the following data models:

- **User**: Authentication and user management
- **Medicine**: Medicine catalog and metadata
- **Supplier**: Supplier information and contacts
- **Batch**: Medicine batch tracking with expiry dates
- **Purchase**: Purchase orders and batch creation
- **Sale**: Sales transactions and profit tracking

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Issues
- Verify MongoDB Atlas cluster is running
- Check IP whitelist includes your IP (0.0.0.0/0 for development)
- Verify connection string in `.env`
- Check network connectivity and firewall

### Authentication Errors
- Ensure JWT_SECRET is set in `.env`
- Verify token is included in Authorization header
- Check token expiration time
- Re-login to get a fresh token

## Support & Documentation

- Full test report: [TESTING_REPORT.md](TESTING_REPORT.md)
- Environment setup: [.env.example](.env.example)
- Source code: [src/](src/) directory

