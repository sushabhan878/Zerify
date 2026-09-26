'use client';

import { panel } from './ExecutionUi';

export default function CampaignBrief({ campaign }: { campaign: any }) {
  const guidelines = campaign.contentGuidelines || {};
  const fields: [string, unknown][] = [
    ['Objective', campaign.objective], ['Product', campaign.product?.productName],
    ['Product instructions', campaign.product?.productInstructions], ['Content guidelines', guidelines.description],
    ['Required hashtags', guidelines.requiredHashtags], ['Required mentions', guidelines.requiredMentions],
    ['Required calls to action', guidelines.requiredCtas], ['Target audience', campaign.requirement?.targetAgeGroup],
    ['Audience countries', campaign.requirement?.audienceCountries],
  ];
  return <section className={`${panel} space-y-4 p-5`}>
    <h3 className="font-bold text-white">Campaign brief & requirements</h3>
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{campaign.description || 'Review the individual deliverable requirements below.'}</p>
    <dl className="space-y-3">{fields.filter(([, value]) => value && (!Array.isArray(value) || value.length)).map(([label, value]) => <div key={label}><dt className="text-xs font-semibold text-purple-300">{label}</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{Array.isArray(value) ? value.join(' · ') : String(value)}</dd></div>)}</dl>
    {[...(guidelines.referenceUrls || []), ...(guidelines.assetUrls || [])].filter((u: string) => /^https:\/\//i.test(u)).map((u: string, i: number) => <a className="block break-all text-sm text-purple-300 hover:underline" key={`${u}-${i}`} href={u} target="_blank" rel="noopener noreferrer">Reference / brand asset {i + 1}</a>)}
  </section>;
}
