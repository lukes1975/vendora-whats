# Paystack Subaccount & Split Payment Integration Guide

## Overview
This guide demonstrates how Vendora integrates with Paystack's Subaccount and Split Payment APIs to enable direct settlement into entrepreneur accounts.

## 1. Authentication
All API requests use your Paystack secret key:
```bash
Authorization: Bearer sk_test_xxxxx  # Test mode
Authorization: Bearer sk_live_xxxxx  # Live mode
```

## 2. Subaccount Creation Flow

### API Endpoint
```
POST https://api.paystack.co/subaccount
```

### Sample Request
```json
{
  "business_name": "John's Electronics Store",
  "settlement_bank": "044",
  "account_number": "0193274682",
  "percentage_charge": 0.5,
  "description": "Vendora subaccount for John's Electronics Store",
  "primary_contact_email": "john@electronics.com",
  "primary_contact_name": "John Doe",
  "metadata": {
    "vendora_user_id": "user-uuid-here",
    "created_by": "vendora_platform"
  }
}
```

### Sample Response
```json
{
  "status": true,
  "message": "Subaccount created",
  "data": {
    "subaccount_code": "ACCT_8f4k1eq7f0l28gz",
    "business_name": "John's Electronics Store",
    "account_number": "0193274682",
    "percentage_charge": 0.5,
    "settlement_bank": "Guaranty Trust Bank"
  }
}
```

### Implementation (Already in Vendora)
```typescript
// Edge Function: create-paystack-subaccount
const paystackPayload = {
  business_name: requestData.business_name,
  settlement_bank: requestData.settlement_bank,
  account_number: requestData.account_number,
  percentage_charge: requestData.percentage_charge || 0.5,
  description: `Vendora subaccount for ${requestData.business_name}`,
  primary_contact_email: user.email,
  primary_contact_name: requestData.business_name,
  metadata: {
    vendora_user_id: user.id,
    created_by: "vendora_platform"
  }
};
```

## 3. Payment Collection with Subaccount

### Initialize Transaction API
```
POST https://api.paystack.co/transaction/initialize
```

### Sample Request with Subaccount
```json
{
  "amount": 50000,
  "email": "customer@example.com",
  "currency": "NGN",
  "reference": "vendora_1640995200_abc123",
  "subaccount": "ACCT_8f4k1eq7f0l28gz",
  "bearer": "subaccount",
  "transaction_charge": 0,
  "callback_url": "https://vendora.app/payment-success",
  "metadata": {
    "product_id": "prod-123",
    "store_id": "store-456",
    "customer_name": "Jane Doe"
  }
}
```

### Key Parameters Explained
- `subaccount`: The entrepreneur's subaccount code
- `bearer`: Who pays transaction fees ("account" or "subaccount")
- `transaction_charge`: Additional platform commission (in kobo)

### Sample Response
```json
{
  "status": true,
  "message": "Authorization URL created",
  "data": {
    "authorization_url": "https://checkout.paystack.com/0peioxfhpn",
    "access_code": "0peioxfhpn",
    "reference": "vendora_1640995200_abc123"
  }
}
```

## 4. Verify Transaction

### API Endpoint
```
GET https://api.paystack.co/transaction/verify/:reference
```

### Sample Response
```json
{
  "status": true,
  "message": "Verification successful",
  "data": {
    "id": 1641306912,
    "status": "success",
    "reference": "vendora_1640995200_abc123",
    "amount": 50000,
    "gateway_response": "Successful",
    "channel": "card",
    "currency": "NGN",
    "authorization": {
      "authorization_code": "AUTH_72btv547",
      "card_type": "visa",
      "last4": "4081",
      "exp_month": "12",
      "exp_year": "2030",
      "bank": "TEST BANK"
    },
    "customer": {
      "email": "customer@example.com"
    },
    "subaccount": {
      "subaccount_code": "ACCT_8f4k1eq7f0l28gz"
    }
  }
}
```

## 5. Charge Returning Customers

### API Endpoint
```
POST https://api.paystack.co/transaction/charge_authorization
```

### Sample Request
```json
{
  "authorization_code": "AUTH_72btv547",
  "email": "customer@example.com",
  "amount": 30000,
  "currency": "NGN",
  "reference": "vendora_recurring_1640995400_xyz789",
  "subaccount": "ACCT_8f4k1eq7f0l28gz",
  "bearer": "subaccount"
}
```

