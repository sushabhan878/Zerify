import {
  normalizeGstin,
  isValidGstinFormat,
  getStateFromGstin,
  cleanBusinessName,
  calculateNameMatchScore,
  evaluateNameMatch,
} from './gst-validator.util';

describe('GST Validation Utilities', () => {
  describe('normalizeGstin', () => {
    it('normalizes lowercase and hyphenated GSTIN to uppercase trimmed', () => {
      expect(normalizeGstin(' 29aaicp2912r1zr ')).toBe('29AAICP2912R1ZR');
      expect(normalizeGstin('29-AAICP-2912R1ZR')).toBe('29AAICP2912R1ZR');
    });

    it('handles empty input gracefully', () => {
      expect(normalizeGstin('')).toBe('');
    });
  });

  describe('isValidGstinFormat', () => {
    it('validates a correct 15-character Indian GSTIN', () => {
      expect(isValidGstinFormat('29AAICP2912R1ZR')).toBe(true);
      expect(isValidGstinFormat('27AAACG0565F1ZS')).toBe(true);
      expect(isValidGstinFormat('07AAAAA0000A1Z5')).toBe(true);
    });

    it('rejects invalid or malformed GSTIN formats', () => {
      expect(isValidGstinFormat('INVALID_GSTIN')).toBe(false);
      expect(isValidGstinFormat('29AAICP2912R1Z')).toBe(false); // 14 chars
      expect(isValidGstinFormat('29AAICP2912R1ZRA')).toBe(false); // 16 chars
      expect(isValidGstinFormat('999999999999999')).toBe(false); // All digits
    });
  });

  describe('getStateFromGstin', () => {
    it('resolves state code and name', () => {
      expect(getStateFromGstin('29AAICP2912R1ZR')).toEqual({
        stateCode: '29',
        stateName: 'Karnataka',
      });
      expect(getStateFromGstin('27AAACG0565F1ZS')).toEqual({
        stateCode: '27',
        stateName: 'Maharashtra',
      });
      expect(getStateFromGstin('07AAAAA0000A1Z5')).toEqual({
        stateCode: '07',
        stateName: 'Delhi',
      });
    });
  });

  describe('cleanBusinessName and Name Matching', () => {
    it('removes common legal suffixes and punctuation', () => {
      expect(cleanBusinessName('Ujjivan Small Finance Bank Limited')).toBe('ujjivan small finance');
      expect(cleanBusinessName('Zerify Technologies Pvt. Ltd.')).toBe('zerify technologies');
    });

    it('evaluates matching business names successfully', () => {
      const match1 = evaluateNameMatch(
        'Ujjivan Small Finance Bank',
        'UJJIVAN SMALL FINANCE BANK LIMITED',
        'UJJIVAN SMALL FINANCE BANK',
      );
      expect(match1.isMatched).toBe(true);
      expect(match1.score).toBeGreaterThanOrEqual(0.7);

      const match2 = evaluateNameMatch(
        'Acme Global Solutions',
        'ACME GLOBAL SOLUTIONS PRIVATE LIMITED',
        undefined,
      );
      expect(match2.isMatched).toBe(true);
    });

    it('flags distinct business names as mismatch', () => {
      const mismatch = evaluateNameMatch(
        'Different Company Corp',
        'UJJIVAN SMALL FINANCE BANK LIMITED',
        undefined,
      );
      expect(mismatch.isMatched).toBe(false);
      expect(mismatch.score).toBeLessThan(0.7);
    });
  });
});
