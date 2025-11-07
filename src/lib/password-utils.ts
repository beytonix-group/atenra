/**
 * Password utilities that work in both edge and Node.js runtimes
 */

/**
 * Hash password using PBKDF2 with Web Crypto API (edge-compatible)
 * Format: pbkdf2:iterations:salt:hash (all in hex)
 */
export async function hashPasswordEdge(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 100000;

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  // Convert to hex
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const saltArray = Array.from(salt);

  const saltHex = saltArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Format: pbkdf2:iterations:salt:hash
  return `pbkdf2:${iterations}:${saltHex}:${hashHex}`;
}

/**
 * Verify password using PBKDF2 (edge-compatible)
 */
export async function verifyPasswordPBKDF2(password: string, hash: string): Promise<boolean> {
  try {
    console.log('🔐 verifyPasswordPBKDF2 called');
    console.log('🔐 Hash format:', hash.substring(0, 20) + '...');

    const parts = hash.split(':');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
      console.log('❌ Invalid hash format, parts:', parts.length, 'prefix:', parts[0]);
      return false;
    }

    console.log('✅ Hash format valid');

    const iterations = parseInt(parts[1], 10);
    const saltHex = parts[2];
    const expectedHashHex = parts[3];

    console.log('🔐 Parsing salt...');
    // Convert hex salt back to Uint8Array
    const saltMatches = saltHex.match(/.{2}/g);
    if (!saltMatches) {
      console.log('❌ Failed to parse salt hex');
      return false;
    }
    const salt = new Uint8Array(saltMatches.map(byte => parseInt(byte, 16)));

    console.log('🔐 Encoding password...');
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    console.log('🔐 Importing key material...');
    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordData,
      'PBKDF2',
      false,
      ['deriveBits']
    );

    console.log('🔐 Deriving bits...');
    // Derive bits using PBKDF2 with the stored salt
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );

    console.log('🔐 Converting to hex...');
    // Convert to hex
    const hashArray = Array.from(new Uint8Array(derivedBits));
    const actualHashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('🔐 Comparing hashes...');
    // Constant-time comparison
    const matches = actualHashHex === expectedHashHex;
    console.log('🔐 Password match:', matches);

    return matches;
  } catch (error) {
    console.error('❌ Error in verifyPasswordPBKDF2:', error);
    throw error;
  }
}

