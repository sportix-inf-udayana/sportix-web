export const APP_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  routes: {
    public: ['/', '/login', '/register'],
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