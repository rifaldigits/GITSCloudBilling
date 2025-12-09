# Google Workspace Products - API Setup Script

This file contains all the API requests needed to create the Google Workspace product catalog.

## Instructions

1. Ensure your server is running: `npm run dev`
2. Copy each cURL command and run it in your terminal
3. Or use a tool like Postman/Thunder Client to send these requests

---

## BUSINESS EDITIONS

### 1. Business Starter (Flex) - Monthly

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Business Starter (Flex)",
    "pricingType": "PRORATE",
    "unitName": "license",
    "priceUsd": 8.40,
    "billingCycle": "MONTHLY",
    "active": true,
    "notes": "GWS-BUS-STR-M - Prorate usage-based"
  }'
```

### 2. Business Starter (Annual) - Yearly

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Business Starter (Annual)",
    "pricingType": "FIXED",
    "unitName": "license",
    "priceUsd": 84.00,
    "billingCycle": "YEARLY",
    "active": true,
    "notes": "GWS-BUS-STR-A - Fixed annual pricing"
  }'
```

### 3. Business Standard (Flex) - Monthly

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Business Standard (Flex)",
    "pricingType": "PRORATE",
    "unitName": "license",
    "priceUsd": 16.80,
    "billingCycle": "MONTHLY",
    "active": true,
    "notes": "GWS-BUS-STD-M - Prorate usage-based"
  }'
```

### 4. Business Standard (Annual) - Yearly

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Business Standard (Annual)",
    "pricingType": "FIXED",
    "unitName": "license",
    "priceUsd": 168.00,
    "billingCycle": "YEARLY",
    "active": true,
    "notes": "GWS-BUS-STD-A - Fixed annual pricing"
  }'
```

### 5. Business Plus (Flex) - Monthly

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Business Plus (Flex)",
    "pricingType": "PRORATE",
    "unitName": "license",
    "priceUsd": 26.40,
    "billingCycle": "MONTHLY",
    "active": true,
    "notes": "GWS-BUS-PLS-M - Prorate usage-based"
  }'
```

### 6. Business Plus (Annual) - Yearly

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Business Plus (Annual)",
    "pricingType": "FIXED",
    "unitName": "license",
    "priceUsd": 264.00,
    "billingCycle": "YEARLY",
    "active": true,
    "notes": "GWS-BUS-PLS-A - Fixed annual pricing"
  }'
```

---

## ENTERPRISE EDITIONS

### 7. Enterprise Standard

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise Standard",
    "pricingType": "FIXED",
    "unitName": "license",
    "priceUsd": 270.00,
    "billingCycle": "YEARLY",
    "active": true,
    "notes": "GWS-ENT-STD-A - Enterprise tier"
  }'
```

### 8. Enterprise Plus

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise Plus",
    "pricingType": "FIXED",
    "unitName": "license",
    "priceUsd": 350.00,
    "billingCycle": "YEARLY",
    "active": true,
    "notes": "GWS-ENT-PLS-A - Premium enterprise tier"
  }'
```

### 9. Enterprise Essentials

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise Essentials",
    "pricingType": "FIXED",
    "unitName": "license",
    "priceUsd": 10.00,
    "billingCycle": "YEARLY",
    "active": true,
    "notes": "GWS-ENT-ESS-A - Essential enterprise features"
  }'
```

---

## FRONTLINE

### 10. Frontline Standard

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontline Standard",
    "pricingType": "FIXED",
    "unitName": "license",
    "priceUsd": 60.00,
    "billingCycle": "YEARLY",
    "active": true,
    "notes": "GWS-FRL-STD-A - For frontline workers"
  }'
```

---

## EDUCATION (Per Student/Per Staff)

### 11. Education Fundamentals

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Education Fundamentals",
    "pricingType": "FIXED",
    "unitName": "student",
    "priceUsd": 0.00,
    "billingCycle": "YEARLY",
    "active": true,
    "notes": "GWS-EDU-FUN - Free tier for education"
  }'
```

### 12. Education Standard

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Education Standard",
    "pricingType": "FIXED",
    "unitName": "student",
    "priceUsd": 3.00,
    "billingCycle": "YEARLY",
    "active": true,
    "notes": "GWS-EDU-STD-A - Standard education tier"
  }'
```

