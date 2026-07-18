// ============================================
// إعدادات الاتصال بـ Supabase - مشتركة بين كل الصفحات
// ============================================
const SUPABASE_URL = "https://xqyvxxwprqxpbgmqlhym.supabase.co";
const SUPABASE_KEY = "sb_publishable_Ic_RFrH2Ov3Gk9HCcilNOQ_SwozV2rQ";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// دوال المصادقة المشتركة
// ============================================

// تسجيل حساب جديد + إنشاء صف في profiles
async function signUpFamily(email, password, fullName, phone) {
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) return { error };

  const userId = data.user?.id;
  if (!userId) return { error: { message: "لم يتم إنشاء المستخدم بنجاح" } };

  const { error: profileError } = await sb.from("profiles").insert({
    id: userId,
    name: fullName,
    phone: phone,
    is_admin: false,
  });

  return { error: profileError, data };
}

// تسجيل الدخول
async function signIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  return { data, error };
}

// تسجيل الخروج
async function signOutUser() {
  await sb.auth.signOut();
  window.location.href = "index.html";
}

// جلب بيانات البروفايل الحالي (بما فيها is_admin)
async function getCurrentProfile() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return null;

  const { data: profile, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error) return null;
  return { ...profile, email: session.user.email };
}

// حماية الصفحات: يتأكد إن فيه جلسة نشطة، وإلا يرجّع المستخدم لصفحة الدخول
async function requireAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = "index.html";
    return null;
  }
  return session;
}

// حماية صفحة الأدمن: يتأكد إن المستخدم أدمن فعلاً
async function requireAdmin() {
  const session = await requireAuth();
  if (!session) return null;

  const profile = await getCurrentProfile();
  if (!profile || !profile.is_admin) {
    window.location.href = "family.html";
    return null;
  }
  return profile;
}
