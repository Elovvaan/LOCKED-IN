import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  CreatorRegistry,
  AssetRegistry,
  SplitRule,
  CreatorVault,
  EntitlementPass,
  LicenseManager,
  RoyaltyManager,
  ProvenanceService,
  SettlementService,
} from '../models';

const router = Router();
router.use(authMiddleware);

const DEFAULT_STABLECOIN = 'USDC';
const DEFAULT_CHAIN = 'base';

const serviceContracts = {
  'identity-service': 'CreatorRegistry',
  'asset-registry-service': 'AssetRegistry',
  'split-service': 'SplitRouter',
  'license-service': 'LicenseManager',
  'settlement-service': 'RoyaltyManager',
  'wallet-service': 'CreatorVault',
  'entitlement-service': 'EntitlementPass',
  'treasury-service': 'CreatorVault',
  'provenance-service': 'AssetRegistry',
};

async function getOrCreateVault(creatorUserId: number): Promise<any> {
  const existing = await CreatorVault.findOne({ where: { creatorUserId } });
  if (existing) return existing;
  return CreatorVault.create({ creatorUserId, stablecoin: DEFAULT_STABLECOIN, balanceMinor: 0 });
}

async function routeSettlement(assetId: number, amountMinor: number): Promise<{ recipientUserId: number; amountMinor: number }[]> {
  const splits = await SplitRule.findAll({ where: { assetId } });
  if (!splits.length) {
    const asset = await AssetRegistry.findByPk(assetId, { include: [{ association: 'creator' }] });
    const creatorUserId = (asset as any)?.creator?.userId;
    if (!creatorUserId) return [];
    return [{ recipientUserId: creatorUserId, amountMinor }];
  }

  const routed = splits.map((split: any) => ({
    recipientUserId: split.recipientUserId,
    amountMinor: Math.floor((amountMinor * split.bps) / 10000),
  }));
  const delta = amountMinor - routed.reduce((sum, r) => sum + r.amountMinor, 0);
  if (delta > 0 && routed[0]) routed[0].amountMinor += delta;
  return routed;
}

async function applySettlement(settlementType: string, payerUserId: number, assetId: number, amountMinor: number): Promise<any> {
  const settlement = await SettlementService.create({
    settlementType,
    payerUserId,
    assetId,
    amountMinor,
    stablecoin: DEFAULT_STABLECOIN,
  });

  const routed = await routeSettlement(assetId, amountMinor);
  for (const entry of routed) {
    const vault = await getOrCreateVault(entry.recipientUserId);
    await vault.increment('balanceMinor', { by: entry.amountMinor });
  }

  await ProvenanceService.create({
    assetId,
    eventType: `settlement.${settlementType}`,
    actorUserId: payerUserId,
    serviceName: 'settlement-service',
    contractName: 'RoyaltyManager',
  });

  return { settlement, routed };
}

router.get('/config', (_req: AuthRequest, res: Response) => {
  return res.json({
    principle: 'Blockchain is the settlement and rights layer, not the whole app.',
    offChain: ['content storage', 'analytics', 'feeds', 'ranking', 'private context', 'business logic'],
    onChainMirrored: ['creator registry', 'asset registry', 'split routing', 'license state', 'royalty rules', 'treasury vaults', 'entitlement records'],
    defaults: { stablecoin: DEFAULT_STABLECOIN, chain: DEFAULT_CHAIN, accountModel: 'embedded-wallet' },
    serviceContracts,
  });
});