## 6. Webhook Implementation

### Webhook Events to Handle
- `charge.success`: Payment completed successfully
- `charge.failed`: Payment failed
- `transfer.success`: Settlement completed

### Sample Webhook Payload (charge.success)
```json
{
  "event": "charge.success",
  "data": {
    "id": 1641306912,
    "status": "success",
    "reference": "vendora_1640995200_abc123",
    "amount": 50000,
    "authorization": {
      "authorization_code": "AUTH_72btv547",
      "card_type": "visa",
      "last4": "4081"
    },
    "customer": {
      "email": "customer@example.com"
    },
    "subaccount": {
      "subaccount_code": "ACCT_8f4k1eq7f0l28gz"
    }
  }
}
```

### Webhook Verification (Already in Vendora)
```typescript
const verifyPaystackSignature = (payload: string, signature: string, secret: string): boolean => {
  const hash = createHash("sha512");
  hash.update(secret + payload);
  const expectedSignature = hash.toString();
  return expectedSignature === signature;
};
```

## 7. Database Schema

### Tables in Vendora
```sql
-- Store subaccount codes
bank_accounts (
  subaccount_code TEXT,
  subaccount_status TEXT,
  user_id UUID
);

-- Store customer payment authorizations
customer_authorizations (
  customer_email TEXT UNIQUE,
  authorization_code TEXT,
  card_type TEXT,
  last_4 TEXT
);

-- Orders with payment tracking
orders_v2 (
  payment_reference TEXT,
  status TEXT,
  total INTEGER
);
```

## 8. Error Handling Best Practices

### Common Errors and Solutions

1. **Invalid Subaccount**
```json
{
  "status": false,
  "message": "Invalid subaccount"
}
```
*Solution*: Verify subaccount exists and is active

2. **Insufficient Balance**
```json
{
  "status": false,
  "message": "Insufficient funds"
}
```
*Solution*: Handle gracefully and notify customer

3. **Invalid Authorization Code**
```json
{
  "status": false,
  "message": "Invalid authorization code"
}
```
*Solution*: Request new payment method from customer

## 9. Testing with Sandbox

### Test Cards
- **Successful Payment**: 4084084084084081
- **Insufficient Funds**: 4094849384844044
- **Invalid PIN**: 4000000000000002

### Test Bank Account
- **Account Number**: 0123456789
- **Bank Code**: 044 (Access Bank)

## 10. Sample cURL Commands

### Create Subaccount
```bash
curl -X POST https://api.paystack.co/subaccount \
  -H "Authorization: Bearer sk_test_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Test Store",
    "settlement_bank": "044",
    "account_number": "0123456789",
    "percentage_charge": 0.5
  }'
```

### Initialize Payment
```bash
curl -X POST https://api.paystack.co/transaction/initialize \
  -H "Authorization: Bearer sk_test_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "email": "test@example.com",
    "subaccount": "ACCT_test123",
    "bearer": "subaccount"
  }'
```

### Verify Payment
```bash
curl -X GET https://api.paystack.co/transaction/verify/test_reference \
  -H "Authorization: Bearer sk_test_xxxxx"
```

## 11. Flow Diagram

```
Customer → Places Order → Paystack Checkout → Payment Success
    ↓
Webhook → Update Order Status → Settle to Entrepreneur Subaccount
    ↓
Store Authorization → Enable Future Recurring Charges
```

## 12. Security Notes

- Always validate webhook signatures
- Store authorization codes securely
- Use HTTPS for all API endpoints
- Implement proper error logging
- Never expose secret keys in frontend code

## 13. Current Implementation Status in Vendora

✅ **Completed:**
- Subaccount creation during onboarding
- Payment initialization with subaccount routing
- Webhook handling for charge success
- Order status updates
- Customer authorization storage

✅ **Available Edge Functions:**
- `create-paystack-subaccount`
- `paystack-payment` (with subaccount support)
- `charge-returning-customer`
- `paystack-subscription-webhook` (enhanced)

✅ **Frontend Hooks:**
- `usePaystackSubaccount`
- `usePaystack`
- `usePaystackRecurring`

This integration ensures that customer payments flow directly into entrepreneur subaccounts while maintaining platform oversight and enabling seamless recurring payments.