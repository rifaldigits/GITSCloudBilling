# GITS Cloud Billing

A comprehensive TypeScript-based backend system for managing cloud service billing, subscriptions, quotations, and invoices with Google OAuth2 authentication, automated PDF generation, and email delivery via Gmail API.

## Overview

GITS Cloud Billing is designed to handle complex B2B billing scenarios for cloud services (specifically Google Workspace products). It features multiple pricing models, automated quotation-to-invoice workflows, tax invoice management, currency conversion, and per-user email sending through authenticated Gmail accounts.

## ✨ Key Features

### 🔐 Authentication & Authorization
- **Google OAuth2 Integration** - Secure login via Google accounts
- **JWT Session Management** - Stateless authentication with JSON Web Tokens
- **Per-User Email Sending** - Each user sends emails from their own Gmail account
- **Role-Based Access** - ADMIN and FINANCE user roles
- **Protected Endpoints** - Auth middleware for sensitive operations

### 💰 Multi-Model Pricing Engine
- **FIXED** - Standard fixed price per billing cycle
- **PRORATE** - Daily usage-based calculation (`Σ(daily_quantity × (monthly_price / 30))`)
- **PERCENTAGE** - Percentage-based fees calculated on subtotal
- **Precise Rounding** - USD: ceil to cents, IDR: ceil to rupiah

### 📋 Quotation Management
- **Automated Generation** - Calculate billing from subscriptions and usage
- **Professional PDF** - Auto-generated PDFs with company branding
- **Email Delivery** - Send via authenticated user's Gmail with PDF attachment
- **Preview Mode** - Preview email content before sending
- **Accept/Deny Workflow** - Quotations can be accepted (creates invoice) or denied
- **Status Tracking** - DRAFT → SENT → ACCEPTED/DENIED/EXPIRED

### 🧾 Invoice Management
- **Auto-Creation** - Invoices generated automatically from accepted quotations
- **Professional PDFs** - Invoice PDFs with line items, taxes, and due dates
- **Tax Invoice Upload** - Upload Tax Invoice (Faktur Pajak) PDFs via multipart/form-data
- **Dual-PDF Emails** - Send both invoice and tax invoice in one email
- **Status Flow** - READY_FOR_TAX_INVOICE → READY_TO_SEND → SENT → PAID
- **Due Date Calculation** - Based on client payment terms (default 30 days)

### 📊 Subscription & Usage Tracking
- **Multi-Client Management** - Manage subscriptions across multiple clients
- **Daily Usage Recording** - Track daily usage for prorated billing
- **Flexible Billing Anchors** - Custom billing anchor days per subscription
- **Usage Sources** - Manual, CSV import, or API

### 💱 FX Rate Management
- **Dynamic USD to IDR Conversion** - Date-effective exchange rates
- **Auto-Deactivation** - Automatically deactivates previous rates
- **Manual or API Sources** - Track rate origin

### 📧 Email System
- **Gmail API Integration** - OAuth2-authenticated email sending
- **Per-User Sending** - Uses logged-in user's Gmail account
- **Email Logging** - Audit trail of all sent emails
- **PDF Attachments** - Attach quotations, invoices, and tax invoices

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js v20+ |
| Language | TypeScript |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| PDF Generation | PDFKit |
| Email | Gmail API (googleapis) + Nodemailer |
| Authentication | Google OAuth2 + JWT |
| File Upload | Multer |
| Development | ts-node-dev |

## 📋 Prerequisites

- **Node.js** v20 or higher
- **PostgreSQL** database
- **Google Cloud Project** with Gmail API enabled
- **OAuth2 Credentials** (Client ID, Client Secret, Redirect URI)
- **Docker** (optional, for local PostgreSQL)

## 🚀 Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd GITSCloudBilling
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gits_billing"

# Server
PORT=3000

# Google OAuth2 (for authentication and email)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# JWT Secret (use a strong random string)
JWT_SECRET=your_very_secret_random_key_here
```

### 4. Database Setup

#### Option A: Using Docker

```bash
npm run db:up
```

#### Option B: Manual PostgreSQL

Ensure PostgreSQL is running and accessible at your `DATABASE_URL`.

### 5. Run Migrations

```bash
npm run prisma:migrate
npm run prisma:generate
```

### 6. Seed Products (Optional)

Load Google Workspace product catalog:

```bash
# See SETUP-PRODUCTS.md for complete product setup scripts
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

