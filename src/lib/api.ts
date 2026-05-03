import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

// ১. axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ২. attach token automatically
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("erp-token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // ❗️ FormData হ্যান্ডেল করার জন্য ডাইনামিক কন্টেন্ট টাইপ
  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  }

  return config;
});

// ৩. global error handler
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (typeof window !== "undefined") {
      if (error.response?.status === 401) {
        localStorage.removeItem("erp-token");
        localStorage.removeItem("erp-user");
        // বিল্ড এরর এড়াতে window.location ব্যবহার করা হয়েছে
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// =====================================================
// ALL API ENDPOINTS
// =====================================================

export const ENDPOINTS = {
  // Auth
  login: () => `/erp-users/login/`,
  dashboard: () => `/erp-dashboard/`,

  // Users
  users: {
    list: () => `/erp-users/`,
    create: () => `/erp-users/new/`,
    detail: (id: number) => `/erp-users/${id}/`,
    byRole: (role: string) => `/erp-users/role/${role}/`,
  },

  // Projects
  projects: {
    list: () => `/erp-projects/`,
    create: () => `/erp-projects/new/`,
    detail: (id: number) => `/erp-projects/${id}/`,
  },

  // Plots
  plots: {
    list: () => `/erp-plots/`,
    create: () => `/erp-plots/new/`,
    detail: (id: number) => `/erp-plots/${id}/`,
  },

  // Land Records
  landRecords: {
    list: () => `/erp-land-records/`,
    create: () => `/erp-land-records/new/`,
    detail: (id: number) => `/erp-land-records/${id}/`,
  },

  // Customers
  customers: {
    list: () => `/erp-customers/`,
    create: () => `/erp-customers/new/`,
    detail: (id: number) => `/erp-customers/${id}/`,
  },

  // Leads
  leads: {
    list: () => `/erp-leads/`,
    create: () => `/erp-leads/new/`,
    detail: (id: number) => `/erp-leads/${id}/`,
  },

  // Bookings
  bookings: {
    list: () => `/erp-bookings/`,
    create: () => `/erp-bookings/new/`,
    detail: (id: number) => `/erp-bookings/${id}/`,
  },

  // Installments
  installments: {
    list: () => `/installments/`,
    create: () => `/erp-installments/new/`,
    detail: (id: number) => `/installments/${id}/`,
  },

  // Receipts
  receipts: {
    list: () => `/erp-receipts/`,
    create: () => `/erp-receipts/new/`,
    detail: (id: number) => `/erp-receipts/${id}/`,
  },

  // Vouchers
  vouchers: {
    list: () => `/erp-vouchers/`,
    create: () => `/erp-vouchers/new/`,
    detail: (id: number) => `/erp-vouchers/${id}/`,
  },

  // Visits
  visits: {
    list: () => `/erp-visits/`,
    create: () => `/erp-visits/new/`,
    detail: (id: number) => `/erp-visits/${id}/`,
  },

  // Officers
  officers: {
    list: () => `/erp-officers/`,
    create: () => `/erp-officers/new/`,
    detail: (id: number) => `/erp-officers/${id}/`,
    downline: (id: number) => `/erp-officers/${id}/downline/`,
  },

  // Wallet
  wallets: {
    list: () => `/erp-wallets/`,
    detail: (id: number) => `/erp-wallets/${id}/`,
    byUser: (uid: number) => `/erp-wallets/user/${uid}/`,
  },

  walletTx: {
    list: () => `/erp-wallet-transactions/`,
    create: () => `/erp-wallet-transactions/new/`,
    detail: (id: number) => `/erp-wallet-transactions/${id}/`,
  },

  // Commission
  commRules: {
    list: () => `/erp-commission-rules/`,
    create: () => `/erp-commission-rules/new/`,
    detail: (id: number) => `/erp-commission-rules/${id}/`,
  },

  commissions: {
    list: () => `/erp-commissions/`,
    create: () => `/erp-commissions/new/`,
    detail: (id: number) => `/erp-commissions/${id}/`,
  },

  // Loans
  loans: {
    list: () => `/erp-loans/`,
    create: () => `/erp-loans/new/`,
    detail: (id: number) => `/erp-loans/${id}/`,
  },

  // Investors
  investors: {
    list: () => `/erp-investors/`,
    create: () => `/erp-investors/new/`,
    detail: (id: number) => `/erp-investors/${id}/`,
  },

  investments: {
    list: () => `/erp-investments/`,
    create: () => `/erp-investments/new/`,
    detail: (id: number) => `/erp-investments/${id}/`,
  },

  dividends: {
    list: () => `/erp-dividends/`,
    create: () => `/erp-dividends/new/`,
    detail: (id: number) => `/erp-dividends/${id}/`,
  },

  // HR
  employees: {
    list: () => `/erp-employees/`,
    create: () => `/erp-employees/new/`,
    detail: (id: number) => `/erp-employees/${id}/`,
  },

  attendance: {
    list: () => `/erp-attendance/`,
    create: () => `/erp-attendance/new/`,
    detail: (id: number) => `/erp-attendance/${id}/`,
  },

  payroll: {
    list: () => `/erp-payroll/`,
    create: () => `/erp-payroll/new/`,
    detail: (id: number) => `/erp-payroll/${id}/`,
  },

  // Requests
  requests: {
    list: () => `/erp-officer-requests/`,
    create: () => `/erp-officer-requests/new/`,
    detail: (id: number) => `/erp-officer-requests/${id}/`,
  },

  // Accounts
  accountHeads: {
    list: () => `/erp-account-heads/`,
    create: () => `/erp-account-heads/new/`,
    detail: (id: number) => `/erp-account-heads/${id}/`,
  },

  // Offers
  offers: {
    list: () => `/erp-offers/`,
    create: () => `/erp-offers/new/`,
    detail: (id: number) => `/erp-offers/${id}/`,
  },

  // SMS
  smsLogs: {
    list: () => `/erp-sms-logs/`,
    create: () => `/erp-sms-logs/new/`,
    detail: (id: number) => `/erp-sms-logs/${id}/`,
  },

  // Documents
  documents: {
    list: () => `/erp-documents/`,
    create: () => `/erp-documents/new/`,
    detail: (id: number) => `/erp-documents/${id}/`,
  },

  // Assets
  assets: {
    list: () => `/erp-assets/`,
    create: () => `/erp-assets/new/`,
    detail: (id: number) => `/erp-assets/${id}/`,
  },

  // System Logs
  systemLogs: {
  list: () => `/erp-system-logs/`,
  create: () => `/erp-system-logs/new/`,
  detail: (id: number) => `/erp-system-logs/${id}/`,
},
};

// =====================================================
// GENERIC CRUD HELPERS
// =====================================================

export const fetchList = (url: string, params?: object) =>
  api.get(url, { params });

export const fetchDetail = (url: string) =>
  api.get(url);

// create এবং update এ 'multipart/form-data' ফিক্সড না রেখে ডাইনামিক রাখা ভালো
export const createItem = (url: string, data: any) => {
  return api.post(url, data);
}

export const updateItem = (url: string, data: any) => {
  return api.patch(url, data);
}

export const deleteItem = (url: string) =>
  api.delete(url);

// ৬. ❗️ CRITICAL: Default export যোগ করা হয়েছে যাতে অন্য ফাইলে এরর না দেয়
export default api;