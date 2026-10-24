import { Prisma } from '@prisma/client';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

const scalarFields = [
  'title', 'objective', 'description', 'industry', 'coverImageUrl', 'platforms',
  'budgetTotalAmount', 'budgetCurrency', 'budgetPaymentModel', 'budgetMinPerInfluencer',
  'budgetMaxPerInfluencer', 'performanceMetric', 'performanceRate', 'barterItems',
  'shippingCovered', 'targetParticipants', 'maxParticipants', 'autoCloseWhenFilled',
  'contentGuidelines', 'applicationDeadline', 'startDate', 'endDate',
] as const;
const productFields = ['productName', 'productType', 'landingPageUrl', 'coverImageUrl', 'hasFreeProduct', 'freeProductValue', 'shippingDetails', 'productInstructions'];
const deliverableFields = ['platform', 'type', 'title', 'description', 'quantity', 'dueDate', 'requiredCta', 'mandatoryHashtags', 'mandatoryMentions', 'instructions', 'revisionLimit', 'requiresPreApproval', 'requiresPublication', 'allowLateSubmission', 'maxFileSizeMb', 'allowedMimeTypes', 'publicationDeadline'];
const dates = ['applicationDeadline', 'startDate', 'endDate', 'dueDate', 'publicationDeadline'];
const selectDefined = (source: any, keys: readonly string[]) => Object.fromEntries(keys.filter((key) => source[key] !== undefined).map((key) => [key, dates.includes(key) && source[key] ? new Date(source[key]) : source[key]]));

export function buildCampaignUpdate(dto: UpdateCampaignDto, existing: any): Prisma.CampaignUpdateInput {
  const data: any = selectDefined(dto, scalarFields);
  if (data.title !== undefined) data.title = data.title.trim();
  if (data.contentGuidelines === null) data.contentGuidelines = Prisma.DbNull;
  const product = selectDefined(dto, productFields);
  if (Object.keys(product).length) {
    data.product = { upsert: { create: { productName: dto.productName || existing.title, ...product }, update: product } };
  }
  if (dto.requirements) {
    const { social, influencer, audience, strictEligibility } = dto.requirements;
    const requirement = Object.fromEntries(Object.entries({
      strictEligibility,
      minFollowers: social?.minFollowers, minEngagementRate: social?.minEngagementRate,
      verifiedOnly: social?.verifiedOnly, targetCountries: influencer?.countries,
      targetGenders: influencer?.genders, targetLanguages: influencer?.languages,
      targetAgeGroup: audience?.targetAgeGroup, audienceCountries: audience?.countries,
    }).filter(([, value]) => value !== undefined));
    data.requirement = { upsert: { create: requirement, update: requirement } };
  }
  if (dto.deliverables) {
    data.deliverables = { deleteMany: {}, create: dto.deliverables.map((d) => selectDefined(d, deliverableFields)) };
  }
  return data;
}

const label = (key: string) => key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (s) => s.toUpperCase());
const display = (value: any): string => {
  if (value === null || value === undefined || value === '') return '—';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length ? value.map(display).join(', ') : '—';
  return String(value);
};

export function campaignChanges(before: any, after: any) {
  const changes: { field: string; before: string; after: string }[] = [];
  const compare = (field: string, oldValue: any, newValue: any) => {
    if ((oldValue && typeof oldValue === 'object' && !Array.isArray(oldValue) && !(oldValue instanceof Date)) ||
        (newValue && typeof newValue === 'object' && !Array.isArray(newValue) && !(newValue instanceof Date))) {
      for (const key of new Set([...Object.keys(oldValue || {}), ...Object.keys(newValue || {})])) {
        compare(`${field} · ${label(key)}`, oldValue?.[key], newValue?.[key]);
      }
    } else if (display(oldValue) !== display(newValue)) {
      changes.push({ field, before: display(oldValue), after: display(newValue) });
    }
  };
  scalarFields.forEach((key) => compare(label(key), before[key], after[key]));
  productFields.filter((key) => key !== 'coverImageUrl').forEach((key) => compare(label(key), before.product?.[key], after.product?.[key]));
  compare('Creator requirements', before.requirement ? selectDefined(before.requirement, ['strictEligibility', 'minFollowers', 'minEngagementRate', 'verifiedOnly', 'targetCountries', 'targetGenders', 'targetLanguages', 'targetAgeGroup', 'audienceCountries']) : {}, after.requirement ? selectDefined(after.requirement, ['strictEligibility', 'minFollowers', 'minEngagementRate', 'verifiedOnly', 'targetCountries', 'targetGenders', 'targetLanguages', 'targetAgeGroup', 'audienceCountries']) : {});
  for (let index = 0; index < Math.max(before.deliverables.length, after.deliverables.length); index++) {
    const oldItem = before.deliverables[index];
    const newItem = after.deliverables[index];
    deliverableFields.forEach((key) => compare(`Deliverable ${index + 1} · ${label(key)}`, oldItem?.[key], newItem?.[key]));
  }
  return changes;
}
