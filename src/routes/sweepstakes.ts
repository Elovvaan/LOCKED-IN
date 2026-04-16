import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  SweepstakesAuditLog,
  SweepstakesFulfillment,
  SweepstakesWinnerLog,
} from '../models/Sweepstakes';
import { AuditLogService } from '../services/sweepstakes/AuditLogService';
import { CampaignService } from '../services/sweepstakes/CampaignService';
import { EntryService } from '../services/sweepstakes/EntryService';
import { FulfillmentService } from '../services/sweepstakes/FulfillmentService';
import { RulesService } from '../services/sweepstakes/RulesService';
import { WinnerDrawService } from '../services/sweepstakes/WinnerDrawService';

const router = Router();
router.use(authMiddleware);

const rulesService = new RulesService();
const auditLogService = new AuditLogService();
const campaignService = new CampaignService(rulesService, auditLogService);
const entryService = new EntryService(rulesService, auditLogService);
const winnerDrawService = new WinnerDrawService(auditLogService);
const fulfillmentService = new FulfillmentService(auditLogService);

router.post('/campaigns', async (req: AuthRequest, res: Response) => {
  try {
    const campaign = await campaignService.createCampaign(req.user!.id, req.body);
    return res.status(201).json(campaign);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.get('/campaigns/:id', async (req: AuthRequest, res: Response) => {
  const campaignId = parseInt(req.params.id, 10);
  const campaign = await campaignService.getCampaign(campaignId);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  const winnerLogs = await SweepstakesWinnerLog.findAll({ where: { campaignId } });
  const fulfillment = await SweepstakesFulfillment.findOne({ where: { campaignId } });

  return res.json({
    campaign,
    winnerLogs,
    fulfillment,
  });
});

router.post('/campaigns/:id/entries', async (req: AuthRequest, res: Response) => {
  try {
    const campaignId = parseInt(req.params.id, 10);
    const campaign = await campaignService.getCampaign(campaignId);
    const entry = await entryService.addEntry(campaign as any, req.user!.id, req.body);
    return res.status(201).json(entry);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.post('/campaigns/:id/draw', async (req: AuthRequest, res: Response) => {
  try {
    const campaignId = parseInt(req.params.id, 10);
    const campaign = await campaignService.getCampaign(campaignId);
    const winnerLog = await winnerDrawService.drawWinner(campaign as any, req.user!.id);
    const fulfillment = await fulfillmentService.createFulfillmentFromWinner(winnerLog, req.user!.id);
    return res.status(201).json({ winnerLog, fulfillment });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.patch('/campaigns/:id/fulfillment', async (req: AuthRequest, res: Response) => {
  try {
    const campaignId = parseInt(req.params.id, 10);
    const fulfillment = await fulfillmentService.markFulfilled(campaignId, req.body?.notes, req.user!.id);
    return res.json(fulfillment);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

router.get('/campaigns/:id/audit-logs', async (req: AuthRequest, res: Response) => {
  const campaignId = parseInt(req.params.id, 10);
  const logs = await SweepstakesAuditLog.findAll({ where: { campaignId }, order: [['createdAt', 'ASC']] });
  return res.json(logs);
});

export default router;
