const SAFE_AUTH_MESSAGES = new Set([
  "Please enter a valid email and password.",
  "Invalid email or password.",
  "Please confirm your email before signing in.",
  "Too many sign-in attempts. Please try again later.",
  "Sign in failed. Please try again.",
  "Please complete all required fields with valid details.",
  "An account with this email already exists.",
  "Password must be at least 8 characters.",
  "Account creation failed. Please try again.",
  "Account created. Sign in now, or check your email first if confirmation is enabled.",
]);

export function sanitizeAuthMessage(message: string | undefined): string | undefined {
  if (!message) return undefined;
  return SAFE_AUTH_MESSAGES.has(message) ? message : undefined;
}

export function sanitizeSupabaseSignInError(message: string): string {
  const lc = message.toLowerCase();
  if (lc.includes("invalid login") || lc.includes("invalid credentials"))
    return "Invalid email or password.";
  if (lc.includes("email not confirmed") || lc.includes("email link"))
    return "Please confirm your email before signing in.";
  if (lc.includes("too many"))
    return "Too many sign-in attempts. Please try again later.";
  return "Sign in failed. Please try again.";
}

export function sanitizeSupabaseSignUpError(message: string): string {
  const lc = message.toLowerCase();
  if (lc.includes("already registered") || lc.includes("already in use") || lc.includes("user already"))
    return "An account with this email already exists.";
  if (lc.includes("password") && (lc.includes("characters") || lc.includes("length") || lc.includes("minimum")))
    return "Password must be at least 8 characters.";
  return "Account creation failed. Please try again.";
}
