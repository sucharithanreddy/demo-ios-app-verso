// ============================================================================
// Auth token bridge - lets non-React code (lib/api.ts) access the Clerk token
// ============================================================================

type TokenGetter = () => Promise<string | null>;

let tokenGetter: TokenGetter | null = null;

/**
 * Set the function that retrieves the current Clerk session token.
 * Called once from the AuthBridge component inside ClerkProvider.
 */
export function setTokenGetter(getter: TokenGetter | null): void {
  tokenGetter = getter;
}

/**
 * Get the current Clerk session token (or null if not authenticated).
 * Safe to call from anywhere - returns null if no getter is registered.
 */
export async function getToken(): Promise<string | null> {
  if (!tokenGetter) return null;
  try {
    return await tokenGetter();
  } catch {
    return null;
  }
}
