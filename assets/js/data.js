// ============================================================================
//  AVEN — Feature 1 pricing matrix (single source of truth for price math).
//
//  Final price = baseMonthlyUSD × billing.months × billing.discount × fx.rate
//    - baseMonthlyUSD .. per-tier base monthly rate (the only base numbers)
//    - billing.months .. 1 for monthly, 12 for the annual total
//    - billing.discount  flat 20% off on the annual cycle (×0.8)
//    - fx.rate ......... regional tariff variable (currency conversion)
//
//  Tier names / feature copy live in static semantic HTML; only the price
//  NUMBERS are derived here so nothing computable is hardcoded in the markup.
// ============================================================================

export const PRICING = {
  // regional tariff variables (currency conversion)
  fx: {
    USD: { rate: 1,     symbol: '$', code: 'USD', locale: 'en-US' },
    INR: { rate: 83.23, symbol: '₹', code: 'INR', locale: 'en-IN' },
    EUR: { rate: 0.92,  symbol: '€', code: 'EUR', locale: 'de-DE' },
  },
  // billing cycle dimensions: total months billed × discount multiplier
  billing: {
    monthly: { months: 1,  discount: 1,   suffix: '/mo' },
    annual:  { months: 12, discount: 0.8, suffix: '/yr' },
  },
  // per-tier base monthly rate in USD (everything else is derived)
  tiers: [
    { id: 'starter',    baseMonthlyUSD: 19  },
    { id: 'growth',     baseMonthlyUSD: 79  },
    { id: 'enterprise', baseMonthlyUSD: 239 },
  ],
};