Server starts on `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Quick Reference

| Category | Endpoints | Auth Required |
|----------|-----------|---------------|
| **Auth** | 3 endpoints | Partial |
| **Products** | 5 endpoints | No |
| **Clients** | 6 endpoints | No |
| **Subscriptions** | 7 endpoints | No |
| **FX Rates** | 3 endpoints | No |
| **Quotations** | 6 endpoints | Partial (3/6) |
| **Invoices** | 5 endpoints | Yes (all) |

See **[API.md](./API.md)** for complete endpoint documentation.

### Authentication Flow

1. **Get OAuth URL**: `GET /api/auth/google/url`
2. **Redirect User**: User authenticates with Google
3. **Handle Callback**: `GET /api/auth/google/callback?code=...`
4. **Store JWT Token**: Frontend stores returned token
5. **Use Token**: Add `Authorization: Bearer <token>` header to requests

### Protected Endpoints (Require Auth)

- All `/api/invoices/*` endpoints
- `POST /api/quotations/:id/accept`
- `POST /api/quotations/:id/deny`
- `POST /api/quotations/:id/send-email`
- `GET /api/auth/me`

## 📁 Project Structure

```
GITSCloudBilling/
├── prisma/
│   ├── schema.prisma              # 14 database models
│   └── migrations/                # Database migrations
├── src/
│   ├── config/
│   │   └── env.ts                 # Environment variables
│   ├── controllers/               # Request handlers (7 controllers)
│   │   ├── productController.ts
│   │   ├── clientController.ts
│   │   ├── subscriptionController.ts
│   │   ├── usageDailyController.ts
│   │   ├── fxRateController.ts
│   │   ├── quotationController.ts
│   │   └── invoiceController.ts
│   ├── middleware/
│   │   └── authMiddleware.ts      # JWT verification
│   ├── repositories/              # Data access layer (6 repos)
│   │   ├── productRepository.ts
│   │   ├── clientRepository.ts
│   │   ├── subscriptionRepository.ts
│   │   ├── usageDailyRepository.ts
│   │   ├── fxRateRepository.ts
│   │   └── index.ts
│   ├── routes/                    # API routes (8 route files)
│   │   ├── authRoutes.ts
│   │   ├── productRoutes.ts
│   │   ├── clientRoutes.ts
│   │   ├── subscriptionRoutes.ts
│   │   ├── usageDailyRoutes.ts
│   │   ├── fxRateRoutes.ts
│   │   ├── quotationRoutes.ts
│   │   └── invoiceRoutes.ts
│   ├── services/                  # Business logic (7 services)
│   │   ├── billingEngine.ts       # Core pricing calculations
│   │   ├── quotationService.ts    # Quotation workflow
│   │   ├── invoiceService.ts      # Invoice workflow
│   │   ├── pdfService.ts          # PDF generation
│   │   ├── emailService.ts        # Gmail integration
│   │   ├── googleAuthService.ts   # OAuth2 handling
│   │   └── billingEngine.test.ts  # Unit tests
│   ├── prisma/
│   │   └── client.ts              # Prisma client instance
│   └── server.ts                  # Express app entry point
├── storage/                       # Generated files
│   ├── quotations/                # Quotation PDFs
│   ├── invoices/                  # Invoice PDFs
│   └── tax-invoices/              # Uploaded tax invoices
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── docker-compose.yml             # PostgreSQL container
├── package.json
├── tsconfig.json
├── API.md                         # Complete API documentation
├── README.md                      # This file
└── SETUP-PRODUCTS.md              # Google Workspace product catalog setup
```

## 🗄️ Database Models

| Model | Description |
|-------|-------------|
| `User` | System users with Google OAuth + JWT |
| `Product` | Service catalog (Google Workspace products) |
| `Client` | B2B customers with billing details |
| `Subscription` | Client-product relationships |
| `UsageDaily` | Daily usage tracking for prorated billing |
| `FxRate` | USD to IDR exchange rates |
| `Quotation` | Generated quotations with line items |
| `QuotationLine` | Individual line items in quotations |
| `Invoice` | Generated invoices from accepted quotations |
| `InvoiceLine` | Individual line items in invoices |
| `TaxInvoice` | Uploaded tax invoice (faktur pajak) PDFs |
| `Payment` | Payment records (future use) |
| `EmailLog` | Audit trail of sent emails |

## 🔄 Typical Workflows

### Quotation to Invoice Flow

1. **Setup**:
   - Create Products (see SETUP-PRODUCTS.md)
   - Create Client
   - Create Subscriptions
   - Record Usage (for prorated products)

2. **Generate Quotation**: `POST /api/quotations/generate`
   - Calculates billing from subscriptions and usage
   - Generates PDF automatically
   - Status: DRAFT

3. **Send Quotation**: `POST /api/quotations/:id/send-email` 🔒
   - Requires authentication
   - Sends from user's Gmail
   - Status: DRAFT → SENT

4. **Accept Quotation**: `POST /api/quotations/:id/accept` 🔒
   - Creates Invoice automatically
   - Generates Invoice PDF
   - Status: SENT → ACCEPTED

5. **Upload Tax Invoice**: `POST /api/invoices/:id/tax-invoice` 🔒
   - Upload faktur pajak PDF
   - Invoice status: READY_FOR_TAX_INVOICE → READY_TO_SEND

6. **Send Invoice**: `POST /api/invoices/:id/send-email` 🔒
   - Sends both invoice + tax invoice PDFs
   - Invoice status: READY_TO_SEND → SENT

## 💡 Key Concepts

### Billing Engine

Three pricing models implemented in `billingEngine.ts`:

**1. FIXED**
```
amount = price × quantity
```

**2. PRORATE**
```
amount = Σ(daily_quantity × (monthly_price / 30))
```
- Aggregates usage across period
- Rounds UP to USD cents after aggregation

**3. PERCENTAGE**
```
amount = subtotal_of_other_lines × percentage_rate
```
- Applied after other line items calculated

### Rounding Rules
- **USD**: Always round UP to 2 decimal places (cents)
- **IDR**: Always round UP to nearest integer (rupiah)

### FX Rate Resolution
1. Use custom rate if provided in request
2. Otherwise use active FX rate from database
3. Error if no rate available

### Invoice Numbering
- Format: `INV-YYYYMMDD-XXXX`
- `XXXX` = 4-character random hex

### Quotation Numbering
- Format: `Q-YYYYMMDD-XXXX`
- `XXXX` = 4-character random hex

## 🔧 Available Scripts

```bash
# Development
npm run dev                  # Start dev server with hot reload

# Production
npm run build                # Compile TypeScript
npm start                    # Run production server

# Database
npm run db:up                # Start PostgreSQL (Docker)
npm run db:down              # Stop PostgreSQL
npm run db:logs              # View PostgreSQL logs

# Prisma
npm run prisma:migrate       # Run migrations
npm run prisma:generate      # Generate Prisma client
```

## 🔐 Google OAuth2 Setup

1. **Create Google Cloud Project**: [console.cloud.google.com](https://console.cloud.google.com/)
2. **Enable Gmail API**: In APIs & Services
3. **Create OAuth2 Credentials**:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
4. **Add to `.env`**:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
   ```

## 📊 Static File Serving

PDF files are served statically:

- **Quotations**: `http://localhost:3000/storage/quotations/<filename>.pdf`
- **Invoices**: `http://localhost:3000/storage/invoices/<filename>.pdf`
- **Tax Invoices**: `http://localhost:3000/storage/tax-invoices/<filename>.pdf`

## ⚠️ Error Handling

Standard HTTP status codes:

| Code | Description |
|------|-------------|
| 200 | Success (GET, PUT, DELETE) |
| 201 | Created (POST) |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

## 🧪 Testing

```bash
# Run billing engine unit tests
npx ts-node src/services/billingEngine.test.ts
```

## 🌟 Features Implemented

- ✅ Google OAuth2 authentication
- ✅ JWT session management
- ✅ Multi-model pricing engine (FIXED, PRORATE, PERCENTAGE)
- ✅ Quotation generation with PDF
- ✅ Quotation email sending (per-user Gmail)
- ✅ Quotation accept/deny workflow
- ✅ Automatic invoice creation
- ✅ Invoice PDF generation
- ✅ Tax invoice upload
- ✅ Invoice email with dual PDFs
- ✅ FX rate management
- ✅ Usage tracking
- ✅ Email audit logging
- ✅ Protected endpoints

## 🚧 Future Enhancements

- [ ] Payment tracking and reconciliation
- [ ] Dashboard & analytics
- [ ] Email template customization
- [ ] Webhook support for usage ingestion
- [ ] Multi-currency support beyond USD/IDR
- [ ] Frontend application
- [ ] Automated reminders for overdue invoices
- [ ] Batch operations

## 📝 License

[Your License Here]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For questions or issues, contact the GITS Cloud Billing team.
