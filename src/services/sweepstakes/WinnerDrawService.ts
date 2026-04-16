import { SweepstakesCampaign, SweepstakesEntry, SweepstakesWinnerLog } from '../../models/Sweepstakes';
import { AuditLogService } from './AuditLogService';

export class WinnerDrawService {
  constructor(private readonly auditLogService: AuditLogService) {}

  async drawWinner(campaign: SweepstakesCampaign, actorUserId: number) {
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status === 'closed') {
      throw new Error('Campaign is already closed');
    }

    const entries = await SweepstakesEntry.findAll({ where: { campaignId: campaign.id } });
    if (entries.length === 0) {
      throw new Error('Cannot draw winner without entries');
    }

    const winnerEntry = entries[Math.floor(Math.random() * entries.length)];
    const winnerLog = await SweepstakesWinnerLog.create({
      campaignId: campaign.id,
      winnerUserId: winnerEntry.userId,
      entryId: winnerEntry.id,
      drawMethod: 'uniform_random',
    });

    await campaign.update({ status: 'closed' });

    await this.auditLogService.log(campaign.id, actorUserId, 'winner_drawn', {
      winnerUserId: winnerLog.winnerUserId,
      entryId: winnerLog.entryId,
    });

    return winnerLog;
  }
}
