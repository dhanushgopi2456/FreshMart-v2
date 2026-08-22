declare module 'express-pino-logger' {
  import { RequestHandler } from 'express'
  export default function pinoHttp(opts?: { logger?: unknown }): RequestHandler
}