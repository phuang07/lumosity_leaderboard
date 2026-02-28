import nodemailer from 'nodemailer'
import { config } from '@/lib/config'

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (!config.smtp.isConfigured) {
    return null
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    })
  }

  return transporter
}

export type SendPasswordResetEmailResult = {
  success: boolean
  error?: string
}

export async function sendPasswordResetEmail(
  to: string,
  resetLink: string
): Promise<SendPasswordResetEmailResult> {
  const transport = getTransporter()
  if (!transport) {
    return { success: false, error: 'Email service is not configured' }
  }

  try {
    await transport.sendMail({
      from: config.smtp.from,
      to,
      subject: `Reset your password - ${config.app.name}`,
      text: `You requested a password reset for your ${config.app.name} account.\n\nClick the link below to reset your password:\n\n${resetLink}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.\n\n— ${config.app.name}`,
      html: `
        <p>You requested a password reset for your ${config.app.name} account.</p>
        <p><a href="${resetLink}" style="color: #6366f1; font-weight: 600;">Reset your password</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${resetLink}</p>
        <p style="color: #6b7280; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        <p>— ${config.app.name}</p>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('[Email] Failed to send password reset:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}
