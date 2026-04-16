import { SweepstakesCampaign } from '../../models/Sweepstakes';
import { RulesService } from './RulesService';
import { AuditLogService } from './AuditLogService';

export class CampaignService {
  constructor(private readonly rulesService: RulesService, private readonly auditLogService: AuditLogService) {}

  async createCampaign(createdByUserId: number, payload: any) {
    this.rulesService.validateCampaign(payload);

    const campaign = await SweepstakesCampaign.create({
      createdByUserId,
      title: payload.title,
      officialRules: payload.officialRules,
      eligibility: payload.eligibility,
      startsAt: new Date(payload.startsAt),
      endsAt: new Date(payload.endsAt),
      prizeDetails: payload.prizeDetails,
      freeAlternateMethod: payload.freeAlternateMethod,
      noPurchaseNecessary: true,
      paidActionsIncreaseOdds: false,
      status: payload.status || 'active',
    });

    await this.auditLogService.log(campaign.id, createdByUserId, 'campaign_created', {
      title: campaign.title,
      startsAt: campaign.startsAt,
      endsAt: campaign.endsAt,
    });

    return campaign;
  }

  async getCampaign(campaignId: number) {
    return SweepstakesCampaign.findByPk(campaignId);
  }
}