### 13. Education Plus

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Education Plus",
    "pricingType": "FIXED",
    "unitName": "student",
    "priceUsd": 6.00,
    "billingCycle": "YEARLY",
    "active": true,
    "notes": "GWS-EDU-PLS-A - Premium education tier"
  }'
```

### 14. Teaching & Learning Upgrade (Flex)

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teaching & Learning Upgrade (Flex)",
    "pricingType": "PRORATE",
    "unitName": "license",
    "priceUsd": 4.80,
    "billingCycle": "MONTHLY",
    "active": true,
    "notes": "GWS-EDU-TLU-M - Add-on for education"
  }'
```

---

## GEMINI (AI ADD-ONS)

### 15. Gemini Business (Flex) - Monthly

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gemini Business (Flex)",
    "pricingType": "PRORATE",
    "unitName": "license",
    "priceUsd": 24.00,
    "billingCycle": "MONTHLY",
    "active": true,
    "notes": "ADD-GEM-BUS-M - AI add-on flexible"
  }'
```

### 16. Gemini Business (Annual) - Yearly

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gemini Business (Annual)",
    "pricingType": "FIXED",
    "unitName": "license",
    "priceUsd": 240.00,
    "billingCycle": "YEARLY",
    "active": true,
    "notes": "ADD-GEM-BUS-A - AI add-on annual"
  }'
```

### 17. Gemini Enterprise (Flex) - Monthly

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gemini Enterprise (Flex)",
    "pricingType": "PRORATE",
    "unitName": "license",
    "priceUsd": 36.00,
    "billingCycle": "MONTHLY",
    "active": true,
    "notes": "ADD-GEM-ENT-M - Enterprise AI add-on flexible"
  }'
```

### 18. Gemini Enterprise (Annual) - Yearly

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gemini Enterprise (Annual)",
    "pricingType": "FIXED",
    "unitName": "license",
    "priceUsd": 360.00,
    "billingCycle": "YEARLY",
    "active": true,
    "notes": "ADD-GEM-ENT-A - Enterprise AI add-on annual"
  }'
```

---

## UTILITY & ARCHIVE

### 19. Cloud Identity Premium (Flex)

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cloud Identity Premium (Flex)",
    "pricingType": "PRORATE",
    "unitName": "license",
    "priceUsd": 7.20,
    "billingCycle": "MONTHLY",
    "active": true,
    "notes": "ADD-CLD-IDP-M - Identity management service"
  }'
```

### 20. Google Vault (Standalone)

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Google Vault (Standalone)",
    "pricingType": "FIXED",
    "unitName": "license",
    "priceUsd": 60.00,
    "billingCycle": "YEARLY",
    "active": true,
    "notes": "ADD-VAULT-A - Data retention and eDiscovery"
  }'
```

### 21. Archived User (Business)

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Archived User (Business)",
    "pricingType": "PRORATE",
    "unitName": "user",
    "priceUsd": 4.00,
    "billingCycle": "MONTHLY",
    "active": true,
    "notes": "ADD-AU-BUS - Archive inactive users"
  }'
