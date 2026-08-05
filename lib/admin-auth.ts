// ─── Mock Admin Credentials ─────────────────────────────────────────────────
// In production: replace with DB lookup + bcrypt password comparison
export const ADMIN_USERS = [
  {
    id: "1",
    name: "Admin Kullanıcı",
    email: "admin@besiktas.bel.tr",
    password: "Admin2026!",
    role: "admin" as const,
    avatar: "AK",
  },
];

export type AdminUser = (typeof ADMIN_USERS)[number];

// ─── Base64 helpers (Node.js compatible) ─────────────────────────────────────
function b64encode(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "utf-8").toString("base64");
  }
  // Edge runtime fallback
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    (_, p1) => String.fromCharCode(parseInt(p1, 16))));
}

function b64decode(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "base64").toString("utf-8");
  }
  // Edge runtime fallback
  return decodeURIComponent(
    Array.from(atob(str))
      .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

// ─── Session Helpers ─────────────────────────────────────────────────────────
export function createSessionToken(user: AdminUser): string {
  const payload = {
    id: user.id,
    // Exclude 'name' — contains Turkish chars that break base64/atob in middleware
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    iat: Date.now(),
  };
  return b64encode(JSON.stringify(payload));
}

export function parseSessionToken(token: string): AdminUser | null {
  try {
    return JSON.parse(b64decode(token)) as AdminUser;
  } catch {
    return null;
  }
}

export function verifyCredentials(
  email: string,
  password: string
): AdminUser | null {
  const user = ADMIN_USERS.find(
    (u) => u.email === email && u.password === password
  );
  return user ?? null;
}
