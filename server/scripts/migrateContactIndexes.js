/*
  Migration: Align user contact fields (email/phone) with new auth flow

  - Unset email/phone when they are null/empty string so they don't collide
    with unique constraints
  - Drop legacy unique indexes (email_1, phone_1)
  - Create new partial unique indexes that only apply when the field exists

  Usage:
    NODE_ENV=development node scripts/migrateContactIndexes.js
    or via npm script: npm run migrate:indexes
*/

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not set in environment. Aborting.');
    process.exit(1);
  }

  console.log('🔧 Starting contact index migration...');
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 15000,
  });

  const db = mongoose.connection.db;
  const users = db.collection('users');

  // 1) Clean bad values so fields are actually absent
  console.log('🧹 Cleaning null/empty email/phone values...');
  const cleanRes1 = await users.updateMany({ email: { $in: [null, ''] } }, { $unset: { email: '' } });
  const cleanRes2 = await users.updateMany({ phone: { $in: [null, ''] } }, { $unset: { phone: '' } });
  console.log(`   - Email cleaned: ${cleanRes1.modifiedCount}`);
  console.log(`   - Phone cleaned: ${cleanRes2.modifiedCount}`);

  // 2) Drop legacy indexes if present
  console.log('📉 Dropping legacy indexes if they exist...');
  const idx = await users.indexes();
  const existing = idx.map(i => i.name);
  const toDrop = ['email_1', 'phone_1'];
  for (const name of toDrop) {
    if (existing.includes(name)) {
      try {
        await users.dropIndex(name);
        console.log(`   - Dropped index: ${name}`);
      } catch (e) {
        console.warn(`   - Could not drop index ${name}: ${e.message}`);
      }
    }
  }

  // 3) Create partial unique indexes
  console.log('📈 Creating partial unique indexes...');
  try {
    await users.createIndex(
      { email: 1 },
      { unique: true, partialFilterExpression: { email: { $exists: true } }, name: 'email_unique_if_present' }
    );
    console.log('   - Created index: email_unique_if_present');
  } catch (e) {
    console.warn(`   - Could not create email index: ${e.message}`);
  }

  try {
    await users.createIndex(
      { phone: 1 },
      { unique: true, partialFilterExpression: { phone: { $exists: true } }, name: 'phone_unique_if_present' }
    );
    console.log('   - Created index: phone_unique_if_present');
  } catch (e) {
    console.warn(`   - Could not create phone index: ${e.message}`);
  }

  console.log('✅ Migration complete.');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});


