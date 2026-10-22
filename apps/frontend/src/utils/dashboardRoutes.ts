/**
 * Zerify Dashboard Route Mappings & Helpers
 * Provides canonical URL paths for standard Next.js folder-based routing.
 */

export const ROUTE_PATH_MAP: Record<string, string> = {
  // Brand routes
  'overview': '/dashboard/overview',
  'brand-analytics': '/dashboard/overview',
  'statistic': '/dashboard/overview',
  'traffic': '/dashboard/overview',
  'activity': '/dashboard/overview',
  'search-creators': '/dashboard/find-influencer',
  'find-influencer': '/dashboard/find-influencer',
  'find-influencers': '/dashboard/find-influencer',
  'my-campaigns': '/dashboard/campaigns',
  'campaigns': '/dashboard/campaigns',
  'saved-creators': '/dashboard/saved-creators',
  'shortlists': '/dashboard/shortlists',
  'active-deals': '/dashboard/active-deals',
  'deals': '/dashboard/active-deals',
  'brand-messages': '/dashboard/messages',
  'messages': '/dashboard/messages',
  'payouts-escrow': '/dashboard/payouts',
  'payouts': '/dashboard/payouts',
  'brand-settings': '/dashboard/settings',
  'settings': '/dashboard/settings',

  // Influencer routes
  'statistics': '/dashboard/statistics',
  'company-discovery': '/dashboard/company-discovery',
  'companies': '/dashboard/company-discovery',
  'campaign-discovery': '/dashboard/campaign-discovery',
  'campaign-invitations': '/dashboard/campaign-invitations',
  'invitations': '/dashboard/campaign-invitations',
  'active-campaigns': '/dashboard/active-campaigns',
  'applications': '/dashboard/applications',
  'my-network': '/dashboard/my-network',
  'network': '/dashboard/my-network',
  'payments': '/dashboard/payments',
};

/**
 * Returns the canonical URL path for a given route ID.
 */
export function getRoutePath(routeId: string): string {
  if (ROUTE_PATH_MAP[routeId]) {
    return ROUTE_PATH_MAP[routeId];
  }
  if (routeId.startsWith('/')) {
    return routeId;
  }
  return `/dashboard/${routeId}`;
}

/**
 * Given a pathname (e.g. '/dashboard/find-influencer/sarah-jenkins'),
 * identifies the active route ID for sidebar highlighting.
 */
export function getActiveRouteFromPathname(pathname: string, role?: 'BRAND' | 'INFLUENCER'): string {
  if (!pathname || pathname === '/dashboard') {
    return role === 'INFLUENCER' ? 'statistics' : 'overview';
  }

  const clean = pathname.replace(/^\/dashboard\/?/, '').split('/')[0];

  switch (clean) {
    case 'overview':
      return role === 'INFLUENCER' ? 'statistics' : 'overview';
    case 'find-influencer':
    case 'find-influencers':
    case 'search-creators':
      return 'search-creators';
    case 'campaigns':
    case 'my-campaigns':
      return role === 'INFLUENCER' ? 'campaign-discovery' : 'my-campaigns';
    case 'saved-creators':
      return 'saved-creators';
    case 'shortlists':
      return 'shortlists';
    case 'active-deals':
    case 'deals':
      return 'active-deals';
    case 'messages':
    case 'brand-messages':
      return role === 'INFLUENCER' ? 'messages' : 'brand-messages';
    case 'payouts':
    case 'payouts-escrow':
      return 'payouts-escrow';
    case 'payments':
      return role === 'INFLUENCER' ? 'payments' : 'payouts-escrow';
    case 'settings':
    case 'brand-settings':
      return role === 'INFLUENCER' ? 'settings' : 'brand-settings';
    case 'statistics':
      return 'statistics';
    case 'company-discovery':
    case 'companies':
      return 'company-discovery';
    case 'campaign-discovery':
      return 'campaign-discovery';
    case 'campaign-invitations':
    case 'invitations':
      return 'campaign-invitations';
    case 'active-campaigns':
      return 'active-campaigns';
    case 'applications':
      return 'applications';
    case 'my-network':
    case 'network':
      return 'my-network';
    default:
      return clean || (role === 'INFLUENCER' ? 'statistics' : 'overview');
  }
}

/**
 * Creates an SEO/URL-friendly slug from a text string.
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Generates an influencer profile slug from their name, handle, or ID.
 */
export function getCreatorSlug(creator: { id: string; name?: string; handle?: string }): string {
  if (creator.name) {
    const slug = slugify(creator.name);
    if (slug) return slug;
  }
  if (creator.handle) {
    const cleanHandle = creator.handle.replace('@', '');
    const slug = slugify(cleanHandle);
    if (slug) return slug;
  }
  return creator.id;
}
