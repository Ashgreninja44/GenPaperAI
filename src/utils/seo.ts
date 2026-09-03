/**
 * SEO & Page Metadata utility for GenPaperAI
 * Updates document.title, meta descriptions, and canonical links per route.
 */

const BASE_URL = "https://ais-dev-ha4tzqhkafm5jkwgucql4m-324148928305.asia-east1.run.app";

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
    const fullUrl = `${BASE_URL}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
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
