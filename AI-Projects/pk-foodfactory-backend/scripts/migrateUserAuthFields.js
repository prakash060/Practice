/**
 * One-time migration: set authType and verified flags on existing users.
 * Run: node scripts/migrateUserAuthFields.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pk-foodfactory';
  await mongoose.connect(uri);
  const result = await User.updateMany(
    { authType: { $exists: false } },
    {
      $set: {
        authType: 'password',
        emailVerified: true,
        phoneVerified: true,
      },
    }
  );
  const legacy = await User.updateMany(
    { authType: 'password', emailVerified: { $ne: true } },
    { $set: { emailVerified: true, phoneVerified: true } }
  );
  console.log('Migration done:', { modified: result.modifiedCount, legacy: legacy.modifiedCount });
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
