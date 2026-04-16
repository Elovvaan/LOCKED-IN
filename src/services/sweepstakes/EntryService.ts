import { SweepstakesCampaign, SweepstakesEntry } from '../../models/Sweepstakes';
import { RulesService } from './RulesService';
import { AuditLogService } from './AuditLogService';

export class EntryService {
  constructor(private readonly rulesService: RulesService, private readonly auditLogService: AuditLogService) {}

  async addEntry(campaign: SweepstakesCampaign, userId: number, payload: any) {
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const now = new Date();
    if (campaign.status !== 'active' || now < new Date(campaign.startsAt) || now > new Date(campaign.endsAt)) {
      throw new Error('Campaign is not currently accepting entries');
    }

    if (payload.purchaseAmount || payload.paymentRef || payload.isPaid === true) {
      throw new Error('Paid actions are not valid entry methods');
    }

    this.rulesService.validateEntrySource(payload.source);

    const entry = await SweepstakesEntry.create({
      campaignId: campaign.id,
      userId,
      source: payload.source,
      isFree: true,
    });

    await this.auditLogService.log(campaign.id, userId, 'entry_created', { source: entry.source });

    return entry;
  }
}
