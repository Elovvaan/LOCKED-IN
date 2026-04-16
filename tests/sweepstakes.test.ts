process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/models';

let adminToken: string;
let entrantToken: string;
let campaignId: number;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const admin = await request(app).post('/auth/register').send({ username: 'sweep_admin', email: 'sweep_admin@test.com', password: 'Pass1234!' });
  adminToken = admin.body.token;

  const entrant = await request(app).post('/auth/register').send({ username: 'sweep_user', email: 'sweep_user@test.com', password: 'Pass1234!' });
  entrantToken = entrant.body.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Sweepstakes Campaign Layer', () => {
  it('requires official rules, eligibility, time window, prize details, and free AMOE', async () => {
    const now = new Date();
    const res = await request(app)
      .post('/sweepstakes/campaigns')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Missing fields campaign',
        startsAt: new Date(now.getTime() - 60000).toISOString(),
        endsAt: new Date(now.getTime() + 60000).toISOString(),
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('officialRules');
  });

  it('creates a compliant campaign with free AMOE and no-purchase rule', async () => {
    const now = new Date();
    const res = await request(app)
      .post('/sweepstakes/campaigns')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Spring Sweepstakes',
        officialRules: 'https://example.com/rules',
        eligibility: 'Open to legal residents 18+ where permitted by law.',
        startsAt: new Date(now.getTime() - 60000).toISOString(),
        endsAt: new Date(now.getTime() + 3600000).toISOString(),
        prizeDetails: 'One winner receives a LOCKED-IN prize pack.',
        freeAlternateMethod: 'Mail-in postcard request or direct free entry form.',
        purchaseRequired: false,
        paidActionsIncreaseOdds: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Spring Sweepstakes');
    expect(res.body.noPurchaseNecessary).toBe(true);
    expect(res.body.paidActionsIncreaseOdds).toBe(false);
    campaignId = res.body.id;
  });

  it('keeps commerce flow separate from chance-based campaign setup', async () => {
    const now = new Date();
    const res = await request(app)
      .post('/sweepstakes/campaigns')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Invalid mixed flow',
        officialRules: 'https://example.com/rules2',
        eligibility: 'Open to legal residents 18+ where permitted by law.',
        startsAt: new Date(now.getTime() - 60000).toISOString(),
        endsAt: new Date(now.getTime() + 3600000).toISOString(),
        prizeDetails: 'Prize',
        freeAlternateMethod: 'Direct free entry form.',
        amountMinor: 1000,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Commerce fields');
  });

  it('rejects paid actions and allows only approved free-entry sources', async () => {
    const paidAttempt = await request(app)
      .post(`/sweepstakes/campaigns/${campaignId}/entries`)
      .set('Authorization', `Bearer ${entrantToken}`)
      .send({ source: 'direct_free_entry', isPaid: true, purchaseAmount: 500 });

    expect(paidAttempt.status).toBe(400);
    expect(paidAttempt.body.error).toContain('Paid actions');

    const invalidSource = await request(app)
      .post(`/sweepstakes/campaigns/${campaignId}/entries`)
      .set('Authorization', `Bearer ${entrantToken}`)
      .send({ source: 'purchase_bonus' });

    expect(invalidSource.status).toBe(400);

    const freeEntry = await request(app)
      .post(`/sweepstakes/campaigns/${campaignId}/entries`)
      .set('Authorization', `Bearer ${entrantToken}`)
      .send({ source: 'engagement_milestone' });

    expect(freeEntry.status).toBe(201);
    expect(freeEntry.body.isFree).toBe(true);
  });

  it('draws winner with logging and fulfillment tracking, separate from commerce flow', async () => {
    const draw = await request(app)
      .post(`/sweepstakes/campaigns/${campaignId}/draw`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send();

    expect(draw.status).toBe(201);
    expect(draw.body.winnerLog.campaignId).toBe(campaignId);
    expect(draw.body.winnerLog.drawMethod).toBe('uniform_random');
    expect(draw.body.fulfillment.status).toBe('pending');

    const markFulfilled = await request(app)
      .patch(`/sweepstakes/campaigns/${campaignId}/fulfillment`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ notes: 'Prize shipped with tracking #LOCKED123' });

    expect(markFulfilled.status).toBe(200);
    expect(markFulfilled.body.status).toBe('fulfilled');

    const campaignDetail = await request(app)
      .get(`/sweepstakes/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(campaignDetail.status).toBe(200);
    expect(campaignDetail.body.winnerLogs.length).toBe(1);
    expect(campaignDetail.body.fulfillment.status).toBe('fulfilled');

    const audit = await request(app)
      .get(`/sweepstakes/campaigns/${campaignId}/audit-logs`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(audit.status).toBe(200);
    expect(audit.body.length).toBeGreaterThanOrEqual(4);
  });
});
