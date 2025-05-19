// Cookie utility functions for client-side cookie management

export interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set a cookie with the given name, value and options
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  
  if (options.expires) {
    cookieString += `; expires=${options.expires.toUTCString()}`;
  }
  
  if (options.maxAge !== undefined) {
    cookieString += `; max-age=${options.maxAge}`;
  }
  
  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }
  
  if (options.path) {
    cookieString += `; path=${options.path}`;
  } else {
    // Default path to root
    cookieString += '; path=/';
  }
  
  if (options.secure) {
    cookieString += '; secure';
  }
  
  if (options.httpOnly) {
    cookieString += '; httponly';
  }
  
  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }
  
  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | undefined {
  const nameEq = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    
    if (cookie.indexOf(nameEq) === 0) {
      return decodeURIComponent(cookie.substring(nameEq.length, cookie.length));
    }
  }
  
  return undefined;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string, options: CookieOptions = {}): void {
  // Set expiration to past date to delete cookie
  const deleteOptions: CookieOptions = {
    ...options,
    expires: new Date(0),
  };
  
  setCookie(name, '', deleteOptions);
}

/**
 * Check if a cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== undefined;
} 