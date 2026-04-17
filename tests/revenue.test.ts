process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/models';

let creatorToken: string;
let collaboratorToken: string;
let fanToken: string;
let creatorId: number;
let collaboratorId: number;
let assetId: number;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const creator = await request(app).post('/auth/register').send({ username: 'creator', email: 'creator@test.com', password: 'CreatorPass123!' });
  expect(creator.status).toBe(201);
  creatorToken = creator.body.token;
  creatorId = creator.body.user.id;

  const collaborator = await request(app).post('/auth/register').send({ username: 'collaborator', email: 'collab@test.com', password: 'CollabPass123!' });
  expect(collaborator.status).toBe(201);
  collaboratorToken = collaborator.body.token;
  collaboratorId = collaborator.body.user.id;

  const fan = await request(app).post('/auth/register').send({ username: 'fan', email: 'fan@test.com', password: 'FanPass123!' });
  expect(fan.status).toBe(201);
  fanToken = fan.body.token;

  await request(app).post('/revenue/creators/register').set('Authorization', `Bearer ${creatorToken}`).send({ walletAddress: 'embedded_creator_wallet' });
  await request(app).post('/revenue/creators/register').set('Authorization', `Bearer ${collaboratorToken}`).send({ walletAddress: 'embedded_collab_wallet' });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Creator Revenue Chain Layer', () => {
  it('exposes revenue config with settlement defaults', async () => {
    const res = await request(app).get('/revenue/config').set('Authorization', `Bearer ${creatorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.defaults.stablecoin).toBe('USDC');
    expect(res.body.defaults.chain).toBe('base');
    expect(res.body.serviceContracts['identity-service']).toBe('CreatorRegistry');
  });

  it('registers asset ownership/provenance and collaborator splits', async () => {
    const res = await request(app)
      .post('/revenue/assets')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        contentRef: 'ipfs://off-chain-content-ref',
        contentType: 'video/mp4',
        title: 'Revenue Challenge',
        ownershipProof: 'sig:creator',
        provenanceHash: 'tx:asset-1',
        splits: [
          { recipientUserId: creatorId, bps: 8000 },
          { recipientUserId: collaboratorId, bps: 2000 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.asset.contentRef).toBe('ipfs://off-chain-content-ref');
    expect(res.body.splits).toHaveLength(2);
    assetId = res.body.asset.id;
  });

  it('supports tips and routes split revenue into creator vaults', async () => {
    const tip = await request(app)
      .post('/revenue/tips')
      .set('Authorization', `Bearer ${fanToken}`)
      .send({ assetId, amountMinor: 1000 });
    expect(tip.status).toBe(201);
    expect(tip.body.routed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ recipientUserId: creatorId, amountMinor: 800 }),
        expect.objectContaining({ recipientUserId: collaboratorId, amountMinor: 200 }),
      ])
    );

    const creatorVault = await request(app).get('/revenue/vaults/me').set('Authorization', `Bearer ${creatorToken}`);
    const collaboratorVault = await request(app).get('/revenue/vaults/me').set('Authorization', `Bearer ${collaboratorToken}`);
    expect(creatorVault.body.balanceMinor).toBe(800);
    expect(collaboratorVault.body.balanceMinor).toBe(200);
  });

  it('supports subscriptions and pay-to-unlock entitlements', async () => {
    const sub = await request(app)
      .post('/revenue/subscriptions')
      .set('Authorization', `Bearer ${fanToken}`)
      .send({ assetId, amountMinor: 500, days: 15 });
    expect(sub.status).toBe(201);
    expect(sub.body.entitlement.passType).toBe('subscription');

    const unlock = await request(app)
      .post('/revenue/unlock')
      .set('Authorization', `Bearer ${fanToken}`)
      .send({ assetId, amountMinor: 300 });
    expect(unlock.status).toBe(201);
    expect(unlock.body.entitlement.passType).toBe('unlock');

    const entitlements = await request(app).get('/revenue/entitlements/me').set('Authorization', `Bearer ${fanToken}`);
    expect(entitlements.status).toBe(200);
    expect(entitlements.body.length).toBeGreaterThanOrEqual(2);
  });

  it('supports licensing, resale royalties, and direct creator payout', async () => {
    const license = await request(app)
      .post('/revenue/licenses')
      .set('Authorization', `Bearer ${fanToken}`)
      .send({ assetId, amountMinor: 2000, licenseType: 'commercial' });
    expect(license.status).toBe(201);
    expect(license.body.license.licenseType).toBe('commercial');

    const royalty = await request(app)
      .post('/revenue/royalties/resale')
      .set('Authorization', `Bearer ${fanToken}`)
      .send({ assetId, resaleAmountMinor: 10000, royaltyBps: 500 });
    expect(royalty.status).toBe(201);
    expect(royalty.body.royalty.royaltyAmountMinor).toBe(500);

    const payout = await request(app)
      .post('/revenue/payouts')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({ amountMinor: 1000 });
    expect(payout.status).toBe(201);
    expect(payout.body.status).toBe('paid_out');
    expect(payout.body.vaultBalanceMinor).toBeGreaterThanOrEqual(0);
  });
});
