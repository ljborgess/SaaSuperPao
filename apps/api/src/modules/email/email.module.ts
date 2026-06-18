import { Module, Global } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { EmailLog } from '@superpao/database'
import { EmailService } from './email.service'

@Global()
@Module({
  imports: [MikroOrmModule.forFeature([EmailLog])],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
