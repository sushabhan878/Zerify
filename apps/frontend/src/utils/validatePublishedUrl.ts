export interface PublishedUrlValidationResult {
  isValid: boolean;
  error?: string;
  detectedPlatform?: string;
  detectedType?: string;
  successMessage?: string;
}

export function getExpectedUrlPlaceholder(platform?: string, contentType?: string): string {
  const p = (platform || contentType?.split(' ')[0] || '').toLowerCase();
  const t = (contentType || '').toLowerCase();

  if (p.includes('instagram')) {
    if (t.includes('reel')) return 'https://www.instagram.com/reel/C.../';
    if (t.includes('story') || t.includes('stories')) return 'https://www.instagram.com/stories/username/.../';
    return 'https://www.instagram.com/p/C.../';
  }

  if (p.includes('facebook')) {
    if (t.includes('reel')) return 'https://www.facebook.com/reel/...';
    return 'https://www.facebook.com/username/posts/...';
  }

  if (p.includes('youtube')) {
    if (t.includes('short')) return 'https://www.youtube.com/shorts/...';
    return 'https://www.youtube.com/watch?v=...';
  }

  if (p.includes('tiktok')) {
    return 'https://www.tiktok.com/@username/video/...';
  }

  if (p.includes('twitter') || p === 'x') {
    return 'https://x.com/username/status/...';
  }

  if (p.includes('linkedin')) {
    return 'https://www.linkedin.com/posts/...';
  }

  return 'https://www.instagram.com/reel/C.../ or live public post URL';
}

export function validatePublishedUrl(
  inputUrl: string,
  platform?: string,
  contentType?: string
): PublishedUrlValidationResult {
  const trimmed = inputUrl.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Please enter your published live post URL.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { isValid: false, error: 'Please enter a valid URL including https://.' };
  }

  if (parsed.protocol !== 'https:') {
    return { isValid: false, error: 'URL must start with secure https://.' };
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '').replace(/^web\./, '');
  const path = parsed.pathname.replace(/\/+$/, '');

  // Detect and reject cloud storage / draft review tools
  const isCloudStorage = /drive\.google\.com|dropbox\.com|frame\.io|loom\.com|onedrive|1drv\.ms|sharepoint|wetransfer\.com/.test(host);
  if (isCloudStorage) {
    return {
      isValid: false,
      error: 'Cloud storage links (Google Drive, Dropbox, Loom, Frame.io) are not allowed for publication verification. Please provide your live public post link.',
    };
  }

  let detectedPlatform: string | undefined;
  let detectedType: string | undefined;

  // 1. Instagram
  if (host === 'instagram.com') {
    detectedPlatform = 'Instagram';
    if (/^\/(reel|reels)\/[\w.-]+/.test(path)) {
      detectedType = 'Reel';
    } else if (/^\/p\/[\w.-]+/.test(path)) {
      detectedType = 'Post';
    } else if (/^\/stories\/[\w.-]+/.test(path)) {
      detectedType = 'Story';
    }
  }

  // 2. Facebook
  if (host === 'facebook.com' || host === 'fb.watch') {
    detectedPlatform = 'Facebook';
    if (/^\/(reel|reels)\/[\w.-]+/.test(path)) {
      detectedType = 'Reel';
    } else {
      detectedType = 'Post';
    }
  }

  // 3. YouTube
  if (host === 'youtube.com' || host === 'youtu.be') {
    detectedPlatform = 'YouTube';
    if (/^\/shorts\/[\w-]+/.test(path)) {
      detectedType = 'Shorts';
    } else if (path === '/watch' || host === 'youtu.be') {
      detectedType = 'Video';
    }
  }

  // 4. TikTok
  if (host === 'tiktok.com' || host === 'vm.tiktok.com') {
    detectedPlatform = 'TikTok';
    detectedType = 'Video';
  }

  // 5. X / Twitter
  if (['x.com', 'twitter.com'].includes(host)) {
    detectedPlatform = 'X (Twitter)';
    detectedType = 'Post';
  }

  // 6. LinkedIn
  if (host === 'linkedin.com') {
    detectedPlatform = 'LinkedIn';
    detectedType = 'Post';
  }

  if (!detectedPlatform) {
    return {
      isValid: false,
      error: 'Please enter a supported social media public post link (Instagram, Facebook, YouTube, TikTok, X, LinkedIn).',
    };
  }

  const expectedPlatform = (platform || contentType?.split(' ')[0] || '').toLowerCase().replace('twitter', 'x');
  const normalizedDetected = detectedPlatform.toLowerCase().replace(' (twitter)', '');

  if (expectedPlatform && !normalizedDetected.includes(expectedPlatform) && !expectedPlatform.includes(normalizedDetected)) {
    return {
      isValid: false,
      error: `This deliverable requires a ${platform || expectedPlatform} URL, but you entered a ${detectedPlatform} link.`,
    };
  }

  // Content type / format matching
  const targetType = (contentType || '').toLowerCase();
  if (detectedPlatform === 'Instagram') {
    if (targetType.includes('reel') && detectedType !== 'Reel') {
      return {
        isValid: false,
        error: 'This deliverable is an Instagram Reel. Please enter an Instagram Reel URL (e.g. https://www.instagram.com/reel/...). Standard feed posts are not allowed.',
      };
    }
    if ((targetType.includes('story') || targetType.includes('stories')) && detectedType !== 'Story') {
      return {
        isValid: false,
        error: 'This deliverable is an Instagram Story. Please enter an Instagram Story link (e.g. https://www.instagram.com/stories/...).',
      };
    }
  }

  if (detectedPlatform === 'YouTube') {
    if (targetType.includes('short') && detectedType !== 'Shorts') {
      return {
        isValid: false,
        error: 'This deliverable is a YouTube Short. Please enter a YouTube Shorts URL (e.g. https://www.youtube.com/shorts/...).',
      };
    }
  }

  return {
    isValid: true,
    detectedPlatform,
    detectedType,
    successMessage: `Valid ${detectedPlatform} ${detectedType || 'Post'} link ready for performance & stats tracking`,
  };
}
