/**
 * SEO & Page Metadata utility for GenPaperAI
 * Updates document.title, meta descriptions, canonical links, and Open Graph tags per route.
 */

export function getBaseUrl(): string {
  // Check client-accessible environment variable (if explicitly configured)
  const envUrl = (import.meta as any).env?.VITE_APP_URL || (import.meta as any).env?.VITE_PUBLIC_URL;
  if (envUrl && typeof envUrl === 'string' && !envUrl.includes('ais-dev-') && !envUrl.includes('localhost')) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Derive dynamically from browser origin
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return origin.replace(/\/+$/, '');
    }
  }

  return envUrl ? String(envUrl).trim().replace(/\/+$/, '') : '';
}

export function setPageMetadata(title: string, description?: string, pathname?: string) {
  // Update Document Title
  document.title = title;

  // Update Meta Description
  if (description) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Update Open Graph Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', description);
    }
  }

  // Update Open Graph Title
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', title);
  }

  // Update Canonical Link & Open Graph URL
  if (pathname !== undefined) {
    const baseUrl = getBaseUrl();
    const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    const fullUrl = baseUrl ? `${baseUrl}${cleanPath}` : cleanPath;

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', fullUrl);
    }
  }
}

