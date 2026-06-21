/**
 * SPORTIX - CORE PAGE COMPONENT
 * Route Group: (auth)
 * Path: src/app/(auth)/login/page.js
 * Deskripsi SRS: 
 * Antarmuka gerbang masuk tunggal bagi seluruh aktor ekosistem Sportix (Customer, Admin Venue, Pelatih, Seller UMKM). 
 * Form divalidasi secara ketat dan terhubung langsung dengan sistem token JWT otonom di lapisan middleware global 
 * untuk mencegah bypass akses ilegal serta memastikan pemisahan hak akses (RBAC).
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <h1 className="text-xl font-bold tracking-wider">Sportix - Login Portal</h1>
    </div>
  );
}
