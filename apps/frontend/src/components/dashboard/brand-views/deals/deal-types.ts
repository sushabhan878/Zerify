export type DealStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type DealStage =
  | 'DRAFT_REVIEW'
  | 'IN_PRODUCTION'
  | 'PUBLISHED_VERIFYING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface DealDeliverable {
  id: string;
  title: string;
  type: string;
  platform: string;
  dueDate: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REVISION_REQUESTED' | 'VERIFIED';
  previewUrl?: string;
  draftNotes?: string;
}

export interface DealItem {
  id: string;
  dealNumber: string;
  campaignId: string;
  campaignTitle: string;
  brandName?: string;
  creator: {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
    category?: string;
    platforms: string[];
    isVerified?: boolean;
    rating?: number;
  };
  status: DealStatus;
  stage: DealStage;
  stageLabel: string;
  agreedAmount: number;
  agreedCurrency: string;
  escrowStatus: 'SECURED' | 'RELEASED' | 'REFUNDED';
  escrowSecuredAmount: number;
  deliverables: DealDeliverable[];
  primaryDeliverableTitle: string;
  startedAt: string;
  dueDate: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export const MOCK_DEALS: DealItem[] = [
  {
    id: 'deal-001',
    dealNumber: 'CNT-901',
    campaignId: 'camp-101',
    campaignTitle: 'Q3 Enterprise SaaS Launch',
    creator: {
      id: 'cr-1',
      name: 'Sarah Jenkins',
      handle: '@sarah_creativ',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
      category: 'Tech & Productivity',
      platforms: ['YouTube', 'Instagram'],
      isVerified: true,
      rating: 4.9,
    },
    status: 'ACTIVE',
    stage: 'DRAFT_REVIEW',
    stageLabel: 'Draft Review Required',
    agreedAmount: 3500,
    agreedCurrency: 'USD',
    escrowStatus: 'SECURED',
    escrowSecuredAmount: 3500,
    primaryDeliverableTitle: 'YouTube Dedicated Video (8-12 min) + Community Post',
    deliverables: [
      {
        id: 'del-1',
        title: 'YouTube Dedicated Video',
        type: 'Dedicated Video',
        platform: 'YouTube',
        dueDate: 'Oct 12, 2026',
        status: 'SUBMITTED',
        previewUrl: 'https://www.youtube.com',
        draftNotes: 'Draft version uploaded with intro hook and sponsor timestamp integration at 01:45.',
      },
      {
        id: 'del-2',
        title: 'Community Tab Announcement',
        type: 'Community Post',
        platform: 'YouTube',
        dueDate: 'Oct 14, 2026',
        status: 'PENDING',
      },
    ],
    startedAt: 'Sep 24, 2026',
    dueDate: 'Oct 14, 2026',
  },
  {
    id: 'deal-002',
    dealNumber: 'CNT-882',
    campaignId: 'camp-102',
    campaignTitle: 'Summer Desk Setup Showcase',
    creator: {
      id: 'cr-2',
      name: 'Marcus Vance',
      handle: '@marcus_vfit',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
      category: 'Fitness & Lifestyle',
      platforms: ['Instagram', 'TikTok'],
      isVerified: true,
      rating: 4.8,
    },
    status: 'ACTIVE',
    stage: 'PUBLISHED_VERIFYING',
    stageLabel: 'Published & Verifying Metrics',
    agreedAmount: 2200,
    agreedCurrency: 'USD',
    escrowStatus: 'SECURED',
    escrowSecuredAmount: 2200,
    primaryDeliverableTitle: '2x Instagram Reels + 3x Story Slides with Link Sticker',
    deliverables: [
      {
        id: 'del-3',
        title: 'IG Reel #1 (Aesthetic Desk Tour)',
        type: 'Reel',
        platform: 'Instagram',
        dueDate: 'Oct 02, 2026',
        status: 'VERIFIED',
        previewUrl: 'https://instagram.com',
      },
      {
        id: 'del-4',
        title: 'IG Story Sequence with Swipe',
        type: 'Story',
        platform: 'Instagram',
        dueDate: 'Oct 05, 2026',
        status: 'SUBMITTED',
      },
    ],
    startedAt: 'Sep 18, 2026',
    dueDate: 'Oct 06, 2026',
  },
  {
    id: 'deal-003',
    dealNumber: 'CNT-850',
    campaignId: 'camp-103',
    campaignTitle: 'Developer Tools AI Spotlight',
    creator: {
      id: 'cr-3',
      name: 'Alex Rivera',
      handle: '@alexcode_ai',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      category: 'Software Engineering',
      platforms: ['Twitter', 'LinkedIn'],
      isVerified: true,
      rating: 5.0,
    },
    status: 'ACTIVE',
    stage: 'IN_PRODUCTION',
    stageLabel: 'In Production & Content Scripting',
    agreedAmount: 1800,
    agreedCurrency: 'USD',
    escrowStatus: 'SECURED',
    escrowSecuredAmount: 1800,
    primaryDeliverableTitle: 'Technical Deep-Dive Thread + LinkedIn Longform Case Study',
    deliverables: [
      {
        id: 'del-5',
        title: 'X/Twitter In-Depth Thread',
        type: 'Thread',
        platform: 'Twitter',
        dueDate: 'Oct 18, 2026',
        status: 'PENDING',
      },
    ],
    startedAt: 'Sep 29, 2026',
    dueDate: 'Oct 18, 2026',
  },
  {
    id: 'deal-004',
    dealNumber: 'CNT-799',
    campaignId: 'camp-101',
    campaignTitle: 'Q3 Enterprise SaaS Launch',
    creator: {
      id: 'cr-4',
      name: 'David Kim',
      handle: '@davidk_fintech',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
      category: 'Fintech & Investing',
      platforms: ['YouTube', 'LinkedIn'],
      isVerified: true,
      rating: 5.0,
    },
    status: 'COMPLETED',
    stage: 'COMPLETED',
    stageLabel: 'Contract Fulfilled & Escrow Released',
    agreedAmount: 4200,
    agreedCurrency: 'USD',
    escrowStatus: 'RELEASED',
    escrowSecuredAmount: 4200,
    primaryDeliverableTitle: 'Dedicated SaaS Workflow Review & Case Study',
    deliverables: [
      {
        id: 'del-6',
        title: 'YouTube Workflow Review',
        type: 'Dedicated Video',
        platform: 'YouTube',
        dueDate: 'Sep 15, 2026',
        status: 'VERIFIED',
      },
    ],
    startedAt: 'Aug 20, 2026',
    dueDate: 'Sep 15, 2026',
    completedAt: 'Sep 16, 2026',
  },
  {
    id: 'deal-005',
    dealNumber: 'CNT-740',
    campaignId: 'camp-104',
    campaignTitle: 'Autumn Ergonomic Accessories',
    creator: {
      id: 'cr-5',
      name: 'Elena Rostova',
      handle: '@elena_minimal',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
      category: 'Design & Workspace',
      platforms: ['Instagram', 'YouTube'],
      isVerified: true,
      rating: 4.9,
    },
    status: 'COMPLETED',
    stage: 'COMPLETED',
    stageLabel: 'Contract Fulfilled & Escrow Released',
    agreedAmount: 2750,
    agreedCurrency: 'USD',
    escrowStatus: 'RELEASED',
    escrowSecuredAmount: 2750,
    primaryDeliverableTitle: '3x Minimalist Workspace Reels + 1 YouTube Short',
    deliverables: [
      {
        id: 'del-7',
        title: 'Reels Bundle (3 Reels)',
        type: 'Reels Pack',
        platform: 'Instagram',
        dueDate: 'Sep 05, 2026',
        status: 'VERIFIED',
      },
    ],
    startedAt: 'Aug 10, 2026',
    dueDate: 'Sep 05, 2026',
    completedAt: 'Sep 06, 2026',
  },
  {
    id: 'deal-006',
    dealNumber: 'CNT-620',
    campaignId: 'camp-105',
    campaignTitle: 'Spring Smart Home Ecosystem',
    creator: {
      id: 'cr-6',
      name: 'Jordan Lee',
      handle: '@jordan_smarttech',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&auto=format&fit=crop&q=80',
      category: 'Smart Home & Gadgets',
      platforms: ['TikTok'],
      isVerified: false,
      rating: 4.2,
    },
    status: 'CANCELLED',
    stage: 'CANCELLED',
    stageLabel: 'Cancelled & Escrow 100% Refunded',
    agreedAmount: 1500,
    agreedCurrency: 'USD',
    escrowStatus: 'REFUNDED',
    escrowSecuredAmount: 1500,
    primaryDeliverableTitle: '2x TikTok Integration Videos',
    deliverables: [
      {
        id: 'del-8',
        title: 'TikTok #1',
        type: 'Short Video',
        platform: 'TikTok',
        dueDate: 'Aug 01, 2026',
        status: 'PENDING',
      },
    ],
    startedAt: 'Jul 15, 2026',
    dueDate: 'Aug 01, 2026',
    cancelledAt: 'Jul 28, 2026',
    cancellationReason: 'Creator requested mutual termination due to personal schedule conflicts. All escrow funds safely restored to brand balance.',
  },
];
