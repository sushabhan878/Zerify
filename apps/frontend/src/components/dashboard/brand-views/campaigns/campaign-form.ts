import { CampaignItem } from '@/services/campaign.service';

const scalarFields = ['title', 'objective', 'description', 'industry', 'coverImageUrl', 'platforms',
  'budgetPaymentModel', 'budgetCurrency', 'budgetTotalAmount', 'budgetMinPerInfluencer',
  'budgetMaxPerInfluencer', 'performanceMetric', 'performanceRate', 'barterItems', 'shippingCovered',
  'targetParticipants', 'maxParticipants', 'autoCloseWhenFilled', 'contentGuidelines'];
const dateFields = ['applicationDeadline', 'startDate', 'endDate'];
const productFields = ['productName', 'productType', 'hasFreeProduct', 'freeProductValue', 'shippingDetails', 'productInstructions', 'landingPageUrl'];
const deliverableFields = ['platform', 'type', 'title', 'description', 'quantity', 'dueDate', 'requiredCta', 'mandatoryHashtags', 'mandatoryMentions', 'instructions', 'revisionLimit', 'requiresPreApproval', 'requiresPublication', 'allowLateSubmission', 'maxFileSizeMb', 'allowedMimeTypes', 'publicationDeadline'];

/** Only editable values enter the wizard; database identities never enter its payload. */
export function campaignToForm(campaign?: CampaignItem): Record<string, any> {
  if (!campaign) return {};
  const data: Record<string, any> = {};
  const source = campaign as unknown as Record<string, any>;
  scalarFields.forEach((field) => { if (source[field] != null) data[field] = source[field]; });
  productFields.forEach((field) => { if (source.product?.[field] != null) data[field] = source.product[field]; });
  dateFields.forEach((field) => { data[field] = source[field]?.slice(0, 10) || ''; });
  const req = source.requirement;
  data.requirements = {
    strictEligibility: req?.strictEligibility ?? false,
    social: { minFollowers: req?.minFollowers ?? '', minEngagementRate: req?.minEngagementRate ?? '', verifiedOnly: req?.verifiedOnly ?? false },
    influencer: { countries: req?.targetCountries ?? [], genders: req?.targetGenders ?? [], languages: req?.targetLanguages ?? [] },
    audience: { countries: req?.audienceCountries ?? [], targetAgeGroup: req?.targetAgeGroup ?? [] },
  };
  data.deliverables = (source.deliverables ?? []).map((item: Record<string, any>) => Object.fromEntries(
    deliverableFields.filter((key) => item[key] != null).map((key) => [key, ['dueDate', 'publicationDeadline'].includes(key) ? item[key].slice(0, 10) : item[key]]),
  ));
  return data;
}

export function campaignEditPayload(form: Record<string, any>, sanitized: Record<string, any>, baseline: Record<string, any>) {
  const payload: Record<string, any> = {};
  Object.keys(form).forEach((key) => {
    if (JSON.stringify(form[key]) === JSON.stringify(baseline[key])) return;
    payload[key] = sanitized[key] === undefined ? null : sanitized[key];
  });
  // Nested requirement groups support clearing an existing threshold or country list.
  if (payload.requirements) payload.requirements = {
    ...form.requirements,
    social: {
      ...form.requirements.social,
      minFollowers: form.requirements.social?.minFollowers === '' ? null : form.requirements.social?.minFollowers,
      minEngagementRate: form.requirements.social?.minEngagementRate === '' ? null : form.requirements.social?.minEngagementRate,
    },
  };
  return payload;
}
