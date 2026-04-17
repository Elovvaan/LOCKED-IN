/**
 * Seed script: ensures at least one real SkillPost exists in the database.
 * Run with: npm run seed
 *
 * FOR DEVELOPMENT USE ONLY. Do not run against production databases.
 *
 * Creates a demo user (if not present) and one SkillPost with a publicly
 * accessible video URL so the mobile feed has content on first launch.
 *
 * The seed password can be overridden via the SEED_PASSWORD environment variable.
 */
import sequelize from './database';
import { User, SkillPost } from './models';
import bcrypt from 'bcryptjs';

const SEED_PASSWORD = process.env.SEED_PASSWORD || 'Seed1234!';

async function seed() {
  await sequelize.sync();

  // Find or create a seed user
  let user = await User.findOne({ where: { email: 'seed@lockedin.app' } });
  if (!user) {
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
    user = await User.create({
      username: 'lockedin_demo',
      email: 'seed@lockedin.app',
      passwordHash,
    });
    console.log('[seed] Created demo user:', user.username);
  } else {
    console.log('[seed] Demo user already exists:', user.username);
  }

  // Create a real SkillPost only if none exist
  const existingCount = await SkillPost.count();
  if (existingCount === 0) {
    const post = await SkillPost.create({
      userId: user.id,
      // Publicly accessible sample video (Big Buck Bunny – Creative Commons)
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
      title: 'Who has the sickest move?',
      caption: 'Drop your clip – let the crowd decide 🔥',
      category: 'general',
    });
    console.log('[seed] Created demo SkillPost id:', post.id, 'videoUrl:', post.videoUrl);
  } else {
    console.log(`[seed] ${existingCount} SkillPost(s) already exist – skipping seed.`);
  }

  await sequelize.close();
  console.log('[seed] Done.');
}

seed().catch((err) => {
  console.error('[seed] Error:', err);
  process.exit(1);
});
