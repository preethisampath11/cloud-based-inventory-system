# Database Schema Documentation

## Overview
This document outlines the MongoDB database schema for the Pharmacy Management System. The system consists of 6 main collections with relationships between them.

---

## Collections

### 1. Users
Stores user account information with role-based access control.

**Collection Name:** `users`

| Field | Type | Required | Unique | Default | Validation |
|-------|------|----------|--------|---------|-----------|
| `_id` | ObjectId | Yes | Yes | - | Auto-generated |
| `email` | String | Yes | Yes | - | Valid email format |
| `password` | String | Yes | No | - | Min 6 characters, hashed with bcrypt |
| `firstName` | String | Yes | No | - | Trimmed |
| `lastName` | String | Yes | No | - | Trimmed |
| `role` | String | No | No | 'cashier' | Enum: 'admin', 'pharmacist', 'cashier' |
| `isActive` | Boolean | No | No | true | - |
| `lastLogin` | Date | No | No | null | - |
| `createdAt` | Date | Auto | No | Current timestamp | - |
| `updatedAt` | Date | Auto | No | Current timestamp | - |

**Constraints:**
- Email is unique and case-insensitive
- Password is never returned by default in queries (select: false)
- Passwords are hashed before storage using bcrypt with salt 10

**Roles:**
- `admin` - Full system access
- `pharmacist` - Medicine and batch management
- `cashier` - Sales and transaction processing

---

### 2. Medicines
Stores master medicine information and product details.

**Collection Name:** `medicines`

| Field | Type | Required | Unique | Default | Validation |
|-------|------|----------|--------|---------|-----------|
| `_id` | ObjectId | Yes | Yes | - | Auto-generated |
| `name` | String | Yes | Yes (sparse) | - | Trimmed, unique medicine name |
| `genericName` | String | No | No | - | Trimmed |
| `description` | String | No | No | - | Trimmed |
| `dosageForm` | String | No | No | - | Enum: 'tablet', 'capsule', 'liquid', 'injection', 'cream', 'powder', 'drops', 'patch' |
| `dosageStrength` | String | No | No | - | Trimmed (e.g., "500mg", "10mg/5ml") |
| `manufacturer` | String | No | No | - | Trimmed |
| `category` | String | No | No | - | Trimmed |
| `reorderLevel` | Number | No | No | 50 | Min 0 |
| `isActive` | Boolean | No | No | true | - |
| `createdAt` | Date | Auto | No | Current timestamp | - |
| `updatedAt` | Date | Auto | No | Current timestamp | - |

**Constraints:**
- Medicine name is unique (sparse index allows null/empty)
- Reorder level indicates minimum stock before automatic purchase orders

---

### 3. Suppliers
Stores supplier/vendor information for medicine purchases.

**Collection Name:** `suppliers`

| Field | Type | Required | Unique | Default | Validation |
|-------|------|----------|--------|---------|-----------|
| `_id` | ObjectId | Yes | Yes | - | Auto-generated |
| `name` | String | Yes | No | - | Trimmed |
| `contactPerson` | String | No | No | - | Trimmed |
| `email` | String | No | No | - | Valid email format, case-insensitive |
| `phone` | String | No | No | - | Trimmed |
| `address` | String | No | No | - | Trimmed |
| `city` | String | No | No | - | Trimmed |
| `state` | String | No | No | - | Trimmed |
| `zipCode` | String | No | No | - | Trimmed |
| `country` | String | No | No | - | Trimmed |
| `taxId` | String | No | No | - | Trimmed |
| `isActive` | Boolean | No | No | true | - |
| `createdAt` | Date | Auto | No | Current timestamp | - |
| `updatedAt` | Date | Auto | No | Current timestamp | - |

**Relationships:**
- Referenced by `Batch` collection (medicine supplier)
- Referenced by `Purchase` collection (purchase supplier)

---

### 4. Batches
Stores batch/lot information for individual medicine shipments with inventory tracking.

**Collection Name:** `batches`

