import { SweepstakesFulfillment, SweepstakesWinnerLog } from '../../models/Sweepstakes';
import { AuditLogService } from './AuditLogService';

export class FulfillmentService {
  constructor(private readonly auditLogService: AuditLogService) {}

  async createFulfillmentFromWinner(winnerLog: SweepstakesWinnerLog, actorUserId: number) {
    const fulfillment = await SweepstakesFulfillment.create({
      campaignId: winnerLog.campaignId,
      winnerLogId: winnerLog.id,
      winnerUserId: winnerLog.winnerUserId,
      status: 'pending',
    });

    await this.auditLogService.log(winnerLog.campaignId, actorUserId, 'fulfillment_created', {
      winnerLogId: winnerLog.id,
      fulfillmentId: fulfillment.id,
    });

    return fulfillment;
  }

  async markFulfilled(campaignId: number, notes: string | undefined, actorUserId: number) {
    const fulfillment = await SweepstakesFulfillment.findOne({ where: { campaignId } });
    if (!fulfillment) {
      throw new Error('Fulfillment not found');
    }

    await fulfillment.update({ status: 'fulfilled', notes, fulfilledAt: new Date() });

    await this.auditLogService.log(campaignId, actorUserId, 'fulfillment_updated', {
      fulfillmentId: fulfillment.id,
      status: 'fulfilled',
    });

    return fulfillment;
  }
}
