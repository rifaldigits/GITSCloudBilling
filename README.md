# GITS Cloud Billing

A comprehensive backend system for managing cloud service billing, subscriptions, and quotations with automated PDF generation and email delivery.

## Overview

GITS Cloud Billing is a TypeScript-based backend application designed to handle complex billing scenarios for B2B cloud services. It supports multiple pricing models (fixed, prorated, and percentage-based), currency conversion, tax calculation, quotation generation, and automated email delivery via Gmail.

## Features

### ✨ Core Features

- **Multi-Model Pricing Engine**
  - Fixed pricing for standard subscriptions
  - Prorated pricing based on daily usage
  - Percentage-based fees (e.g., management fees)
  - Precise rounding rules (USD: ceil to cents, IDR: ceil to rupiah)

- **Quotation Management**
  - Automated quotation generation from billing calculations
  - Professional PDF generation with company branding
  - Email delivery with PDF attachments via Gmail API
  - Preview mode before sending

- **Subscription & Usage Tracking**
  - Multi-client subscription management
  - Daily usage recording and aggregation
  - Flexible billing anchor dates
  - Support for various billing cycles

- **FX Rate Management**
  - Dynamic USD to IDR conversion
  - Auto-deactivation of previous rates
  - Date-effective rate management

- **Comprehensive API**
  - RESTful endpoints for all core entities
  - CRUD operations for products, clients, subscriptions
  - Usage tracking and reporting
  - Quotation generation and email workflows

## Tech Stack

- **Runtime**: Node.js (v20+)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (via Prisma ORM)
- **PDF Generation**: PDFKit
- **Email**: Gmail API (via googleapis) + Nodemailer
- **Development**: ts-node-dev
- **Package Manager**: npm

## Prerequisites

- Node.js v20 or higher
- PostgreSQL database
- Gmail OAuth2 credentials (for email features)
- Docker & Docker Compose (optional, for local database)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd GITSCloudBilling
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gits_billing"

# Server
PORT=3000

# Gmail OAuth2 (for email features)
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token
GMAIL_REDIRECT_URL=https://developers.google.com/oauthplayground
GMAIL_USER_EMAIL=your_email@gmail.com
```

### 4. Database Setup

#### Option A: Using Docker Compose

```bash
npm run db:up
```

#### Option B: Manual PostgreSQL Setup

Ensure PostgreSQL is running and accessible at the `DATABASE_URL` specified in your `.env` file.

### 5. Run Migrations

```bash
npm run prisma:migrate
npm run prisma:generate
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured PORT).

### Production Build

```bash
npm run build
npm start
```

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Endpoints

#### Products

- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

#### Clients

- `GET /api/clients` - List all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

#### Subscriptions

- `GET /api/clients/:clientId/subscriptions` - List client subscriptions
- `GET /api/subscriptions/:id` - Get subscription by ID
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription

#### Usage Daily

- `GET /api/subscriptions/:subscriptionId/usage` - Get usage records
- `PUT /api/subscriptions/:subscriptionId/usage` - Upsert usage record
- `DELETE /api/subscriptions/:subscriptionId/usage` - Delete usage records

#### FX Rates

- `GET /api/fx-rates/active` - Get active FX rate
- `GET /api/fx-rates` - Get FX rate by date
- `POST /api/fx-rates` - Create new FX rate

#### Quotations

- `POST /api/quotations/generate` - Generate new quotation
  ```json
  {
    "clientId": "uuid",
    "periodStart": "2025-01-01",
    "periodEnd": "2025-01-31",
    "fxRateUsdToIdr": 16000,  // optional
    "taxRate": 0.11
  }
  ```

- `GET /api/quotations/:id` - Get quotation details
- `GET /api/quotations/:id/email-preview` - Preview email content
- `POST /api/quotations/:id/send-email` - Send quotation via email
  ```json
  {
    "toEmail": "client@example.com",  // optional override
    "subject": "custom subject",       // optional override
    "htmlBody": "<p>custom html</p>",  // optional override
    "textBody": "custom text"          // optional override
  }
  ```

### Health Check

