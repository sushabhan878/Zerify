import { formatCurrency } from '@/utils/currency';
import { ParticipantDeliverableItem } from '@/services/deliverable.service';
import { isComplete, isOverdue, nextAction } from '@/services/deliverable-workflow';
import type { ActiveCampaignItem } from './ActiveCampaignCard';

export function mapActiveCampaign(p: any): ActiveCampaignItem {
  const items: ParticipantDeliverableItem[] = p.deliverables || [];
  const action = nextAction(p);
  const complete = items.filter(isComplete).length;
  const deadlines = items.filter(d => !isComplete(d)).map(d => ['READY_TO_PUBLISH', 'APPROVED', 'PUBLISHED'].includes(d.status) ? d.requirements?.publicationDeadline || d.dueDate : d.dueDate).filter((s): s is string => !!s).sort();
  const deadline = deadlines[0] || p.campaign?.endDate;
  return {
    id: p.id, campaignId: p.campaignId, title: p.campaign?.title || 'Creator collaboration',
    brand: p.campaign?.brandProfile?.companyName || 'Brand', logoUrl: p.campaign?.brandProfile?.logoUrl,
    industry: p.campaign?.industry || 'Creator collaboration',
    stage: action.state === 'COMPLETED' ? 'COMPLETED' : action.state === 'AWAITING_PUBLICATION' ? 'READY_TO_PUBLISH' : action.state === 'UNDER_REVIEW' ? 'CONTENT_REVIEW' : 'IN_PRODUCTION',
    deadline: deadline ? new Date(deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set',
    payout: formatCurrency(Number(p.agreedAmount || 0), p.agreedCurrency || 'INR'), payoutAmount: Number(p.agreedAmount || 0),
    progress: items.length ? Math.round(complete / items.length * 100) : 0,
    deliverables: items.map(d => ({ title: `${d.quantity} × ${d.title || d.type}`, completed: isComplete(d) })),
    verifiedBrand: false, contractBrief: p.campaign?.description || '',
    action: action.label, message: action.message, state: action.state, overdue: items.some(isOverdue),
  };
}