| Field | Type | Required | Unique | Default | Validation |
|-------|------|----------|--------|---------|-----------|
| `_id` | ObjectId | Yes | Yes | - | Auto-generated |
| `medicine` | ObjectId (ref: Medicine) | Yes | No | - | Reference to medicine |
| `batchNumber` | String | Yes | Yes | - | Unique identifier for each batch |
| `supplier` | ObjectId (ref: Supplier) | Yes | No | - | Reference to supplier |
| `quantityReceived` | Number | Yes | No | - | Min 1 |
| `quantityAvailable` | Number | Yes | No | - | Min 0, decreases with sales |
| `expiryDate` | Date | Yes | No | - | Used for expiry checking |
| `manufacturingDate` | Date | No | No | - | - |
| `costPerUnit` | Number | Yes | No | - | Min 0 |
| `sellingPrice` | Number | Yes | No | - | Min 0 |
| `purchaseDate` | Date | No | No | Current date | - |
| `isExpired` | Boolean | No | No | false | Auto-updated via pre-save hook |
| `notes` | String | No | No | - | Trimmed |
| `createdAt` | Date | Auto | No | Current timestamp | - |
| `updatedAt` | Date | Auto | No | Current timestamp | - |

**Relationships:**
- `medicine` references `Medicine` collection
- `supplier` references `Supplier` collection

**Indexes:**
- `{ medicine: 1, batchNumber: 1 }` - Quick lookup by medicine and batch
- `{ expiryDate: 1 }` - Expiry date queries
- `{ quantityAvailable: 1 }` - Low stock alerts

**Business Logic:**
- `isExpired` is automatically set to true if current date > expiryDate
- `quantityAvailable` decreases as medicines are sold

---

### 5. Purchases
Stores purchase orders placed with suppliers.

**Collection Name:** `purchases`

| Field | Type | Required | Unique | Default | Validation |
|-------|------|----------|--------|---------|-----------|
| `_id` | ObjectId | Yes | Yes | - | Auto-generated |
| `supplier` | ObjectId (ref: Supplier) | Yes | No | - | Reference to supplier |
| `purchaseDate` | Date | Yes | No | Current date | - |
| `expectedDeliveryDate` | Date | No | No | - | - |
| `actualDeliveryDate` | Date | No | No | - | - |
| `items` | Array | Yes | No | - | Array of purchase line items |
| `items[].medicine` | ObjectId (ref: Medicine) | Yes | No | - | Reference to medicine |
| `items[].quantity` | Number | Yes | No | - | Min 1 |
| `items[].costPerUnit` | Number | Yes | No | - | Min 0 |
| `items[].totalCost` | Number | Yes | No | - | Min 0 |
| `totalAmount` | Number | Yes | No | - | Min 0, sum of all items |
| `status` | String | No | No | 'pending' | Enum: 'pending', 'received', 'cancelled', 'partial' |
| `notes` | String | No | No | - | Trimmed |
| `createdAt` | Date | Auto | No | Current timestamp | - |
| `updatedAt` | Date | Auto | No | Current timestamp | - |

**Relationships:**
- `supplier` references `Supplier` collection
- `items[].medicine` references `Medicine` collection

**Indexes:**
- `{ supplier: 1 }` - Supplier-based queries
- `{ status: 1 }` - Status-based filtering
- `{ purchaseDate: 1 }` - Date range queries

**Status Flow:**
- `pending` - Order placed, awaiting delivery
- `received` - All items received and batch records created
- `partial` - Some items received
- `cancelled` - Order cancelled

---

### 6. Sales
Stores point-of-sale transactions for medicines sold to customers.

**Collection Name:** `sales`

| Field | Type | Required | Unique | Default | Validation |
|-------|------|----------|--------|---------|-----------|
| `_id` | ObjectId | Yes | Yes | - | Auto-generated |
| `saleDate` | Date | Yes | No | Current date | - |
| `cashier` | ObjectId (ref: User) | Yes | No | - | Reference to cashier user |
| `items` | Array | Yes | No | - | Array of sale line items |
| `items[].batch` | ObjectId (ref: Batch) | Yes | No | - | Reference to specific batch |
| `items[].medicine` | ObjectId (ref: Medicine) | Yes | No | - | Reference to medicine |
| `items[].quantity` | Number | Yes | No | - | Min 1 |
| `items[].pricePerUnit` | Number | Yes | No | - | Min 0 |
| `items[].totalPrice` | Number | Yes | No | - | Min 0 |
| `totalAmount` | Number | Yes | No | - | Min 0, after discounts and tax |
| `paymentMethod` | String | Yes | No | - | Enum: 'cash', 'card', 'insurance', 'check', 'mobile_money' |
| `discountAmount` | Number | No | No | 0 | Min 0 |
| `taxAmount` | Number | No | No | 0 | Min 0 |
| `notes` | String | No | No | - | Trimmed |
| `createdAt` | Date | Auto | No | Current timestamp | - |
| `updatedAt` | Date | Auto | No | Current timestamp | - |

**Relationships:**
- `cashier` references `User` collection
- `items[].batch` references `Batch` collection
- `items[].medicine` references `Medicine` collection

