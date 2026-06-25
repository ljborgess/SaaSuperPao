import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { NotaFiscal, Client, User } from '@superpao/database'
import { NotaFiscalController } from './nota-fiscal.controller'
import { NotaFiscalService } from './nota-fiscal.service'

@Module({
  imports: [MikroOrmModule.forFeature([NotaFiscal, Client, User])],
  controllers: [NotaFiscalController],
  providers: [NotaFiscalService],
})
export class NotaFiscalModule {}
