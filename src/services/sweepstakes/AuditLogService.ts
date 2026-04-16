import { SweepstakesAuditLog } from '../../models/Sweepstakes';

export class AuditLogService {
  async log(campaignId: number, actorUserId: number, action: string, details?: any) {
    return SweepstakesAuditLog.create({
      campaignId,
      actorUserId,
      action,
      details: details ? JSON.stringify(details) : undefined,
    });
  }
}
