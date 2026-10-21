/**
 * GSTIN Validation & Name Comparison Utilities
 * Conforms to FR-02 & FR-06 of Zerify_GSTIN_Verification_PRD.md
 */

// Official Indian State/UT code mapping to 2-digit GST prefix
export const GST_STATE_CODES: Record<string, string> = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh (Old)',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
  '97': 'Other Territory',
  '99': 'Centre Jurisdiction',
};

// Standard GSTIN format regex: 2 state digits + 5 PAN chars + 4 PAN digits + 1 entity num + 1 'Z' + 1 checksum
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/**
 * Normalizes a GSTIN string: removes spaces/hyphens and converts to uppercase.
 */
export function normalizeGstin(input: string): string {
  if (!input) return '';
  return input.trim().replace(/[\s-]/g, '').toUpperCase();
}

/**
 * Validates the 15-character GSTIN format.
 */
export function isValidGstinFormat(gstin: string): boolean {
  const normalized = normalizeGstin(gstin);
  return GSTIN_REGEX.test(normalized);
}

/**
 * Returns state name from 2-digit GST prefix.
 */
export function getStateFromGstin(gstin: string): { stateCode: string; stateName: string } {
  const normalized = normalizeGstin(gstin);
  const stateCode = normalized.slice(0, 2);
  const stateName = GST_STATE_CODES[stateCode] || 'Unknown State';
  return { stateCode, stateName };
}

/**
 * Normalizes business names for resilient matching:
 * - Lowercase
 * - Strips legal suffix acronyms (pvt, ltd, private, limited, llp, co, corp, bank)
 * - Strips punctuation and excessive whitespace
 */
export function cleanBusinessName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\b(private|pvt|limited|ltd|llp|corp|corporation|inc|incorporated|co|company|bank)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates token overlap score (Dice coefficient) between two strings.
 */
export function calculateNameMatchScore(nameA: string, nameB: string): number {
  const cleanA = cleanBusinessName(nameA);
  const cleanB = cleanBusinessName(nameB);

  if (!cleanA || !cleanB) return 0;
  if (cleanA === cleanB) return 1.0;

  const tokensA = new Set(cleanA.split(' ').filter(Boolean));
  const tokensB = new Set(cleanB.split(' ').filter(Boolean));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersectionCount = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersectionCount++;
    }
  }

  // Token Jaccard / Dice similarity
  const total = tokensA.size + tokensB.size;
  const diceScore = (2.0 * intersectionCount) / total;

  // Substring bonus if one name is entirely contained in the other
  if (cleanA.includes(cleanB) || cleanB.includes(cleanA)) {
    return Math.max(diceScore, 0.85);
  }

  return Number(diceScore.toFixed(2));
}

/**
 * Evaluates whether user-entered name matches provider legal/trade names.
 * Threshold is >= 0.70 match score.
 */
export function evaluateNameMatch(
  userBusinessName: string,
  providerLegalName?: string | null,
  providerTradeName?: string | null,
): { isMatched: boolean; score: number; bestMatchedName: string } {
  const legalScore = providerLegalName ? calculateNameMatchScore(userBusinessName, providerLegalName) : 0;
  const tradeScore = providerTradeName ? calculateNameMatchScore(userBusinessName, providerTradeName) : 0;

  const bestScore = Math.max(legalScore, tradeScore);
  const bestMatchedName = bestScore === tradeScore && providerTradeName ? providerTradeName : (providerLegalName || '');

  return {
    isMatched: bestScore >= 0.70,
    score: bestScore,
    bestMatchedName,
  };
}
