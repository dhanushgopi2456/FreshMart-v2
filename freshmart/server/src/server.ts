import app from './app.js'
import { connectDB } from './config/database.js'
import { env } from './config/env.js'
import { logger } from './utils/logger.js'

async function bootstrap(): Promise<void> {
  try {
    await connectDB()
    app.listen(env.port, () => {
      logger.info({ port: env.port, env: env.nodeEnv }, 'FreshMart API ready')
    })
  } catch (err) {
    logger.error({ err }, 'Failed to start server')
    process.exit(1)
  }
}

bootstrap()

process.on('SIGTERM', () => {
  logger.info('Shutting down')
  process.exit(0)
})