/**
 * User Activity Tracking Service
 * Centralized service for tracking user activities across the application
 */

// URL path to page name mapping
export const PAGE_MAPPINGS: Record<string, string> = {
  '/': 'Home Page',
  '/login': 'Login Page',
  '/register': 'Registration Page',
  '/dashboard': 'Dashboard',
  '/profile': 'Profile Page',
  '/admin': 'Admin Dashboard',
  '/admin/users': 'Admin Users Management',
  '/admin/roles': 'Admin Roles Management',
  '/admin/activities': 'Admin Activities Tracking',
  '/admin/settings': 'Admin Settings',
  '/pricing': 'Pricing Page',
  '/about': 'About Page',
  '/social': 'Social Page',
  '/more': 'More Page',
  '/contact': 'Contact Page',
  '/unauthorized': 'Unauthorized Access Page',
  '/api-docs': 'API Documentation',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Service',
};

// Activity types
export const ACTIVITY_TYPES = {
  PAGE_VIEW: 'page_view',
  USER_ACTION: 'user_action',
  FORM_SUBMIT: 'form_submit',
  API_CALL: 'api_call',
  ERROR: 'error',
} as const;

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES];

interface TrackActivityParams {
  action: ActivityType;
  info: string;
}

/**
 * Get page name from URL path
 */
export function getPageName(path: string): string {
  // Remove query parameters and hash
  const cleanPath = path.split('?')[0].split('#')[0];
  
  // Check for exact match
  if (PAGE_MAPPINGS[cleanPath]) {
    return PAGE_MAPPINGS[cleanPath];
  }
  
  // Check for dynamic routes (e.g., /admin/users/123)
  const segments = cleanPath.split('/').filter(Boolean);
  
  // Try to match parent paths for dynamic routes
  if (segments.length > 1) {
    // Check /admin/* routes
    if (segments[0] === 'admin') {
      if (segments[1] === 'users' && segments.length > 2) {
        return 'Admin User Details';
      }
      if (segments[1] === 'roles' && segments.length > 2) {
        return 'Admin Role Details';
      }
    }
    
    // Check /dashboard/* routes
    if (segments[0] === 'dashboard') {
      return 'Dashboard - ' + segments.slice(1).join(' / ');
    }
  }
  
  // Default to formatted path
  return cleanPath === '/' ? 'Home Page' : cleanPath.slice(1).replace(/\//g, ' - ').replace(/-/g, ' ');
}

/**
 * Track user activity
 */
export async function trackActivity({ action, info }: TrackActivityParams): Promise<void> {
  try {
    const response = await fetch('/api/activities/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        info,
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to track activity:', await response.text());
    }
  } catch (error) {
    console.error('Error tracking activity:', error);
  }
}

/**
 * Track page view
 */
export async function trackPageView(path: string): Promise<void> {
  const pageName = getPageName(path);
  await trackActivity({
    action: ACTIVITY_TYPES.PAGE_VIEW,
    info: `Visited: ${pageName} (${path})`,
  });
}

/**
 * Track user action
 */
export async function trackUserAction(actionName: string, details?: string): Promise<void> {
  await trackActivity({
    action: ACTIVITY_TYPES.USER_ACTION,
    info: details ? `${actionName}: ${details}` : actionName,
  });
}

/**
 * Track form submission
 */
export async function trackFormSubmit(formName: string, success: boolean): Promise<void> {
  await trackActivity({
    action: ACTIVITY_TYPES.FORM_SUBMIT,
    info: `${formName} - ${success ? 'Success' : 'Failed'}`,
  });
}

/**
 * Track API call
 */
export async function trackApiCall(endpoint: string, method: string): Promise<void> {
  await trackActivity({
    action: ACTIVITY_TYPES.API_CALL,
    info: `${method} ${endpoint}`,
  });
}

/**
 * Track error
 */
export async function trackError(errorMessage: string, context?: string): Promise<void> {
  await trackActivity({
    action: ACTIVITY_TYPES.ERROR,
    info: context ? `${context}: ${errorMessage}` : errorMessage,
  });
}