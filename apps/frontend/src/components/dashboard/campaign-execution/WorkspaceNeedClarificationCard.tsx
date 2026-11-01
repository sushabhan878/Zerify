'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  recipientUserId?: string;
  recipientName?: string;
  recipientRole?: 'Brand' | 'Creator';
  onNavigate?: (routeId: string) => void;
}

export default function WorkspaceNeedClarificationCard({
  campaign,
  participantCampaignId,
  recipientUserId,
  recipientName,
  recipientRole = 'Brand',
  onNavigate,
}: WorkspaceNeedClarificationCardProps) {
  const [isMessaging, setIsMessaging] = useState(false);
  const router = useRouter();
  const { setActiveConversationId, refreshConversations } = useMessaging();
  const { toastError } = useToast();

  const handleMessage = async () => {
    try {
      setIsMessaging(true);
      const targetUserId =
        recipientUserId ||
        campaign?.brandProfile?.userId ||
        campaign?.brandProfile?.user?.id;
      const campaignId = campaign?.id || participantCampaignId;

      const navigateToMessages = () => {
        if (onNavigate) {
          onNavigate('messages');
        } else {
          router.push('/dashboard?tab=messages');
        }
      };

      if (!targetUserId) {
        toastError('Unable to locate contact information.');
        navigateToMessages();
        return;
      }

      const res = await MessagingService.createConversation({
        participantId: targetUserId,
        campaignId,
      });

      if (res?.conversationId) {
        setActiveConversationId(res.conversationId);
      }
      await refreshConversations();
      navigateToMessages();
    } catch (err: any) {
      console.error('Failed to open message conversation:', err);
      toastError(err?.message || 'Failed to open message conversation.');
      if (onNavigate) onNavigate('messages');
      else router.push('/dashboard?tab=messages');
    } finally {
      setIsMessaging(false);
    }
  };

  return (
    <section className={`${panel} p-5 sm:p-6 text-xs text-slate-300 light:text-slate-700 space-y-4`}>
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 light:bg-purple-50 light:border-purple-200 light:text-purple-700">
          <HelpCircle className="w-5 h-5" />
        </div>
        <h3 className="font-extrabold text-white light:text-slate-900 text-base">Need a clarification?</h3>
      </div>
      <p className="leading-relaxed text-slate-400 light:text-slate-600 text-xs">
        Use Messages to contact <strong className="text-white light:text-slate-900 font-bold">{recipientName || campaign?.brandProfile?.companyName || 'Zerify'}</strong> directly regarding briefs, deliverables, or review feedback.
      </p>
      <button
        type="button"
        disabled={isMessaging}
        onClick={handleMessage}
        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-500 hover:via-purple-600 hover:to-pink-500 py-3 px-4 text-xs font-bold text-white keep-white shadow-lg shadow-purple-950/40 hover:shadow-purple-900/60 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.98] disabled:opacity-75 disabled:cursor-wait"
      >
        {isMessaging ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-white keep-white" />
            <span className="text-white keep-white">Connecting...</span>
          </>
        ) : (
          <>
            <MessageSquare className="h-4 w-4 text-white keep-white" />
            <span className="text-white keep-white">Message {recipientRole}</span>
          </>
        )}
      </button>
    </section>
  );
}
