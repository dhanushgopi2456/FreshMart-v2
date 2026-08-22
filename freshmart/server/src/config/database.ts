import dns from 'node:dns'
import mongoose from 'mongoose'
import { env } from './env.js'
import { logger } from '../utils/logger.js'
dns.setServers(['8.8.8.8', '1.1.1.1'])
export async function connectDB(): Promise<void> {
  const uri = env.mongodbUri
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 })
    logger.info({ uri: redactUri(uri) }, 'MongoDB connected')
  } catch (err) {
    logger.error({ err }, 'MongoDB connection failed')
    throw err
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect()
}

function redactUri(uri: string): string {
  try {
    const u = new URL(uri)
    if (u.password) u.password = '***'
    return u.href
  } catch {
    return uri
  }
}