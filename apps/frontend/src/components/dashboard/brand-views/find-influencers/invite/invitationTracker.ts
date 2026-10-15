'use client';

const INVITATIONS_STORAGE_KEY = 'zerify_campaign_invitations_map';

export function getInvitedCampaignIdsForCreator(creatorId: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(INVITATIONS_STORAGE_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw);
    return Array.isArray(map[creatorId]) ? map[creatorId] : [];
  } catch {
    return [];
  }
}

export function recordCampaignInvite(creatorId: string, campaignId: string): void {
  if (typeof window === 'undefined' || !creatorId || !campaignId) return;
  try {
    const raw = localStorage.getItem(INVITATIONS_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const existing: string[] = Array.isArray(map[creatorId]) ? map[creatorId] : [];
    if (!existing.includes(campaignId)) {
      map[creatorId] = [...existing, campaignId];
      localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(map));
    }
  } catch {}
}
