/**
 * Cashfree NetBanking Bank Code Mapper
 * Translates bank alphanumeric codes / IFSC prefixes into Cashfree's numeric netbanking_bank_code.
 * In sandbox mode, '3333' acts as the universal testing bank.
 */

export const CASHFREE_BANK_CODES: Record<string, number> = {
  // Top Tier Banks
  SBIN: 3044, // State Bank of India (Retail)
  SBI: 3044,
  SBINC: 3066, // State Bank of India (Corporate)
  HDFC: 3021, // HDFC Bank
  ICIC: 3022, // ICICI Bank
  ICICI: 3022,
  UTIB: 3003, // Axis Bank
  AXIS: 3003,
  KKBK: 3032, // Kotak Mahindra Bank
  KOTAK: 3032,
  PUNB: 3038, // Punjab National Bank
  PNB: 3038,
  BARB_R: 3005, // Bank of Baroda (Retail)
  BOB: 3005,
  CNRB: 3009, // Canara Bank
  UBIN: 3049, // Union Bank of India
  BKID: 3006, // Bank of India
  BOI: 3006,
  INDB: 3024, // IndusInd Bank
  YESB: 3051, // Yes Bank
  IDFB: 3023, // IDFC FIRST Bank
  IDBI: 3020, // IDBI Bank
  FDRL: 3019, // Federal Bank
  IDIB: 3025, // Indian Bank
  CBIN: 3010, // Central Bank of India
  IOBA: 3027, // Indian Overseas Bank
  UCBA: 3048, // UCO Bank
  MAHB: 3007, // Bank of Maharashtra
  PSIB: 3037, // Punjab & Sind Bank
  RBL: 3039, // RBL Bank
  BDBL: 3004, // Bandhan Bank

  // Small Finance & Payment Banks
  AUBL: 3061, // AU Small Finance Bank
  EQTX: 3062, // Equitas Small Finance Bank
  UJVN: 3063, // Ujjivan Small Finance Bank
  CSBK: 3012, // CSB Bank
  KVBL: 3030, // Karur Vysya Bank
  KARB: 3029, // Karnataka Bank
  CIUB: 3011, // City Union Bank
  TMBL: 3046, // Tamilnad Mercantile Bank
  SIBL: 3043, // South Indian Bank
  DLXB: 3016, // Dhanlaxmi Bank
  JAKA: 3028, // Jammu & Kashmir Bank

  // Multinational Banks
  SCBL: 3042, // Standard Chartered
  HSBC: 3026, // HSBC
  CITI: 3014, // Citibank
  DBSS: 3017, // DBS Bank
  DEUT: 3015, // Deutsche Bank
  BARC: 3008, // Barclays

  // Universal Cashfree Sandbox Simulator Bank
  SANDBOX: 3333,
  TEST: 3333,
  SIMULATOR: 3333,
};

/**
 * Resolves a bank identifier (code or name) to Cashfree's numeric netbanking_bank_code.
 */
export function resolveCashfreeBankCode(bankInput?: string | number, isSandbox = false): number {
  if (!bankInput) {
    return isSandbox ? 3333 : 3021; // Default to sandbox test bank (3333) or HDFC (3021)
  }

  // If already a numeric code
  if (typeof bankInput === 'number') {
    return bankInput;
  }

  const clean = String(bankInput).trim().toUpperCase();
  const numeric = parseInt(clean, 10);
  if (!isNaN(numeric) && numeric > 1000) {
    return numeric;
  }

  // Lookup in bank table
  if (CASHFREE_BANK_CODES[clean]) {
    return CASHFREE_BANK_CODES[clean];
  }

  // Fallback for sandbox
  if (isSandbox) {
    return 3333;
  }

  // Default to HDFC if unmapped
  return 3021;
}
