/**
 * Decodes a JWT token and returns its expiration timestamp in milliseconds.
 * Works universally across Browser, Node.js, and Edge runtime.
 */
export function getJwtExpirationTime(token?: string | null): number | null {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];

    let jsonPayload = "";
    if (typeof Buffer !== "undefined") {
      jsonPayload = Buffer.from(base64Url, "base64").toString("utf-8");
    } else if (typeof atob !== "undefined") {
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
    } else {
      return null;
    }

    const payload = JSON.parse(jsonPayload);
    if (typeof payload.exp === "number") {
      return payload.exp * 1000;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Checks if a JWT token is expired (or will expire within bufferMs).
 */
export function isJwtExpired(token?: string | null, bufferMs = 5000): boolean {
  const exp = getJwtExpirationTime(token);
  if (!exp) return false;
  return Date.now() >= exp - bufferMs;
}
