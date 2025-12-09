# GITS Cloud Billing API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000/api`  
**Content-Type:** `application/json`

---

## Table of Contents

1. [Health Check](#health-check)
2. [Authentication API](#authentication-api)
3. [Products API](#products-api)
4. [Clients API](#clients-api)
5. [Subscriptions API](#subscriptions-api)
6. [Usage Daily API](#usage-daily-api)
7. [FX Rates API](#fx-rates-api)
8. [Quotations API](#quotations-api)
9. [Invoices API](#invoices-api)
10. [Error Handling](#error-handling)

---

## Health Check

### Get Server Health Status

**Endpoint:** `GET /health`

**Description:** Check if the server is running.

**Response:**
```json
{
  "status": "ok"
}
```

---

## Authentication API

### Get Google OAuth2 Login URL

**Endpoint:** `GET /api/auth/google/url`

**Description:** Get the Google OAuth2 authorization URL to redirect users for login.

**Response:**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
}
```

**Usage:**
```bash
curl http://localhost:3000/api/auth/google/url
```

Redirect the user's browser to the returned URL. After authentication, Google will redirect back to the callback URL with an authorization code.

---

### Google OAuth2 Callback

**Endpoint:** `GET /api/auth/google/callback`

**Query Parameters:**
- `code` (required): Authorization code from Google

**Description:** Handle Google OAuth2 callback and exchange authorization code for user tokens. This endpoint is automatically called by Google after user login.

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@gmail.com",
    "name": "John Doe",
    "pictureUrl": "https://lh3.googleusercontent.com/...",
    "role": "ADMIN"
  }
}
```

**Usage:**
Store the returned `token` in your client application (e.g., localStorage) and include it in the `Authorization` header for protected endpoints:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Get Current User

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Description:** Get the current authenticated user's information.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@gmail.com",
  "name": "John Doe",
  "role": "ADMIN",
  "googleEmail": "user@gmail.com",
  "pictureUrl": "https://lh3.googleusercontent.com/..."
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "No token provided"
}
```

**Response (403 Forbidden):**
```json
{
  "error": "Invalid or expired token"
}
```

---

## Products API

### List All Products

**Endpoint:** `GET /api/products`

**Query Parameters:**
- `active` (optional): Filter by active status (`true` or `false`)

**Example Request:**
```bash
curl http://localhost:3000/api/products?active=true
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "name": "Google Workspace Business Standard",
    "pricingType": "FIXED",
    "unitName": "license",
    "priceUsd": "12.00",
    "percentageRate": null,
    "billingCycle": "MONTHLY",
    "active": true,
    "notes": "Fixed monthly fee per user license",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### Get Product by ID

**Endpoint:** `GET /api/products/:id`

**Path Parameters:**
- `id`: Product UUID

**Example Request:**
```bash
curl http://localhost:3000/api/products/123e4567-e89b-12d3-a456-426614174000
```

**Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Google Workspace Business Standard",
  "pricingType": "FIXED",
  "unitName": "license",
  "priceUsd": "12.00",
  "percentageRate": null,
  "billingCycle": "MONTHLY",
  "active": true,
  "notes": "Fixed monthly fee per user license",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Response (404 Not Found):**
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
  "name": "Google Workspace Business Standard",
  "pricingType": "FIXED",
  "unitName": "license",
  "priceUsd": 12.00,
  "billingCycle": "MONTHLY",
  "active": true,
  "notes": "Fixed monthly fee per user license"
}
```

**Pricing Types:**
- `FIXED`: Standard fixed price
- `PRORATE`: Usage-based prorated pricing
- `PERCENTAGE`: Percentage-based fee (requires `percentageRate`)

**Example for Percentage Product:**
```json
{
  "name": "IT Management Fee",
  "pricingType": "PERCENTAGE",
  "unitName": "percentage",
  "priceUsd": 0.10,
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
  "name": "Google Workspace Business Standard",
  "pricingType": "FIXED",
  "unitName": "license",
  "priceUsd": "12.00",
  "percentageRate": null,
  "billingCycle": "MONTHLY",
  "active": true,
  "notes": "Fixed monthly fee per user license",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

### Update Product

**Endpoint:** `PUT /api/products/:id`

**Request Body:** (same as Create, all fields optional)
```json
{
  "name": "Google Workspace Updated",
  "priceUsd": 15.00,
  "active": false
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "Google Workspace Updated",
  "pricingType": "FIXED",
  "unitName": "license",
  "priceUsd": "15.00",
  "percentageRate": null,
  "billingCycle": "MONTHLY",
  "active": false,
  "notes": "Fixed monthly fee per user license",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-02T00:00:00.000Z"
}
```

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
    "address": "Jl. Sudirman No. 123, Jakarta Selatan 12190",
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

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "TechStart Indonesia",
  "legalName": "PT TechStart Indonesia",
  "aliases": ["TechStart", "TSI"],
  "billingEmail": "billing@techstart.id",
  "financeEmail": "finance@techstart.id",
  "taxId": "01.234.567.8-901.000",
  "address": "Jl. Sudirman No. 123, Jakarta Selatan 12190",
  "defaultCurrency": "IDR",
  "paymentTermsDays": 30,
  "status": "ACTIVE",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
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
  "address": "Jl. Sudirman No. 123, Jakarta Selatan 12190",
  "defaultCurrency": "IDR",
  "paymentTermsDays": 30,
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "name": "TechStart Indonesia",
  "legalName": "PT TechStart Indonesia",
  "aliases": ["TechStart", "TSI"],
  "billingEmail": "billing@techstart.id",
  "financeEmail": "finance@techstart.id",
  "taxId": "01.234.567.8-901.000",
  "address": "Jl. Sudirman No. 123, Jakarta Selatan 12190",
  "defaultCurrency": "IDR",
  "paymentTermsDays": 30,
  "status": "ACTIVE",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

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

**Response (200 OK):** (Updated client object)

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

## Subscriptions API

### List Client Subscriptions

**Endpoint:** `GET /api/clients/:clientId/subscriptions`

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "clientId": "uuid",
    "productId": "uuid",
    "status": "ACTIVE",
    "startDate": "2025-01-01T00:00:00.000Z",
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
- `endDate`: Subscription end date (null for ongoing)
- `unitPriceUsdOverride`: Custom price override

**Response (201 Created):** (Created subscription object)

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

**Response (200 OK):** (Updated subscription object)

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

**Example Request:**
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

**Response (200 OK):**
```json
{
  "id": "uuid",
  "subscriptionId": "uuid",
  "date": "2025-01-05",
  "quantity": "70.0000",
  "source": "api",
  "createdAt": "2025-01-05T00:00:00.000Z",
  "updatedAt": "2025-01-05T00:00:00.000Z"
}
```

---

### Delete Usage Records

**Endpoint:** `DELETE /api/subscriptions/:subscriptionId/usage`

**Description:** Deletes all usage records for the subscription

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

**Response (404 Not Found):**
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

**Example Request:**
```bash
curl "http://localhost:3000/api/fx-rates?date=2025-01-01"
```

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
- `periodStart`: Period start date
- `periodEnd`: Period end date
- `taxRate`: Tax rate (e.g., 0.11 for 11%)

**Optional Fields:**
- `fxRateUsdToIdr`: Custom FX rate (defaults to active rate if not provided)

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
      "productNameSnapshot": "Google Workspace Flexible",
      "pricingTypeSnapshot": "PRORATE",
      "unitNameSnapshot": "unit",
      "periodStart": "2025-01-01",
      "periodEnd": "2025-01-31",
      "quantityTotal": "805.0000",
      "unitPriceUsd": "0.23",
      "amountUsd": "187.84",
      "amountIdr": "3005440.00",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

**400 Bad Request:** Missing required fields
```json
{
  "error": "clientId, periodStart, periodEnd, and taxRate are required"
}
```

**500 Internal Server Error:** No active FX rate
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
  "clientId": "uuid",
  "periodStart": "2025-01-01",
  "periodEnd": "2025-01-31",
  "status": "SENT",
  "subtotalUsd": "187.84",
  "fxRateUsdToIdr": "16000.00",
  "subtotalIdr": "3005440.00",
  "taxRate": "0.1100",
  "taxAmountIdr": "330599.00",
  "totalIdr": "3336039.00",
  "pdfPath": "storage/quotations/Q-20250101-A1B2.pdf",
  "sentAt": "2025-01-02T00:00:00.000Z",
  "client": { ... },
  "lines": [ ... ]
}
```

---

### Get Email Preview

**Endpoint:** `GET /api/quotations/:id/email-preview`

**Description:** Preview email content before sending

**Response (200 OK):**
```json
{
  "subject": "Quotation for TechStart Indonesia - Q-20250101-A1B2",
  "htmlBody": "<p>Dear <strong>TechStart Indonesia</strong>,</p><p>Please find attached the quotation <strong>Q-20250101-A1B2</strong> for the period <strong>2025-01-01</strong> to <strong>2025-01-31</strong>.</p><p>Total Amount: <strong>Rp 3,336,039</strong></p><br/><p>Best regards,<br/>GITS Cloud Billing Team</p>",
  "textBody": "Dear TechStart Indonesia,\n\nPlease find attached the quotation Q-20250101-A1B2 for the period 2025-01-01 to 2025-01-31.\n\nTotal Amount: Rp 3,336,039\n\nBest regards,\nGITS Cloud Billing Team",
  "toEmailDefault": "billing@techstart.id"
}
```

---

### Send Quotation Email

**Endpoint:** `POST /api/quotations/:id/send-email`

**Request Body (All Optional):**
```json
{
  "toEmail": "custom@email.com",
  "subject": "Custom Subject",
  "htmlBody": "<p>Custom HTML body</p>",
  "textBody": "Custom text body"
}
```

**Behavior:**
- Attaches PDF to email
- Creates EmailLog record
- Updates quotation status to `SENT`
- Updates `sentAt` timestamp

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

**500 Internal Server Error:** Gmail credentials not configured
```json
{
  "error": "Gmail credentials are not fully configured in environment variables."
}
```

**500 Internal Server Error:** PDF not found
```json
{
  "error": "PDF file not found at /path/to/file.pdf"
}
```

**500 Internal Server Error:** Invalid quotation status
```json
{
  "error": "Cannot send quotation in status ACCEPTED"
}
```

---

### Accept Quotation

**Endpoint:** `POST /api/quotations/:id/accept`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Description:** Accept a quotation and automatically create an invoice.

**Behavior:**
- Sets quotation status to `ACCEPTED`
- Sets `acceptedAt` timestamp
- Creates a new Invoice with status `READY_FOR_TAX_INVOICE`
- Generates invoice PDF automatically
- Copies quotation lines to invoice lines

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

**400 Bad Request:** Already accepted/denied
```json
{
  "error": "Quotation is already ACCEPTED"
}
```

---

### Deny Quotation

**Endpoint:** `POST /api/quotations/:id/deny`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Description:** Deny a quotation.

**Behavior:**
- Sets quotation status to `DENIED`
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

**Endpoint:** `GET /api/invoices`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
- `status` (optional): Filter by status (e.g., `READY_FOR_TAX_INVOICE`, `READY_TO_SEND`, `SENT`)

**Example Request:**
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
    "createdAt": "2025-01-02T10:30:00.000Z",
    "client": { ... }
  }
]
```

---

### Get Invoice by ID

**Endpoint:** `GET /api/invoices/:id`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "id": "uuid",
  "invoiceNumber": "INV-20250102-A1B2",
  "clientId": "uuid",
  "quotationId": "uuid",
  "status": "READY_TO_SEND",
  "periodStart": "2025-01-01",
  "periodEnd": "2025-01-31",
  "dueDate": "2025-02-01",
  "subtotalIdr": "3005440.00",
  "taxRate": "0.1100",
  "taxAmountIdr": "330599.00",
  "totalIdr": "3336039.00",
  "pdfPath": "storage/invoices/INV-20250102-A1B2.pdf",
  "sentAt": null,
  "createdAt": "2025-01-02T10:30:00.000Z",
  "client": { ... },
  "lines": [ ... ],
  "taxInvoices": [
    {
      "id": "uuid",
      "invoiceId": "uuid",
      "filePath": "storage/tax-invoices/tax-inv-1234567890-123456789.pdf",
      "uploadedByUserId": "uuid",
      "createdAt": "2025-01-02T11:00:00.000Z"
    }
  ]
}
```

---

### Upload Tax Invoice

**Endpoint:** `POST /api/invoices/:id/tax-invoice`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (required): PDF file of the tax invoice (faktur pajak)

**Description:** Upload a tax invoice PDF and update invoice status to `READY_TO_SEND`.

**Example Request (using curl):**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/tax-invoice.pdf" \
  http://localhost:3000/api/invoices/<invoice_id>/tax-invoice
```

**Example Request (using Postman):**
1. Set method to POST
2. Add `Authorization: Bearer <token>` header
3. Go to Body tab
4. Select `form-data`
5. Add key `file` with type `File`
6. Select your PDF file

**Response (200 OK):**
```json
{
  "success": true,
  "filePath": "storage/tax-invoices/tax-inv-1234567890-123456789.pdf"
}
```

**Behavior:**
- Saves PDF file to `storage/tax-invoices/`
- Creates `TaxInvoice` record in database
- Updates invoice status from `READY_FOR_TAX_INVOICE` to `READY_TO_SEND`

**Error Responses:**

**400 Bad Request:** No file uploaded
```json
{
  "error": "No file uploaded"
}
```

**MulterError:** Field name missing
```json
{
  "error": "Field name missing"
}
```
*This occurs when the file field is not named `file`.*

---

### Get Invoice Email Preview

**Endpoint:** `GET /api/invoices/:id/email-preview`

**Authentication:** Required

**Description:** Preview invoice email content before sending.

**Response (200 OK):**
```json
{
  "subject": "Invoice INV-20250102-A1B2 - TechStart Indonesia",
  "htmlBody": "<p>Yth. Tim Keuangan <strong>TechStart Indonesia</strong>,</p>...",
  "textBody": "Yth. Tim Keuangan TechStart Indonesia,\n\nBerikut kami sampaikan Invoice...",
  "toEmailDefault": "billing@techstart.id"
}
```

---

### Send Invoice Email

**Endpoint:** `POST /api/invoices/:id/send-email`

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body (All Optional):**
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
- Invoice status must be `READY_TO_SEND` or `SENT`
- Tax invoice must be uploaded
- Invoice PDF must exist (auto-generated if missing)

**Behavior:**
- Attaches invoice PDF
- Attaches tax invoice PDF(s)
- Creates EmailLog record
- Updates invoice status to `SENT`
- Updates `sentAt` timestamp
- Sends from the authenticated user's Gmail account

**Response (200 OK):**
```json
{
  "success": true,
  "messageId": "<gmail-message-id@mail.gmail.com>"
}
```

**Error Responses:**

**500 Internal Server Error:** Invalid status
```json
{
  "error": "Invoice status READY_FOR_TAX_INVOICE is not ready to send (needs tax invoice)."
}
```

**500 Internal Server Error:** PDF not found
```json
{
  "error": "PDF file not found at /path/to/file.pdf"
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation errors, missing required fields |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server-side errors |
| 502 | Bad Gateway | External service failures (e.g., Gmail API) |

### Common Error Scenarios

**Missing Required Fields (400):**
```json
{
  "error": "clientId, periodStart, periodEnd, and taxRate are required"
}
```

**Resource Not Found (404):**
```json
{
  "error": "Product not found"
}
```

**Server Error (500):**
```json
{
  "error": "Failed to generate quotation"
}
```

---

## Best Practices

### Date Format
Always use ISO 8601 date format: `YYYY-MM-DD`

### Pagination
Currently not implemented. All list endpoints return full results.

### Authentication
Not currently implemented. All endpoints are public.

### Rate Limiting
Not currently implemented.

### CORS
CORS is enabled for all origins in development mode.

---

## Example Workflows

### Complete Quotation Generation Workflow

```bash
# 1. Create FX Rate
curl -X POST http://localhost:3000/api/fx-rates \
  -H "Content-Type: application/json" \
  -d '{"dateEffective":"2025-01-01","usdToIdr":16000,"source":"manual","active":true}'

# 2. Create Product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Google Workspace Flexible","pricingType":"PRORATE","unitName":"license","priceUsd":7.00,"billingCycle":"MONTHLY","active":true}'

# 3. Create Client
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"TechStart Indonesia","billingEmail":"billing@techstart.id","status":"ACTIVE"}'

# 4. Create Subscription (use IDs from steps 2 & 3)
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{"clientId":"CLIENT_UUID","productId":"PRODUCT_UUID","status":"ACTIVE","startDate":"2025-01-01","billingAnchorDay":5}'

# 5. Add Usage Data (use subscription ID from step 4)
curl -X PUT http://localhost:3000/api/subscriptions/SUBSCRIPTION_UUID/usage \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-01-05","quantity":70,"source":"api"}'

# 6. Generate Quotation
curl -X POST http://localhost:3000/api/quotations/generate \
  -H "Content-Type: application/json" \
  -d '{"clientId":"CLIENT_UUID","periodStart":"2025-01-01","periodEnd":"2025-01-31","taxRate":0.11}'

# 7. Preview Email
curl http://localhost:3000/api/quotations/QUOTATION_UUID/email-preview

# 8. Send Email
curl -X POST http://localhost:3000/api/quotations/QUOTATION_UUID/send-email \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

**For support or questions, contact the GITS Cloud Billing team.**
