// src/app/profile/page.js
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { APP_CONFIG, USER_ROLES } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export default async function UnifiedProfilePage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(APP_CONFIG.routes.auth.login);

  const role = user.user_metadata?.role || USER_ROLES.CUSTOMER;

  switch (role) {
    case USER_ROLES.SUPER_ADMIN:
      redirect(`${APP_CONFIG.routes.protected.superAdmin}/audits?view=profile`);
    case USER_ROLES.ADMIN_VENUE:
      redirect(`${APP_CONFIG.routes.protected.admin}/reports?view=profile`);
    case USER_ROLES.COACH:
      redirect(`${APP_CONFIG.routes.protected.coach}/wallet?view=profile`);
    case USER_ROLES.UMKM_SELLER:
      redirect(`${APP_CONFIG.routes.protected.seller}/products?view=profile`);
    default:
      redirect("/profile/history");
  }
}