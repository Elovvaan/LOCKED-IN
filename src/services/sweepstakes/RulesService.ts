import { ALLOWED_SWEEPSTAKES_ENTRY_SOURCES } from '../../models/Sweepstakes';

export class RulesService {
  validateCampaign(payload: any) {
    const required = ['title', 'officialRules', 'eligibility', 'startsAt', 'endsAt', 'prizeDetails', 'freeAlternateMethod'];
    const missing = required.filter((field) => !payload[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    const startsAt = new Date(payload.startsAt);
    const endsAt = new Date(payload.endsAt);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || startsAt >= endsAt) {
      throw new Error('startsAt must be before endsAt');
    }

    if (!String(payload.freeAlternateMethod).trim()) {
      throw new Error('freeAlternateMethod is required');
    }

    const commerceFields = ['assetId', 'amountMinor', 'price', 'currency', 'paymentRef', 'purchaseAmount'];
    if (commerceFields.some((field) => payload[field] !== undefined)) {
      throw new Error('Commerce fields are not allowed in chance-based campaign setup');
    }

    if (payload.purchaseRequired === true) {
      throw new Error('No purchase necessary to enter or win');
    }

    if (payload.paidActionsIncreaseOdds === true) {
      throw new Error('Paid actions must not increase odds of winning');
    }
  }

  validateEntrySource(source: string) {
    if (!ALLOWED_SWEEPSTAKES_ENTRY_SOURCES.includes(source as any)) {
      throw new Error(`source must be one of: ${ALLOWED_SWEEPSTAKES_ENTRY_SOURCES.join(', ')}`);
    }
  }
}