router.post('/creators/register', async (req: AuthRequest, res: Response) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ error: 'walletAddress is required' });

    const existing = await CreatorRegistry.findOne({ where: { userId: req.user!.id } });
    const registry = existing
      ? await existing.update({ walletAddress, chain: DEFAULT_CHAIN, contractRef: 'CreatorRegistry' })
      : await CreatorRegistry.create({ userId: req.user!.id, walletAddress, chain: DEFAULT_CHAIN, contractRef: 'CreatorRegistry' });

    await getOrCreateVault(req.user!.id);

    return res.status(existing ? 200 : 201).json(registry);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/assets', async (req: AuthRequest, res: Response) => {
  try {
    const { contentRef, contentType, title, ownershipProof, provenanceHash, splits } = req.body;
    if (!contentRef || !contentType || !title) {
      return res.status(400).json({ error: 'contentRef, contentType, and title are required' });
    }

    const creator = await CreatorRegistry.findOne({ where: { userId: req.user!.id } });
    if (!creator) return res.status(400).json({ error: 'Creator is not registered' });

    const asset = await AssetRegistry.create({
      creatorId: creator.id,
      contentRef,
      contentType,
      title,
      ownershipProof,
      provenanceHash,
      contractRef: 'AssetRegistry',
    });

    const requestedSplits = Array.isArray(splits) ? splits : [{ recipientUserId: req.user!.id, bps: 10000 }];
    const totalBps = requestedSplits.reduce((sum: number, s: any) => sum + Number(s.bps || 0), 0);
    if (totalBps !== 10000) return res.status(400).json({ error: 'splits must total 10000 bps' });

    const splitRows = await Promise.all(
      requestedSplits.map((s: any) =>
        SplitRule.create({ assetId: asset.id, recipientUserId: s.recipientUserId, bps: Number(s.bps) })
      )
    );

    await ProvenanceService.create({
      assetId: asset.id,
      eventType: 'asset.registered',
      actorUserId: req.user!.id,
      serviceName: 'asset-registry-service',
      contractName: 'AssetRegistry',
      txRef: provenanceHash,
    });

    return res.status(201).json({ asset, splits: splitRows });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/tips', async (req: AuthRequest, res: Response) => {
  try {
    const { assetId, amountMinor } = req.body;
    if (!assetId || !amountMinor || Number(amountMinor) <= 0) {
      return res.status(400).json({ error: 'assetId and positive amountMinor are required' });
    }
    const result = await applySettlement('tip', req.user!.id, Number(assetId), Number(amountMinor));
    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/subscriptions', async (req: AuthRequest, res: Response) => {
  try {
    const { assetId, amountMinor, days = 30 } = req.body;
    if (!assetId || !amountMinor || Number(amountMinor) <= 0) {
      return res.status(400).json({ error: 'assetId and positive amountMinor are required' });
    }

    const result = await applySettlement('subscription', req.user!.id, Number(assetId), Number(amountMinor));
    const entitlement = await EntitlementPass.create({
      userId: req.user!.id,
      assetId: Number(assetId),
      passType: 'subscription',
      expiresAt: new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000),
    });
    return res.status(201).json({ ...result, entitlement });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/unlock', async (req: AuthRequest, res: Response) => {
  try {
    const { assetId, amountMinor } = req.body;
    if (!assetId || !amountMinor || Number(amountMinor) <= 0) {
      return res.status(400).json({ error: 'assetId and positive amountMinor are required' });
    }

    const result = await applySettlement('pay_to_unlock', req.user!.id, Number(assetId), Number(amountMinor));
    const entitlement = await EntitlementPass.create({
      userId: req.user!.id,
      assetId: Number(assetId),
      passType: 'unlock',
    });
    return res.status(201).json({ ...result, entitlement });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/licenses', async (req: AuthRequest, res: Response) => {
  try {
    const { assetId, amountMinor, licenseType } = req.body;
    if (!assetId || !amountMinor || !licenseType || Number(amountMinor) <= 0) {
      return res.status(400).json({ error: 'assetId, licenseType, and positive amountMinor are required' });
    }

    const result = await applySettlement('license', req.user!.id, Number(assetId), Number(amountMinor));
    const license = await LicenseManager.create({
      assetId: Number(assetId),
      licenseeUserId: req.user!.id,
      licenseType,
      amountMinor: Number(amountMinor),
      stablecoin: DEFAULT_STABLECOIN,
    });
    return res.status(201).json({ ...result, license });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/royalties/resale', async (req: AuthRequest, res: Response) => {
  try {
    const { assetId, resaleAmountMinor, royaltyBps } = req.body;
    if (!assetId || !resaleAmountMinor || !royaltyBps || Number(resaleAmountMinor) <= 0 || Number(royaltyBps) <= 0) {
      return res.status(400).json({ error: 'assetId, resaleAmountMinor, and royaltyBps are required' });
    }

    const royaltyAmountMinor = Math.floor((Number(resaleAmountMinor) * Number(royaltyBps)) / 10000);
    const result = await applySettlement('royalty', req.user!.id, Number(assetId), royaltyAmountMinor);
    const royalty = await RoyaltyManager.create({
      assetId: Number(assetId),
      resaleAmountMinor: Number(resaleAmountMinor),
      royaltyBps: Number(royaltyBps),
      royaltyAmountMinor,
      stablecoin: DEFAULT_STABLECOIN,
    });
    return res.status(201).json({ ...result, royalty });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/payouts', async (req: AuthRequest, res: Response) => {
  try {
    const { amountMinor } = req.body;
    if (!amountMinor || Number(amountMinor) <= 0) return res.status(400).json({ error: 'positive amountMinor is required' });
    const vault = await getOrCreateVault(req.user!.id);
    if (vault.balanceMinor < Number(amountMinor)) return res.status(400).json({ error: 'Insufficient vault balance' });
    await vault.decrement('balanceMinor', { by: Number(amountMinor) });
    await vault.reload();
    return res.status(201).json({ status: 'paid_out', stablecoin: DEFAULT_STABLECOIN, amountMinor: Number(amountMinor), vaultBalanceMinor: vault.balanceMinor });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/vaults/me', async (req: AuthRequest, res: Response) => {
  try {
    const vault = await getOrCreateVault(req.user!.id);
    return res.json(vault);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/entitlements/me', async (req: AuthRequest, res: Response) => {
  try {
    const rows = await EntitlementPass.findAll({ where: { userId: req.user!.id } });
    return res.json(rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
