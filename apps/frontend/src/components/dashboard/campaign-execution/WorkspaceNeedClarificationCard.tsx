'use client';

import React, { useState } from 'react';
import { MessageSquare, Loader2, HelpCircle } from 'lucide-react';
import { MessagingService } from '@/services/messaging.service';
import { useMessaging } from '@/context/MessagingContext';
import { useToast } from '@/components/ui/Toast';
import { panel } from './ExecutionUi';

interface WorkspaceNeedClarificationCardProps {
  campaign?: {
    id?: string;
    title?: string;
    brandProfile?: {
      id?: string;
      userId?: string;
      companyName?: string;
      logoUrl?: string;
      user?: {
        id?: string;
        name?: string;
      };
    };
  };
  participantCampaignId?: string;
  onNavigate?: (routeId: string) => void;
}

export default function WorkspaceNeedClarificationCard({
  campaign,
  participantCampaignId,
  onNavigate,
}: WorkspaceNeedClarificationCardProps) {
  const [isMessaging, setIsMessaging] = useState(false);
  const { setActiveConversationId, refreshConversations } = useMessaging();
  const { toastError } = useToast();

  const handleMessageBrand = async () => {
    try {
      setIsMessaging(true);
      const brandUserId =
        campaign?.brandProfile?.userId ||
        campaign?.brandProfile?.user?.id;
      const campaignId = campaign?.id || participantCampaignId;

      if (!brandUserId) {
        toastError('Unable to locate brand contact information.');
        onNavigate?.('messages');
        return;
      }

      const res = await MessagingService.createConversation({
        participantId: brandUserId,
        campaignId,
      });

      if (res?.conversationId) {
        setActiveConversationId(res.conversationId);
      }
      await refreshConversations();
      onNavigate?.('messages');
    } catch (err: any) {
      console.error('Failed to open message conversation with brand:', err);
      toastError(err?.message || 'Failed to open message conversation with brand.');
      onNavigate?.('messages');
    } finally {
      setIsMessaging(false);
    }
  };

  return (
    <section className={`${panel} p-5 text-xs text-slate-300 space-y-3.5`}>
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <HelpCircle className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-white text-sm">Need a clarification?</h3>
      </div>
      <p className="leading-relaxed text-slate-400">
        Use Messages to contact <strong className="text-slate-200">{campaign?.brandProfile?.companyName || 'the brand'}</strong> directly regarding briefs, deliverables, or review feedback.
      </p>
      <button
        type="button"
        disabled={isMessaging}
        onClick={handleMessageBrand}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-950/40 hover:shadow-purple-900/60 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75 disabled:cursor-wait"
      >
        {isMessaging ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <MessageSquare className="h-4 w-4 text-white" />
            <span>Message Brand</span>
          </>
        )}
      </button>
    </section>
  );
}
