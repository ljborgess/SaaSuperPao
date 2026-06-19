import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { AiService } from './ai.service'
import type { ChatRequest } from '@superpao/shared-types'

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly service: AiService) {}

  @Post('chat')
  chat(@Body() body: ChatRequest) {
    return this.service.chat(body.message, body.history ?? [], body.provider)
  }
}
