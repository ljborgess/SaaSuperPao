import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Client } from '@superpao/database'
import { ClientsController } from './clients.controller'
import { ClientsService } from './clients.service'

@Module({
  imports: [MikroOrmModule.forFeature([Client])],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
