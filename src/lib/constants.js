// src/lib/constants.js
export const APP_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  routes: {
    public: ['/', '/login', '/register', '/api/payments/webhook', '/api/cron'],
    auth: {
      login: '/login',
      register: '/register',
    },
    protected: {
      customer: '/profile',
      admin: '/admin-venue',
      coach: '/coach',
      seller: '/seller-umkm',
      superAdmin: '/super-admin'
    }
  }
};

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN_VENUE: 'ADMIN_VENUE',
  COACH: 'COACH',
  UMKM_SELLER: 'UMKM_SELLER',
  CUSTOMER: 'CUSTOMER'
};

export const ROLE = USER_ROLES;

export const ENTITY_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

export const SLOT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  LOCKED: 'LOCKED',
  BOOKED: 'BOOKED',
  UNAVAILABLE: 'UNAVAILABLE'
};

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  COMPLETED: 'COMPLETED',
  FORFEITED: 'FORFEITED',
  EXPIRED_PAID: 'EXPIRED_PAID',
  CANCELLED_BY_ADMIN: 'CANCELLED_BY_ADMIN'
};

export const TRANSACTION_TYPE = {
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT'
};

export const BUSINESS_RULES = {
  SLA_LOCK_MINUTES: 15,
  FEA_TOLERANCE_MINUTES: 15
};