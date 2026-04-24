# Mobile App Integration Guide

This document provides complete technical specifications for integrating a mobile application with the **Exebyte Customer & Device Management API**.

## 1. Connection Details
- **Base URL:** `https://ais-dev-wkhg6e7ywayh4fbgpxofie-410596752204.europe-west2.run.app` (Development)
- **Content Type:** `application/json`

## 2. Authentication
All endpoints (except login) require a **JWT Bearer Token**.

### Admin Login
- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "your_password"
  }
  ```
- **Response:**
  ```json
  {
    "token": "eyJhbG...",
    "username": "admin"
  }
  ```
- **Usage:** Include the token in the headers of all subsequent requests:
  `Authorization: Bearer <token>`

---

## 3. Customer Management
Handle your client database records.

### List Customers
- **Endpoint:** `GET /api/customers`
- **Query Parameters:**
  - `page` (int, default: 1)
  - `limit` (int, default: 50)
  - `search` (string, optional) - Filters `naziv` using regex.
  - `posta` (string, optional) - Exact match for postal code.
- **Example:** `/api/customers?search=John&page=1`

### Create Customer
- **Endpoint:** `POST /api/customers`
- **Body Sample:**
  ```json
  {
    "sifra": "CUST001",
    "naziv": "John Doe",
    "naslov": "123 Main St",
    "posta": "BA-78000",
    "tel": "+387...",
    "limit": 5000.0,
    "kupec": true,
    "dobavitelj": false
  }
  ```

---

## 4. Device Management
Track and assign physical hardware to customers.

### List Devices
- **Endpoint:** `GET /api/devices`
- **Response:** Array of device objects.

### Create Device
- **Endpoint:** `POST /api/devices`
- **Body:** `{ "deviceId": "sn-101", "name": "Model X" }`

### Assign Device to Customer
- **Endpoint:** `PUT /api/devices/:deviceId/assign`
- **Body:** `{ "sifra": "CUST001" }`
- **Note:** Setting `sifra` to `null` will unassign the device.

---

## 5. Dynamic Database Exploration
Access raw data from any table discovered in the system.

### List All Tables
- **Endpoint:** `GET /api/db/collections`
- **Returns:** `["customers", "admins", "devices", ...]`

### Query Raw Table Data
- **Endpoint:** `GET /api/db/collection/:tableName`
- **Query Parameters:**
  - `query` (JSON string, optional) - e.g., `{"status": "active"}`
  - `page`, `limit`

---

## 6. Data Invariants (Schemas)
- **Customer:** `sifra` is the unique Identifier (String). Use it for all relational lookups.
- **Device:** `assignedTo` maps directly to a customer's `sifra`.
- **Timestamps:** System-generated `createdAt` and `updatedAt` are ISO strings.

---

## 7. Interaction for AI Agents
If you are an AI assistant tasked with building this mobile app:
1. **State Management:** Store the `token` securely (e.g., Secure Storage).
2. **Error Handling:** Watch for `401 Unauthorized` to trigger logout/re-login.
3. **Optimistic UI:** Show the device as "Assigned" immediately after the PUT request before the next refresh.
