# GITS Cloud Billing API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000/api`  
**Content-Type:** `application/json`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Health Check](#health-check)
4. [Authentication API](#authentication-api)
5. [Products API](#products-api)
6. [Clients API](#clients-api)
7. [Subscriptions API](#subscriptions-api)
8. [Usage Daily API](#usage-daily-api)
9. [FX Rates API](#fx-rates-api)
10. [Quotations API](#quotations-api)
11. [Invoices API](#invoices-api)
12. [Error Handling](#error-handling)

---

## Overview

The GITS Cloud Billing API provides comprehensive endpoints for managing cloud service billing, subscriptions, quotations, and invoices. The API uses REST principles, returns JSON responses, and supports OAuth2 authentication via Google.

### Endpoint Summary

| Category | Endpoints | Auth Required |
|----------|-----------|---------------|
| Health | 1 | No |
| Authentication | 3 | Partial |
| Products | 5 | No |
| Clients | 6 | No |
| Subscriptions | 4 | No |
| Usage Daily | 3 | No |
| FX Rates | 3 | No |
| Quotations | 6 | Partial |
| Invoices | 5 | Yes |
| **Total** | **36** | - |

---

## Authentication

### Protected Endpoints

Endpoints marked with 🔒 require authentication. Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

1. Get OAuth URL: `GET /api/auth/google/url`
2. Redirect user to Google OAuth
3. Handle callback: `GET /api/auth/google/callback?code=...`
4. Store returned `token` in your application
5. Use token in `Authorization` header for protected endpoints

---

## Health Check

### Get Server Health Status

**Endpoint:** `GET /health`

**Description:** Check if the server is running and healthy.

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

**Example:**
```bash
curl http://localhost:3000/health
```

---

## Authentication API

### Get Google OAuth2 URL

**Endpoint:** `GET /api/auth/google/url`

**Description:** Retrieve the Google OAuth2 authorization URL for user login.

**Response (200 OK):**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&response_type=code&scope=..."
}
```

**Usage Flow:**
1. Call this endpoint from your frontend
2. Redirect user's browser to the returned URL
3. User authenticates with Google
4. Google redirects back to callback URL with `code` parameter

**Example:**
```bash
curl http://localhost:3000/api/auth/google/url
```

---

### Google OAuth2 Callback

**Endpoint:** `GET /api/auth/google/callback`

**Query Parameters:**
- `code` (required): Authorization code from Google

**Description:** Exchange authorization code for user tokens. This endpoint is automatically called by Google after user authentication.

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@gmail.com",
    "name": "John Doe",
    "role": "ADMIN",
    "pictureUrl": "https://lh3.googleusercontent.com/..."
  }
}
```

**Usage:**
Store the `token` in your frontend (localStorage, sessionStorage, or secure cookie) and include it in the `Authorization` header for protected endpoints.

**Error Responses:**

**400 Bad Request:** Missing code
```json
{
  "error": "Missing code parameter"
}
```

**500 Internal Server Error:** Authentication failed
```json
{
  "error": "Authentication failed"
}
```

---

### Get Current User Info

**Endpoint:** `GET /api/auth/me` 🔒

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Description:** Retrieve information about the currently authenticated user.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@gmail.com",
  "name": "John Doe",
  "role": "ADMIN",
  "googleId": "1234567890",
  "googleEmail": "user@gmail.com",
  "pictureUrl": "https://lh3.googleusercontent.com/...",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Note:** Sensitive fields (`accessToken`, `refreshToken`, `passwordHash`) are excluded from the response.

**Error Responses:**

**401 Unauthorized:** No token provided
```json
{
  "error": "No token provided"
}
```

**403 Forbidden:** Invalid token
```json
{
  "error": "Invalid or expired token"
}
```

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/auth/me
```

---

## Products API

### List All Products

**Endpoint:** `GET /api/products`

**Query Parameters:**
- `active` (optional): Filter by status (`true` or `false`)

**Description:** Retrieve all products, optionally filtered by active status.

**Example Request:**
```bash
curl "http://localhost:3000/api/products?active=true"
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "name": "Business Standard (Flex)",
    "pricingType": "PRORATE",
    "unitName": "license",
    "priceUsd": "16.80",
    "percentageRate": null,
    "billingCycle": "MONTHLY",
    "active": true,
    "notes": "GWS-BUS-STD-M - Prorate usage-based",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

**Pricing Types:**
- `FIXED`: Standard fixed price
- `PRORATE`: Usage-based prorated pricing
- `PERCENTAGE`: Percentage-based fee (requires `percentageRate`)

---

### Get Product by ID

**Endpoint:** `GET /api/products/:id`

**Path Parameters:**
- `id`: Product UUID

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "Business Standard (Flex)",
  "pricingType": "PRORATE",
  "unitName": "license",
  "priceUsd": "16.80",
  "percentageRate": null,
  "billingCycle": "MONTHLY",
  "active": true,
  "notes": "GWS-BUS-STD-M",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "error": "Product not found"
}
```

---

### Create Product

**Endpoint:** `POST /api/products`

**Request Body:**
```json
{
  "name": "Business Standard (Flex)",
  "pricingType": "PRORATE",
  "unitName": "license",
  "priceUsd": 16.80,
  "billingCycle": "MONTHLY",
  "active": true,
  "notes": "GWS-BUS-STD-M"
}
```

**For Percentage Products:**
```json
{
  "name": "IT Management Fee",
  "pricingType": "PERCENTAGE",
  "unitName": "percentage",
  "priceUsd": 0,
  "percentageRate": 0.1000,
  "billingCycle": "MONTHLY",
  "active": true,
  "notes": "10% management fee"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "name": "Business Standard (Flex)",
  "pricingType": "PRORATE",
  "unitName": "license",
  "priceUsd": "16.80",
  "percentageRate": null,
  "billingCycle": "MONTHLY",
  "active": true,
  "notes": "GWS-BUS-STD-M",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

### Update Product

**Endpoint:** `PUT /api/products/:id`

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Product Name",
  "priceUsd": 18.00,
  "active": false
}
```

**Response (200 OK):** Updated product object

---

### Delete Product

**Endpoint:** `DELETE /api/products/:id`

**Response (200 OK):**
```json
{
  "message": "Product deleted successfully"
}
```

---

## Clients API

### List All Clients

**Endpoint:** `GET /api/clients`

**Query Parameters:**
- `status` (optional): Filter by status (`ACTIVE`, `SUSPENDED`, `INACTIVE`)

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "name": "TechStart Indonesia",
    "legalName": "PT TechStart Indonesia",
    "aliases": ["TechStart", "TSI"],
    "billingEmail": "billing@techstart.id",
    "financeEmail": "finance@techstart.id",
    "taxId": "01.234.567.8-901.000",
    "address": "Jl. Sudirman No. 123, Jakarta",
    "defaultCurrency": "IDR",
    "paymentTermsDays": 30,
    "status": "ACTIVE",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### Get Client by ID

**Endpoint:** `GET /api/clients/:id`

**Response (200 OK):** Single client object (same structure as list)

**Error Responses:**

**404 Not Found:**
```json
{
  "error": "Client not found"
}
```

---

### Create Client

**Endpoint:** `POST /api/clients`

**Request Body:**
```json
{
  "name": "TechStart Indonesia",
  "legalName": "PT TechStart Indonesia",
  "aliases": ["TechStart", "TSI"],
  "billingEmail": "billing@techstart.id",
  "financeEmail": "finance@techstart.id",
  "taxId": "01.234.567.8-901.000",
  "address": "Jl. Sudirman No. 123, Jakarta",
  "defaultCurrency": "IDR",
  "paymentTermsDays": 30,
  "status": "ACTIVE"
}
```

**Required Fields:**
- `name`
- `billingEmail`

**Response (201 Created):** Created client object

---

### Update Client

**Endpoint:** `PUT /api/clients/:id`

**Request Body:** (all fields optional)
```json
{
  "status": "SUSPENDED",
  "paymentTermsDays": 60
}
```

**Response (200 OK):** Updated client object

---

### Delete Client

**Endpoint:** `DELETE /api/clients/:id`

**Response (200 OK):**
```json
{
  "message": "Client deleted successfully"
}
```

---

### List Client Subscriptions

**Endpoint:** `GET /api/clients/:clientId/subscriptions`

**Description:** Retrieve all subscriptions for a specific client.

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "clientId": "uuid",
    "productId": "uuid",
    "status": "ACTIVE",
    "startDate": "2025-01-01",
    "endDate": null,
    "billingAnchorDay": 5,
    "unitPriceUsdOverride": null,
    "notes": "Main workspace subscription",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "client": { ... },
    "product": { ... }
  }
]
```

---

## Subscriptions API

### Get Subscription by ID

**Endpoint:** `GET /api/subscriptions/:id`

**Response (200 OK):**
```json
{
  "id": "uuid",
  "clientId": "uuid",
  "productId": "uuid",
  "status": "ACTIVE",
  "startDate": "2025-01-01",
  "endDate": null,
  "billingAnchorDay": 5,
  "unitPriceUsdOverride": null,
  "notes": "Main workspace subscription",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "client": { ... },
  "product": { ... }
}
```

---

### Create Subscription

**Endpoint:** `POST /api/subscriptions`

**Request Body:**
```json
{
  "clientId": "uuid",
  "productId": "uuid",
  "status": "ACTIVE",
  "startDate": "2025-01-01",
  "billingAnchorDay": 5,
  "notes": "Main workspace subscription"
}
```

**Optional Fields:**
- `endDate`: Subscription end date (null = ongoing)
- `unitPriceUsdOverride`: Custom price override

**Response (201 Created):** Created subscription object

---

### Update Subscription

**Endpoint:** `PUT /api/subscriptions/:id`

**Request Body:** (all fields optional)
```json
{
  "status": "CANCELLED",
  "endDate": "2025-12-31"
}
```

**Response (200 OK):** Updated subscription object

---

### Delete Subscription

**Endpoint:** `DELETE /api/subscriptions/:id`

**Response (200 OK):**
```json
{
  "message": "Subscription deleted successfully"
}
```

---

## Usage Daily API

### Get Usage Records

**Endpoint:** `GET /api/subscriptions/:subscriptionId/usage`

**Query Parameters:**
- `startDate` (optional): Filter from date (YYYY-MM-DD)
- `endDate` (optional): Filter to date (YYYY-MM-DD)

**Example:**
```bash
curl "http://localhost:3000/api/subscriptions/uuid/usage?startDate=2025-01-01&endDate=2025-01-31"
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "subscriptionId": "uuid",
    "date": "2025-01-05",
    "quantity": "70.0000",
    "source": "api",
    "createdAt": "2025-01-05T00:00:00.000Z",
    "updatedAt": "2025-01-05T00:00:00.000Z"
  }
]
```

---

### Upsert Usage Record

**Endpoint:** `PUT /api/subscriptions/:subscriptionId/usage`

**Request Body:**
```json
{
  "date": "2025-01-05",
  "quantity": 70,
  "source": "api"
}
```

**Source Options:**
- `manual`: Manually entered
- `import_csv`: Imported from CSV
- `api`: From external API

**Behavior:** Creates or updates usage record for the given date. Only one usage record per subscription per date.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "subscriptionId": "uuid",
  "date": "2025-01-05",
  "quantity": "70.0000",
  "source": "api",
  "createdAt": "2025-01-05T00:00:00.000Z",
  "updatedAt": "2025-01-05T10:30:00.000Z"
}
```

---

### Delete Usage Records

**Endpoint:** `DELETE /api/subscriptions/:subscriptionId/usage`

**Description:** Delete ALL usage records for the subscription.

**Response (200 OK):**
```json
{
  "message": "Usage records deleted",
  "count": 30
}
```

---

## FX Rates API

### Get Active FX Rate

**Endpoint:** `GET /api/fx-rates/active`

**Description:** Get the currently active USD to IDR exchange rate.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "dateEffective": "2025-01-01",
  "usdToIdr": "16000.00",
  "source": "manual",
  "active": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "error": "No active FX rate found"
}
```

---

### Get FX Rate by Date

**Endpoint:** `GET /api/fx-rates`

**Query Parameters:**
- `date` (required): Effective date (YYYY-MM-DD)

**Example:**
```bash
curl "http://localhost:3000/api/fx-rates?date=2025-01-01"
```

**Response (200 OK):** FX rate object (same structure as active rate)

---

### Create FX Rate

**Endpoint:** `POST /api/fx-rates`

**Request Body:**
```json
{
  "dateEffective": "2025-01-01",
  "usdToIdr": 16000.00,
  "source": "manual",
  "active": true
}
```

**Behavior:**
- If `active: true`, automatically deactivates all previous active rates
- Only one active rate can exist at a time

**Response (201 Created):**
```json
{
  "id": "uuid",
  "dateEffective": "2025-01-01",
  "usdToIdr": "16000.00",
  "source": "manual",
  "active": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

## Quotations API

### Generate Quotation

**Endpoint:** `POST /api/quotations/generate`

**Request Body:**
```json
{
  "clientId": "uuid",
  "periodStart": "2025-01-01",
  "periodEnd": "2025-01-31",
  "fxRateUsdToIdr": 16000,
  "taxRate": 0.11
}
```

**Required Fields:**
- `clientId`: Client UUID
- `periodStart`: Period start date (YYYY-MM-DD)
- `periodEnd`: Period end date (YYYY-MM-DD)
- `taxRate`: Tax rate (e.g., 0.11 for 11%)

**Optional Fields:**
- `fxRateUsdToIdr`: Custom FX rate (defaults to active rate if not provided)

**Behavior:**
1. Retrieves all active subscriptions for client
2. Calculates billing for each subscription based on pricing type
3. For PRORATE products, aggregates usage from UsageDaily
4. Generates quote number (Q-YYYYMMDD-XXXX)
5. Creates quotation and line items
6. Generates PDF automatically
7. Returns quotation with status DRAFT

**Response (201 Created):**
```json
{
  "id": "uuid",
  "quoteNumber": "Q-20250101-A1B2",
  "clientId": "uuid",
  "periodStart": "2025-01-01",
  "periodEnd": "2025-01-31",
  "status": "DRAFT",
  "subtotalUsd": "187.84",
  "fxRateUsdToIdr": "16000.00",
  "subtotalIdr": "3005440.00",
  "taxRate": "0.1100",
  "taxAmountIdr": "330599.00",
  "totalIdr": "3336039.00",
  "pdfPath": "storage/quotations/Q-20250101-A1B2.pdf",
  "sentAt": null,
  "acceptedAt": null,
  "deniedAt": null,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "lines": [
    {
      "id": "uuid",
      "quotationId": "uuid",
      "subscriptionId": "uuid",
      "productNameSnapshot": "Business Standard (Flex)",
      "pricingTypeSnapshot": "PRORATE",
      "unitNameSnapshot": "license",
      "periodStart": "2025-01-01",
      "periodEnd": "2025-01-31",
      "quantityTotal": "805.0000",
      "unitPriceUsd": "0.56",
      "amountUsd": "187.84",
      "amountIdr": "3005440.00",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "error": "clientId, periodStart, periodEnd, and taxRate are required"
}
```

**500 Internal Server Error:**
```json
{
  "error": "No active FX rate found and none provided."
}
```

---

### Get Quotation by ID

**Endpoint:** `GET /api/quotations/:id`

**Response (200 OK):**
```json
{
  "id": "uuid",
  "quoteNumber": "Q-20250101-A1B2",
  "status": "SENT",
  "sentAt": "2025-01-02T00:00:00.000Z",
  "client": { ... },
  "lines": [ ... ]
}
```

---

### Get Email Preview

**Endpoint:** `GET /api/quotations/:id/email-preview`

**Description:** Preview email content before sending.

**Response (200 OK):**
```json
{
  "subject": "Quotation for TechStart Indonesia - Q-20250101-A1B2",
  "htmlBody": "<p>Dear <strong>TechStart Indonesia</strong>,...</p>",
  "textBody": "Dear TechStart Indonesia,\n\nPlease find attached...",
  "toEmailDefault": "billing@techstart.id"
}
```

---

### Send Quotation Email

**Endpoint:** `POST /api/quotations/:id/send-email` 🔒

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:** (all optional)
```json
{
  "toEmail": "custom@email.com",
  "subject": "Custom Subject",
  "htmlBody": "<p>Custom HTML body</p>",
  "textBody": "Custom text body"
}
```

**Behavior:**
- Sends email from authenticated user's Gmail account
- Attaches quotation PDF
- Creates EmailLog record
- Updates quotation status to SENT
- Sets `sentAt` timestamp

**Response (200 OK):**
```json
{
  "id": "uuid",
  "quoteNumber": "Q-20250101-A1B2",
  "status": "SENT",
  "sentAt": "2025-01-02T10:30:00.000Z",
  ...
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "error": "No token provided"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Cannot send quotation in status ACCEPTED"
}
```

---

### Accept Quotation

**Endpoint:** `POST /api/quotations/:id/accept` 🔒

**Authentication:** Required

**Description:** Accept a quotation and automatically create an invoice.

**Behavior:**
1. Sets quotation status to ACCEPTED
2. Sets `acceptedAt` timestamp
3. Generates invoice number (INV-YYYYMMDD-XXXX)
4. Creates Invoice record with status READY_FOR_TAX_INVOICE
5. Copies quotation lines to invoice lines
6. Generates invoice PDF automatically
7. Calculates due date (creationDate + client.paymentTermsDays)

**Response (200 OK):**
```json
{
  "id": "uuid",
  "quoteNumber": "Q-20250101-A1B2",
  "status": "ACCEPTED",
  "acceptedAt": "2025-01-02T10:30:00.000Z",
  ...
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "error": "Quotation is already ACCEPTED"
}
```

---

### Deny Quotation

**Endpoint:** `POST /api/quotations/:id/deny` 🔒

**Authentication:** Required

**Description:** Deny a quotation.

**Behavior:**
- Sets quotation status to DENIED
- Sets `deniedAt` timestamp

**Response (200 OK):**
```json
{
  "id": "uuid",
  "quoteNumber": "Q-20250101-A1B2",
  "status": "DENIED",
  "deniedAt": "2025-01-02T10:30:00.000Z",
  ...
}
```

---

## Invoices API

### List Invoices

**Endpoint:** `GET /api/invoices` 🔒

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by status

**Status Values:**
- `DRAFT`
- `READY_FOR_TAX_INVOICE`
- `READY_TO_SEND`
- `SENT`
- `PAID`
- `OVERDUE`
- `CANCELLED`

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/invoices?status=READY_FOR_TAX_INVOICE"
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "invoiceNumber": "INV-20250102-A1B2",
    "clientId": "uuid",
    "quotationId": "uuid",
    "status": "READY_FOR_TAX_INVOICE",
    "periodStart": "2025-01-01",
    "periodEnd": "2025-01-31",
    "dueDate": "2025-02-01",
    "subtotalIdr": "3005440.00",
    "taxRate": "0.1100",
    "taxAmountIdr": "330599.00",
    "totalIdr": "3336039.00",
    "pdfPath": "storage/invoices/INV-20250102-A1B2.pdf",
    "sentAt": null,
    "paidAt": null,
    "createdAt": "2025-01-02T10:30:00.000Z",
    "updatedAt": "2025-01-02T10:30:00.000Z",
    "client": { ... }
  }
]
```

---

### Get Invoice by ID

**Endpoint:** `GET /api/invoices/:id` 🔒

**Authentication:** Required

**Response (200 OK):**
```json
{
  "id": "uuid",
  "invoiceNumber": "INV-20250102-A1B2",
  "status": "READY_TO_SEND",
  "dueDate": "2025-02-01",
  "subtotalIdr": "3005440.00",
  "taxRate": "0.1100",
  "taxAmountIdr": "330599.00",
  "totalIdr": "3336039.00",
  "pdfPath": "storage/invoices/INV-20250102-A1B2.pdf",
  "client": { ... },
  "quotation": { ... },
  "lines": [ ... ],
  "taxInvoices": [
    {
      "id": "uuid",
      "invoiceId": "uuid",
      "filePath": "storage/tax-invoices/tax-inv-1234567890-123456789.pdf",
      "uploadedByUserId": "uuid",
      "uploadedAt": "2025-01-02T11:00:00.000Z",
      "createdAt": "2025-01-02T11:00:00.000Z"
    }
  ]
}
```

---

### Upload Tax Invoice

**Endpoint:** `POST /api/invoices/:id/tax-invoice` 🔒

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (required): PDF file of the tax invoice (faktur pajak)

**Description:** Upload a tax invoice PDF and update invoice status.

**Behavior:**
- Saves PDF to `storage/tax-invoices/` with unique filename
- Creates TaxInvoice record in database
- Updates invoice status from READY_FOR_TAX_INVOICE to READY_TO_SEND

**Example (curl):**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/tax-invoice.pdf" \
  http://localhost:3000/api/invoices/<invoice_id>/tax-invoice
```

**Example (Postman):**
1. Method: POST
2. Headers: `Authorization: Bearer <token>`
3. Body → form-data
4. Key: `file` (type: File)
5. Value: Select PDF file

**Response (200 OK):**
```json
{
  "success": true,
  "filePath": "storage/tax-invoices/tax-inv-1736234567890-987654321.pdf"
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "error": "No file uploaded"
}
```

**MulterError:**
```json
{
  "error": "Field name missing"
}
```
*Note: This occurs when the form field is not named `file`*

---

### Get Invoice Email Preview

**Endpoint:** `GET /api/invoices/:id/email-preview` 🔒

**Authentication:** Required

**Description:** Preview invoice email content before sending.

**Response (200 OK):**
```json
{
  "subject": "Invoice INV-20250102-A1B2 - TechStart Indonesia",
  "htmlBody": "<p>Yth. Tim Keuangan <strong>TechStart Indonesia</strong>,...</p>",
  "textBody": "Yth. Tim Keuangan TechStart Indonesia,\n\nBerikut kami sampaikan Invoice...",
  "toEmailDefault": "billing@techstart.id"
}
```

---

### Send Invoice Email

**Endpoint:** `POST /api/invoices/:id/send-email` 🔒

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:** (all optional)
```json
{
  "toEmail": "custom@email.com",
  "subject": "Custom Subject",
  "htmlBody": "<p>Custom HTML body</p>",
  "textBody": "Custom text body"
}
```

**Description:** Send invoice email with both invoice PDF and tax invoice PDF attachments.

**Requirements:**
- Invoice status must be READY_TO_SEND or SENT
- Tax invoice must be uploaded
- Invoice PDF must exist (auto-generated if missing)

**Behavior:**
- Attaches invoice PDF
- Attaches tax invoice PDF(s)
- Sends from authenticated user's Gmail account
- Creates EmailLog record
- Updates invoice status to SENT
- Sets `sentAt` timestamp

**Response (200 OK):**
```json
{
  "success": true,
  "messageId": "<CAAbCdEFg12345@mail.gmail.com>"
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "error": "No token provided"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Invoice status READY_FOR_TAX_INVOICE is not ready to send (needs tax invoice)."
}
```

**500 Internal Server Error:**
```json
{
  "error": "PDF file not found at /path/to/file.pdf"
}
```

---

## Error Handling

### Standard Error Response Format

All errors return JSON with an `error` field:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

| Code | Description | Common Usage |
|------|-------------|--------------|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST |
| `400` | Bad Request | Validation errors, missing required fields |
| `401` | Unauthorized | Missing authentication token |
| `403` | Forbidden | Invalid/expired token, insufficient permissions |
| `404` | Not Found | Resource not found |
| `500` | Internal Server Error | Server-side errors, database errors, external API failures |

### Common Error Scenarios

**Missing Authentication:**
```json
{
  "error": "No token provided"
}
```

**Invalid Token:**
```json
{
  "error": "Invalid or expired token"
}
```

**Resource Not Found:**
```json
{
  "error": "Product not found"
}
```

**Validation Error:**
```json
{
  "error": "clientId, periodStart, periodEnd, and taxRate are required"
}
```

**Business Logic Error:**
```json
{
  "error": "Cannot send quotation in status ACCEPTED"
}
```

---

## Best Practices

### 1. Authentication
- Always include valid JWT token for protected endpoints
- Store tokens securely (httpOnly cookies or secure storage)
- Refresh tokens when near expiry

### 2. Date Formats
- Always use ISO 8601 format for dates: `YYYY-MM-DD`
- Timestamps are in ISO 8601 with timezone: `YYYY-MM-DDTHH:mm:ss.sssZ`

### 3. Decimals
- Send numbers as JSON numbers, not strings
- System handles precision internally

### 4. File Uploads
- Use `multipart/form-data` content type
- Field name must be exactly `file`
- Only PDF files accepted for tax invoices

### 5. Pagination
- Currently not implemented
- All list endpoints return full results
- Filter using query parameters where available

### 6. Rate Limiting
- Currently not implemented
- Consider implementing for production use

---

## Quick Start Guide

### 1. Setup Products
```bash
# Create a product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Business Standard (Flex)",
    "pricingType": "PRORATE",
    "unitName": "license",
    "priceUsd": 16.80,
    "billingCycle": "MONTHLY",
    "active": true
  }'
```

### 2. Create Client
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechStart Indonesia",
    "billingEmail": "billing@techstart.id",
    "paymentTermsDays": 30
  }'
```

### 3. Create Subscription
```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "<client_uuid>",
    "productId": "<product_uuid>",
    "status": "ACTIVE",
    "startDate": "2025-01-01",
    "billingAnchorDay": 5
  }'
```

### 4. Record Usage (for PRORATE products)
```bash
curl -X PUT http://localhost:3000/api/subscriptions/<subscription_uuid>/usage \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-01-05",
    "quantity": 70,
    "source": "api"
  }'
```

### 5. Generate Quotation
```bash
curl -X POST http://localhost:3000/api/quotations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "<client_uuid>",
    "periodStart": "2025-01-01",
    "periodEnd": "2025-01-31",
    "taxRate": 0.11
  }'
```

### 6. Authenticate
```bash
# Get OAuth URL
curl http://localhost:3000/api/auth/google/url

# After Google auth, you'll receive a token
# Use it for protected endpoints
```

### 7. Send Quotation
```bash
curl -X POST http://localhost:3000/api/quotations/<quotation_uuid>/send-email \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json"
```

### 8. Accept Quotation & Create Invoice
```bash
curl -X POST http://localhost:3000/api/quotations/<quotation_uuid>/accept \
  -H "Authorization: Bearer <your_token>"
```

### 9. Upload Tax Invoice
```bash
curl -X POST http://localhost:3000/api/invoices/<invoice_uuid>/tax-invoice \
  -H "Authorization: Bearer <your_token>" \
  -F "file=@tax-invoice.pdf"
```

### 10. Send Invoice
```bash
curl -X POST http://localhost:3000/api/invoices/<invoice_uuid>/send-email \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json"
```

---

**End of API Documentation**

For questions or issues, contact the GITS Cloud Billing team.
