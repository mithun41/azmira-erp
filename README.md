# RE-ERP — Real Estate ERP Frontend

## Setup

```bash
npm install
npm run dev
```

Open: http://localhost:3000

## Config
Edit `.env.local` to set your Django backend URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Modules
- Dashboard (with charts)
- Projects, Plots/Flats, Land Records
- Customers, Leads, Bookings, Installments
- Money Receipts, Vouchers
- Project Visits
- Marketing Officers, Commission, Wallet, Requests, Offers
- Investors, Investments, Dividends
- Employees, Attendance, Payroll
- Account Heads, Loans
- SMS Logs, Documents, Assets, System Logs

## Backend
Django REST Framework. Make sure CORS is enabled for `http://localhost:3000`.

Add to Django settings:
```python
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
```