```

---

## Batch Creation Script (PowerShell)

If you want to run all at once, save this as `create-products.ps1`:

```powershell
$products = @(
    '{"name":"Business Starter (Flex)","pricingType":"PRORATE","unitName":"license","priceUsd":8.40,"billingCycle":"MONTHLY","active":true,"notes":"GWS-BUS-STR-M"}',
    '{"name":"Business Starter (Annual)","pricingType":"FIXED","unitName":"license","priceUsd":84.00,"billingCycle":"YEARLY","active":true,"notes":"GWS-BUS-STR-A"}',
    '{"name":"Business Standard (Flex)","pricingType":"PRORATE","unitName":"license","priceUsd":16.80,"billingCycle":"MONTHLY","active":true,"notes":"GWS-BUS-STD-M"}',
    '{"name":"Business Standard (Annual)","pricingType":"FIXED","unitName":"license","priceUsd":168.00,"billingCycle":"YEARLY","active":true,"notes":"GWS-BUS-STD-A"}',
    '{"name":"Business Plus (Flex)","pricingType":"PRORATE","unitName":"license","priceUsd":26.40,"billingCycle":"MONTHLY","active":true,"notes":"GWS-BUS-PLS-M"}',
    '{"name":"Business Plus (Annual)","pricingType":"FIXED","unitName":"license","priceUsd":264.00,"billingCycle":"YEARLY","active":true,"notes":"GWS-BUS-PLS-A"}',
    '{"name":"Enterprise Standard","pricingType":"FIXED","unitName":"license","priceUsd":270.00,"billingCycle":"YEARLY","active":true,"notes":"GWS-ENT-STD-A"}',
    '{"name":"Enterprise Plus","pricingType":"FIXED","unitName":"license","priceUsd":350.00,"billingCycle":"YEARLY","active":true,"notes":"GWS-ENT-PLS-A"}',
    '{"name":"Enterprise Essentials","pricingType":"FIXED","unitName":"license","priceUsd":10.00,"billingCycle":"YEARLY","active":true,"notes":"GWS-ENT-ESS-A"}',
    '{"name":"Frontline Standard","pricingType":"FIXED","unitName":"license","priceUsd":60.00,"billingCycle":"YEARLY","active":true,"notes":"GWS-FRL-STD-A"}',
    '{"name":"Education Fundamentals","pricingType":"FIXED","unitName":"student","priceUsd":0.00,"billingCycle":"YEARLY","active":true,"notes":"GWS-EDU-FUN"}',
    '{"name":"Education Standard","pricingType":"FIXED","unitName":"student","priceUsd":3.00,"billingCycle":"YEARLY","active":true,"notes":"GWS-EDU-STD-A"}',
    '{"name":"Education Plus","pricingType":"FIXED","unitName":"student","priceUsd":6.00,"billingCycle":"YEARLY","active":true,"notes":"GWS-EDU-PLS-A"}',
    '{"name":"Teaching & Learning Upgrade (Flex)","pricingType":"PRORATE","unitName":"license","priceUsd":4.80,"billingCycle":"MONTHLY","active":true,"notes":"GWS-EDU-TLU-M"}',
    '{"name":"Gemini Business (Flex)","pricingType":"PRORATE","unitName":"license","priceUsd":24.00,"billingCycle":"MONTHLY","active":true,"notes":"ADD-GEM-BUS-M"}',
    '{"name":"Gemini Business (Annual)","pricingType":"FIXED","unitName":"license","priceUsd":240.00,"billingCycle":"YEARLY","active":true,"notes":"ADD-GEM-BUS-A"}',
    '{"name":"Gemini Enterprise (Flex)","pricingType":"PRORATE","unitName":"license","priceUsd":36.00,"billingCycle":"MONTHLY","active":true,"notes":"ADD-GEM-ENT-M"}',
    '{"name":"Gemini Enterprise (Annual)","pricingType":"FIXED","unitName":"license","priceUsd":360.00,"billingCycle":"YEARLY","active":true,"notes":"ADD-GEM-ENT-A"}',
    '{"name":"Cloud Identity Premium (Flex)","pricingType":"PRORATE","unitName":"license","priceUsd":7.20,"billingCycle":"MONTHLY","active":true,"notes":"ADD-CLD-IDP-M"}',
    '{"name":"Google Vault (Standalone)","pricingType":"FIXED","unitName":"license","priceUsd":60.00,"billingCycle":"YEARLY","active":true,"notes":"ADD-VAULT-A"}',
    '{"name":"Archived User (Business)","pricingType":"PRORATE","unitName":"user","priceUsd":4.00,"billingCycle":"MONTHLY","active":true,"notes":"ADD-AU-BUS"}'
)

foreach ($product in $products) {
    Write-Host "Creating product..."
    curl -X POST http://localhost:3000/api/products `
      -H "Content-Type: application/json" `
      -d $product
    Write-Host ""
}

Write-Host "All products created!"
```

Run with: `.\create-products.ps1`

---

## Summary

- **Total Products:** 21
- **Fixed Pricing:** 13 products
- **Prorate Pricing:** 8 products
- **Categories:** Business (6), Enterprise (3), Frontline (1), Education (4), Gemini AI (4), Utility (3)

All products are ready to be created in your GITS Cloud Billing system!