**Indexes:**
- `{ cashier: 1 }` - Cashier transaction history
- `{ saleDate: 1 }` - Date range queries
- `{ 'items.batch': 1 }` - Batch tracking
- `{ 'items.medicine': 1 }` - Medicine sales history

**Business Logic:**
- Each sale item must be linked to both medicine and specific batch
- Batch quantity is decremented with each sale
- Payment method tracks how the transaction was settled

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        Users                             │
│  (admin, pharmacist, cashier roles)                      │
└───────────────────────────┬─────────────────────────────┘
                            │
                            │ (cashier reference)
                            ↓
                  ┌──────────────────┐
                  │      Sales       │
                  │  (transactions)  │
                  └────────┬─────────┘
                           │
                           ├──→ Batches
                           └──→ Medicines
                                  ↑
                ┌─────────────────┼────────────────┐
                │                 │                │
                ↑                 ↑                ↑
            Medicines         Batches        Purchases
            (master)       (inventory)       (orders)
                │               │                │
                │               ↓                ↓
                ├─────────→ Suppliers ←─────────┤
            (references)  (vendors)  (references)
```

---

## Key Relationships

### User → Sales
- One user (cashier) can have many sales
- Relationship: User._id → Sale.cashier

### Supplier → Batch
- One supplier can provide many batches
- Relationship: Supplier._id → Batch.supplier

### Supplier → Purchase
- One supplier can receive many purchase orders
- Relationship: Supplier._id → Purchase.supplier

### Medicine → Batch
- One medicine can have many batches (different lots)
- Relationship: Medicine._id → Batch.medicine

### Medicine → Purchase (indirect)
- Medicines are purchased via Purchase.items[].medicine
- Relationship: Medicine._id → Purchase.items[].medicine

### Batch → Sale (via items)
- Batches are sold via Sale.items[].batch
- Quantity decreases with each sale

---

## Indexes Summary

| Collection | Index | Purpose |
|-----------|-------|---------|
| Batches | `{ medicine: 1, batchNumber: 1 }` | Prevent duplicate batches per medicine |
| Batches | `{ expiryDate: 1 }` | Find expiring/expired stock |
| Batches | `{ quantityAvailable: 1 }` | Low stock alerts |
| Purchases | `{ supplier: 1 }` | Supplier history |
| Purchases | `{ status: 1 }` | Filter by order status |
| Purchases | `{ purchaseDate: 1 }` | Date range queries |
| Sales | `{ cashier: 1 }` | Cashier reports |
| Sales | `{ saleDate: 1 }` | Sales reports by date |
| Sales | `{ 'items.batch': 1 }` | Batch sales tracking |
| Sales | `{ 'items.medicine': 1 }` | Medicine sales tracking |

---

## Data Validation Rules

### User
- Email must be valid format and unique
- Password minimum 6 characters
- First and last name are required
- Role must be one of predefined enum values

### Medicine
- Name is unique and required
- Dosage form must be from predefined list
- Reorder level cannot be negative

### Supplier
- Name is required
- Email (if provided) must be valid format
- Active status tracks if supplier is still operational

### Batch
- All quantities must be minimum 1 (received) or 0+ (available)
- Expiry date is required
- Cost and price cannot be negative
- Automatically marks as expired if date passes

### Purchase
- Status follows workflow: pending → received or partial → cancelled
- All item costs must match total amount
- Supplier is required

### Sale
- Payment method must be from predefined list
- Discounts and tax are optional but cannot be negative
- All item prices must match total amount
- Cashier reference is required

---

## Timestamp Fields

All collections include automatic timestamp tracking:
- `createdAt` - Record creation timestamp
- `updatedAt` - Last modification timestamp

These are managed automatically by MongoDB/Mongoose and updated on any document modification.

---

## Security Considerations

1. **Password Management**
   - Passwords are hashed using bcrypt with salt factor of 10
   - Password field is never returned in queries by default

2. **Email Validation**
   - Both User and Supplier emails are validated with regex
   - User emails are unique and case-insensitive

3. **Data Integrity**
   - Foreign key references prevent orphaned documents
   - Validation rules prevent invalid data entry

4. **Audit Trail**
   - Timestamps track when records are created and modified
   - Soft delete pattern can be implemented if needed

---

## Future Enhancements

1. Add soft delete fields (deletedAt) for audit trail
2. Add version control for price changes
3. Implement transaction logging for sales
4. Add customer information collection
5. Implement batch allocation strategy (FIFO/LIFO)
6. Add prescription/medication history per customer
7. Implement expiry batch management workflow

