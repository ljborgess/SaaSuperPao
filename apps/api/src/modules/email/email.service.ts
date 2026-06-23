import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@mikro-orm/nestjs'
import { EntityRepository } from '@mikro-orm/core'
import { EmailLog, EmailStatus } from '@superpao/database'
import * as nodemailer from 'nodemailer'
import * as handlebars from 'handlebars'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name)
  private transporter: nodemailer.Transporter
  private readonly templateCache = new Map<string, handlebars.TemplateDelegate>()

  constructor(
    @InjectRepository(EmailLog) private readonly emailLogRepo: EntityRepository<EmailLog>,
  ) {
    this.transporter = nodemailer.createTransport({
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async onModuleInit() {
    try {
      await this.transporter.verify()
      this.logger.log('SMTP connection verified successfully')
    } catch (err) {
      this.logger.warn(`SMTP connection failed: ${(err as Error).message}`)
    }
  }

  private compileTemplate(templateName: string, context: Record<string, unknown>): string {
    if (!this.templateCache.has(templateName)) {
      const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`)
      const source = fs.readFileSync(templatePath, 'utf-8')
      this.templateCache.set(templateName, handlebars.compile(source))
    }
    return this.templateCache.get(templateName)!(context)
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
    const resetUrl = `${process.env.WEB_URL ?? 'http://localhost:3000'}/reset-password#token=${token}`
    const year = new Date().getFullYear()
    const html = this.compileTemplate('password-reset', { name, resetUrl, year })
    await this.send(email, 'Redefinição de senha - SuperPão', html, 'password-reset')
  }

  async sendWelcome(email: string, name: string): Promise<void> {
    const loginUrl = `${process.env.WEB_URL ?? 'http://localhost:3000'}/login`
    const year = new Date().getFullYear()
    const html = this.compileTemplate('welcome', { name, loginUrl, year })
    await this.send(email, 'Bem-vindo ao SuperPão!', html, 'welcome')
  }

  async sendLowStockAlert(email: string, items: Array<{ name: string; currentStock: number; minStock: number; unit?: string }>): Promise<void> {
    const year = new Date().getFullYear()
    const html = this.compileTemplate('low-stock', { items, year })
    await this.send(email, 'Alerta de Estoque Baixo - SuperPão', html, 'low-stock')
  }
}