- `GET /health` - Server health status

## Project Structure

```
GITSCloudBilling/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── controllers/           # Request handlers
│   │   ├── productController.ts
│   │   ├── clientController.ts
│   │   ├── subscriptionController.ts
│   │   ├── usageDailyController.ts
│   │   ├── fxRateController.ts
│   │   └── quotationController.ts
│   ├── repositories/          # Data access layer
│   │   ├── productRepository.ts
│   │   ├── clientRepository.ts
│   │   ├── subscriptionRepository.ts
│   │   ├── usageDailyRepository.ts
│   │   └── fxRateRepository.ts
│   ├── routes/                # API route definitions
│   │   ├── productRoutes.ts
│   │   ├── clientRoutes.ts
│   │   ├── subscriptionRoutes.ts
│   │   ├── usageDailyRoutes.ts
│   │   ├── fxRateRoutes.ts
│   │   └── quotationRoutes.ts
│   ├── services/              # Business logic
│   │   ├── billingEngine.ts        # Core pricing calculations
│   │   ├── billingEngine.test.ts   # Billing engine tests
│   │   ├── pdfService.ts           # PDF generation
│   │   ├── quotationService.ts     # Quotation orchestration
│   │   └── emailService.ts         # Email delivery
│   ├── prisma/
│   │   └── client.ts          # Prisma client instance
│   └── server.ts              # Express app setup
├── storage/
│   └── quotations/            # Generated PDF files
├── .env                       # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Key Concepts

### Billing Engine

The billing engine (`src/services/billingEngine.ts`) implements three pricing models:

1. **FIXED**: `price × quantity` (full month charge)
2. **PRORATE**: Daily usage-based calculation with 30-day divisor
   - Formula: `Σ(daily_quantity × (monthly_price / 30))`
   - Rounds up to USD cents after aggregation
3. **PERCENTAGE**: Calculated on subtotal of non-percentage lines
   - Formula: `subtotal × percentage_rate`

**Rounding Rules:**
- USD amounts: Always round UP to 2 decimal places
- IDR amounts: Always round UP to nearest integer

### Quotation Workflow

1. **Generate**: Calculate billing amounts → Create quotation record → Generate PDF
2. **Preview**: Fetch quotation → Build email template → Return preview
3. **Send**: Attach PDF → Send via Gmail API → Log email → Update status to SENT

### Database Schema

Key entities:
- **Product**: Service definitions with pricing types
- **Client**: Customer information
- **Subscription**: Client-product relationships
- **UsageDaily**: Daily usage metrics for prorated billing
- **FxRate**: Currency conversion rates
- **Quotation**: Generated quotations with lines
- **EmailLog**: Audit trail for sent emails

## Development

### Available Scripts

```bash
# Development server with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production server
npm start

# Database commands
npm run db:up          # Start PostgreSQL (Docker)
npm run db:down        # Stop PostgreSQL (Docker)
npm run db:logs        # View PostgreSQL logs

# Prisma commands
npm run prisma:migrate # Run database migrations
npm run prisma:generate # Generate Prisma client
```

### Running Tests

```bash
# Run billing engine tests
npx ts-node src/services/billingEngine.test.ts
```

### Database Migrations

Create a new migration:

```bash
npx prisma migrate dev --name description_of_change
```

## Gmail API Setup

To enable email features:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Gmail API
4. Create OAuth2 credentials
5. Use [OAuth2 Playground](https://developers.google.com/oauthplayground) to get refresh token
6. Add credentials to `.env` file

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error
- `502` - Bad Gateway (external service failures, e.g., Gmail API)

## Static File Serving

PDF files are served statically at:

```
http://localhost:3000/storage/quotations/<filename>.pdf
```

## Future Enhancements

- [ ] Authentication & Authorization (JWT)
- [ ] Invoice generation from quotations
- [ ] Payment tracking
- [ ] Dashboard & reporting
- [ ] Email templates customization
- [ ] Webhook support for automated usage ingestion
- [ ] Multi-currency support beyond USD/IDR

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Your License Here]

## Support

For questions or issues, please contact the GITS Cloud Billing team.
