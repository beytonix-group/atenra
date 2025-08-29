export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const parsedUrl = new URL(url);
    
    // Only allow https protocol for security
    if (parsedUrl.protocol !== 'https:') return false;
    
    // Block JavaScript and data URLs
    if (parsedUrl.protocol === 'javascript:' || 
        parsedUrl.protocol === 'data:' || 
        parsedUrl.protocol === 'vbscript:') {
      return false;
    }
    
    // Check for valid image file extensions
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasValidExtension = validExtensions.some(ext => 
      parsedUrl.pathname.toLowerCase().includes(ext)
    );
    
    // Allow common image hosting domains even without explicit extensions
    const trustedDomains = [
      'lh3.googleusercontent.com', // Google profile images
      'avatars.githubusercontent.com', // GitHub avatars
      'cdn.jsdelivr.net',
      'images.unsplash.com',
      'res.cloudinary.com'
    ];
    
    const isTrustedDomain = trustedDomains.some(domain => 
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
    );
    
    return hasValidExtension || isTrustedDomain;
  } catch {
    return false;
  }
}

export function sanitizeAvatarUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return isValidImageUrl(url) ? url : null;
}