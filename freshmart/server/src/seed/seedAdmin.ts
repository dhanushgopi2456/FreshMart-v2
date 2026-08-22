import bcrypt from 'bcryptjs'
import { connectDB, disconnectDB } from '../config/database.js'
import { env, ROLES } from '../config/env.js'
import { User } from '../models/User.js'
import { logger } from '../utils/logger.js'

async function seedAdmin(): Promise<void> {
  if (!env.adminPassword) {
    logger.error('ADMIN_PASSWORD is not set in .env')
    process.exit(1)
  }

  await connectDB()

  const email = env.adminEmail.toLowerCase()
  const existing = await User.findOne({ email })

  if (existing) {
    existing.role = ROLES.ADMIN
    existing.isActive = true
    existing.passwordHash = await bcrypt.hash(env.adminPassword, 12)
    await existing.save()
    logger.info(`Admin updated: ${email}`)
  } else {
    await User.create({
      name: env.adminName,
      email,
      passwordHash: await bcrypt.hash(env.adminPassword, 12),
      role: ROLES.ADMIN,
      isVerified: true,
      isActive: true,
    })
    logger.info(`Admin created: ${email}`)
  }

  await disconnectDB()
  process.exit(0)
}

seedAdmin().catch(async (err) => {
  logger.error({ err }, 'seed:admin failed')
  await disconnectDB()
  process.exit(1)
})