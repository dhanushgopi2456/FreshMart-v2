import nodemailer from 'nodemailer'
import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (!env.emailHost || !env.emailUser) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.emailHost,
      port: env.emailPort,
      secure: env.emailPort === 465,
      auth: { user: env.emailUser, pass: env.emailPassword },
    })
  }
  return transporter
}

export interface MailOptions {
  to: string
  subject: string
  html: string
}

export async function sendMail(opts: MailOptions): Promise<boolean> {
  const t = getTransporter()
  if (!t) {
    logger.warn({ to: opts.to, subject: opts.subject }, 'Mail transport not configured; skipping email')
    return false
  }
  try {
    await t.sendMail({ from: `"FreshMart" <${env.emailUser}>`, ...opts })
    return true
  } catch (err) {
    logger.error({ err }, 'Failed to send email')
    return false
  }
}

export function forgotPasswordEmail(resetUrl: string): string {
  return `
  <div style="font-family:Inter,sans-serif;background:#070b0a;padding:32px;border-radius:16px;max-width:480px;margin:auto;color:#e7e7e7">
    <h2 style="color:#00d46a;margin:0 0 8px">FreshMart</h2>
    <p>We received a request to reset your password.</p>
    <a href="${resetUrl}" style="display:inline-block;background:#00d46a;color:#04110a;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:700">Reset password</a>
    <p style="margin-top:20px;font-size:12px;color:#8a8a8a">This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
  </div>`
}

export function orderConfirmationEmail(name: string, orderNumber: string, total: number, trackingUrl: string): string {
  return `
  <div style="font-family:Inter,sans-serif;background:#070b0a;padding:32px;border-radius:16px;max-width:480px;margin:auto;color:#e7e7e7">
    <h2 style="color:#00d46a;margin:0 0 8px">Order Confirmed ✅</h2>
    <p>Hi ${name}, your order <strong>${orderNumber}</strong> for <strong>₹${total}</strong> is being prepared.</p>
    <a href="${trackingUrl}" style="display:inline-block;background:#00d46a;color:#04110a;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:700">Track order</a>
  </div>`
}