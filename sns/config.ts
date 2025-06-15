// IMPORTANT: Store this securely, e.g., in environment variables for production!
export const JWT_SECRET_KEY = "your-super-secret-and-long-enough-key";
// In a real app, you might use Deno.env.get("JWT_SECRET_KEY")
// or crypto.subtle.generateKey for HMAC generation if you want to generate it dynamically on first run
// For djwt, a CryptoKey object is often preferred. Let's generate one.

// Helper function to create a CryptoKey from a secret string
async function createCryptoKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false, // not extractable
    ["sign", "verify"],
  );
}

export const jwtKey = await createCryptoKey(JWT_SECRET_KEY);
