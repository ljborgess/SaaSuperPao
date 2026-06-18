import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/core'
import { EmailLog, EmailStatus } from '@superpao/database'
import * as nodemailer from 'nodemailer'
import * as handlebars from 'handlebars'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private transporter: nodemailer.Transporter

  constructor(
    @InjectRepository(EmailLog) private readonly emailLogRepo: EntityRepository<EmailLog>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  private compileTemplate(templateName: string, context: Record<string, unknown>): string {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`)
    const templateSource = fs.readFileSync(templatePath, 'utf-8')
    const template = handlebars.compile(templateSource)
    return template(context)
  }

  private async send(to: string, subject: string, html: string, template: string): Promise<void> {
    const from = process.env.SMTP_FROM ?? 'SuperPão <noreply@superpao.com>'
    let status: EmailStatus = EmailStatus.SENT
    let error: string | undefined

    try {
      await this.transporter.sendMail({ from, to, subject, html })
      this.logger.log(`Email sent to ${to}: ${subject}`)
    } catch (err) {
      status = EmailStatus.FAILED
      error = (err as Error).message
      this.logger.error(`Failed to send email to ${to}: ${error}`)
    }

    const log = this.emailLogRepo.create({ to, subject, template, status, error, createdAt: new Date() })
    await this.emailLogRepo.getEntityManager().persistAndFlush(log)
  }

  async sendPasswordReset(email: string, token: string, name: string): Promise<void> {
    const resetUrl = `${process.env.WEB_URL ?? 'http://localhost:3000'}/reset-password?token=${token}`
    const html = this.compileTemplate('password-reset', { name, resetUrl })
    await this.send(email, 'Redefinição de senha - SuperPão', html, 'password-reset')
  }

  async sendWelcome(email: string, name: string): Promise<void> {
    const loginUrl = `${process.env.WEB_URL ?? 'http://localhost:3000'}/login`
    const html = this.compileTemplate('welcome', { name, loginUrl })
    await this.send(email, 'Bem-vindo ao SuperPão!', html, 'welcome')
  }

  async sendLowStockAlert(email: string, items: Array<{ name: string; currentStock: number; minStock: number; unit?: string }>): Promise<void> {
    const html = this.compileTemplate('low-stock', { items })
    await this.send(email, 'Alerta de Estoque Baixo - SuperPão', html, 'low-stock')
  }
}
