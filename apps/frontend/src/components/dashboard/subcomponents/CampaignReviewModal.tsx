'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  Send,
  CheckCircle,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import {
  ReviewService,
  ReviewQuestion,
  ReviewRatingInput,
  SubmitReviewPayload,
} from '@/services/review.service';

interface CampaignReviewModalProps {
  campaignId: string;
  reviewType: 'BRAND_TO_INFLUENCER' | 'INFLUENCER_TO_BRAND';
  revieweeInfluencerId?: string;
  revieweeBrandId?: string;
  revieweeName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const RATING_LABELS = ['Poor', 'Below Average', 'Average', 'Good', 'Excellent', 'Outstanding'];

export default function CampaignReviewModal({
  campaignId,
  reviewType,
  revieweeInfluencerId,
  revieweeBrandId,
  revieweeName,
  onClose,
  onSuccess,
}: CampaignReviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadQuestions = useCallback(async () => {
    try {
      const data = await ReviewService.getReviewQuestions(reviewType);
      setQuestions(data);
      const initialRatings: Record<string, number> = {};
      data.forEach((q) => {
        initialRatings[q.id] = 3;
      });
      setRatings(initialRatings);
    } catch (err) {
      console.error('Failed to load review questions', err);
    } finally {
      setIsLoading(false);
    }
  }, [reviewType]);

  useEffect(() => {
    if (mounted) {
      loadQuestions();
    }
  }, [mounted, loadQuestions]);

  const handleRatingChange = (questionId: string, value: number) => {
    setRatings((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const ratingInputs: ReviewRatingInput[] = questions.map((q) => ({
        questionId: q.id,
        rating: ratings[q.id] ?? 3,
      }));

      const payload: SubmitReviewPayload = {
        campaignId,
        reviewType,
        revieweeInfluencerId,
        revieweeBrandId,
        comment: comment.trim() || undefined,
        ratings: ratingInputs,
      };

      await ReviewService.submitReview(payload);
      setIsSubmitted(true);
      onSuccess?.();
    } catch (err: any) {
      console.error('Failed to submit review', err);
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAverageRating = () => {
    const values = Object.values(ratings);
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round((sum / values.length) * 100) / 100;
  };

  const isLastStep = currentStep === questions.length - 1;
  const isFirstStep = currentStep === 0;

  if (!mounted) return null;

  const reviewTypeLabel =
    reviewType === 'BRAND_TO_INFLUENCER' ? 'Influencer' : 'Brand';

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-lg bg-[#090D16] border border-purple-500/25 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isSubmitted ? (
          /* Success State */
          <div className="p-8 sm:p-10 flex flex-col items-center text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-green-400" />
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Review Submitted!</h3>
              <p className="text-white/50 text-sm">
                Thank you for your feedback on this campaign.
              </p>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-2xl font-bold text-white">
                {getAverageRating().toFixed(1)}
              </span>
              <span className="text-white/40 text-sm">/ 5.0</span>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-colors"
            >
              Done
            </button>
          </div>
        ) : isLoading ? (
          /* Loading State */
          <div className="p-10 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-white/40 text-sm">Loading review questions...</p>
          </div>
        ) : (
          /* Review Form */
          <div className="flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Rate this {reviewTypeLabel}
                  </h3>
                  {revieweeName && (
                    <p className="text-white/40 text-xs">{revieweeName}</p>
                  )}
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((currentStep + 1) / questions.length) * 100}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-white/30 text-xs font-medium whitespace-nowrap">
                  {currentStep + 1} / {questions.length}
                </span>
              </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
              {questions.length > 0 && (
                <div className="space-y-6">
                  {/* Category badge */}
                  <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium capitalize">
                    {questions[currentStep].category || 'General'}
                  </span>

                  {/* Question text */}
                  <h4 className="text-white text-base font-medium leading-relaxed">
                    {questions[currentStep].text}
                  </h4>

                  {/* Rating slider */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5">
                        {[0, 1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            onClick={() =>
                              handleRatingChange(questions[currentStep].id, value)
                            }
                            className="group/star"
                          >
                            <Star
                              className={`w-8 h-8 transition-all duration-200 ${
                                value <= (ratings[questions[currentStep].id] ?? 3)
                                  ? 'text-yellow-400 fill-yellow-400 scale-110'
                                  : 'text-white/10 group-hover/star:text-yellow-400/30'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-2xl font-bold text-white min-w-[2.5rem] text-right">
                        {ratings[questions[currentStep].id] ?? 3}
                      </span>
                    </div>

                    {/* Label */}
                    <p className="text-center text-sm text-white/40 font-medium">
                      {RATING_LABELS[ratings[questions[currentStep].id] ?? 3]}
                    </p>

                    {/* Slider input */}
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={1}
                      value={ratings[questions[currentStep].id] ?? 3}
                      onChange={(e) =>
                        handleRatingChange(
                          questions[currentStep].id,
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/5 accent-purple-500
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500
                        [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(168,85,247,0.5)]
                        [&::-webkit-slider-thumb]:cursor-pointer"
                    />

                    <div className="flex justify-between text-xs text-white/20">
                      <span>0</span>
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Comment (only on last step) */}
            {isLastStep && (
              <div className="px-6 sm:px-8 pb-2">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-white/50 font-medium">
                    <MessageSquare className="w-4 h-4" />
                    Additional Comments (optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share any additional thoughts about your experience..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 resize-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="px-6 sm:px-8 py-4 border-t border-white/5 flex items-center justify-between gap-3">
              <button
                onClick={isFirstStep ? onClose : () => setCurrentStep((s) => s - 1)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm font-medium transition-colors"
              >
                {isFirstStep ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                {/* Overall rating preview */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 mr-2">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-semibold text-white">
                    {getAverageRating().toFixed(1)}
                  </span>
                </div>

                {isLastStep ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/25"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentStep((s) => s + 1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );

  return createPortal(
    <AnimatePresence>{mounted && modalContent}</AnimatePresence>,
    document.body,
  );
}
