import { detectMediaType, isDeliverableComplete, normalizeSocialUrl, rulesOf } from './deliverable-rules';

describe('deliverable rules', () => {
  it('never counts pre-publication approval or unverified publication as complete', () => {
    for (const status of ['PENDING', 'SUBMITTED', 'READY_TO_PUBLISH', 'APPROVED', 'PUBLISHED', 'REVISION_REQUESTED']) {
      expect(isDeliverableComplete({ status, requirements: null })).toBe(false);
    }
    expect(isDeliverableComplete({ status: 'VERIFIED', requirements: null })).toBe(true);
    expect(isDeliverableComplete({ status: 'APPROVED', requirements: { requiresPublication: false } })).toBe(true);
  });
  it('keeps conservative defaults for legacy campaigns', () => {
    expect(rulesOf(null).requiresPublication).toBe(true);
    expect(rulesOf({ maxFileSizeMb: 5 }).maxFileSizeMb).toBe(5);
  });
  it('normalizes tracking links for duplicate detection without claiming verification', () => {
    expect(normalizeSocialUrl('https://www.instagram.com/reel/abc/?utm_source=test#x', 'INSTAGRAM')).toEqual({
      url: 'https://instagram.com/reel/abc', platform: 'INSTAGRAM', verificationStatus: 'MANUAL_REVIEW_REQUIRED',
    });
    expect(normalizeSocialUrl('https://youtu.be/abc?si=foo').url).toBe('https://youtube.com/watch?v=abc');
    expect(normalizeSocialUrl('https://twitter.com/user/status/123').url).toBe('https://x.com/user/status/123');
  });
  it.each(['javascript:alert(1)', 'https://instagram.com.evil.test/reel/a', 'https://instagram.com/profile', 'https://a:pass@instagram.com/reel/a', 'http://instagram.com/reel/a', 'https://instagram.com:444/reel/a', 'https://localhost/reel/a'])('rejects unsafe or non-post URLs: %s', value => {
    expect(() => normalizeSocialUrl(value, 'INSTAGRAM')).toThrow();
  });
  it('rejects platform mismatch and infers platform from asset type', () => {
    expect(() => normalizeSocialUrl('https://youtube.com/watch?v=abc', 'INSTAGRAM')).toThrow();
    expect(() => normalizeSocialUrl('https://youtube.com/watch?v=abc', null, 'Instagram Reel')).toThrow();
  });
  it('checks content signatures rather than trusting a filename or MIME header', () => {
    expect(detectMediaType(Buffer.from('not actually a video'))).toBeNull();
    expect(detectMediaType(Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0]))).toBe('image/png');
    expect(detectMediaType(Buffer.from('0000ftypisom0000'))).toBe('video/mp4');
    expect(detectMediaType(Buffer.from('0000ftypqt  0000'))).toBe('video/quicktime');
  });
});
