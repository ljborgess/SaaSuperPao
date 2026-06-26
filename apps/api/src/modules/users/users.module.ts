import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { User } from '@superpao/database'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { AuditModule } from '../audit/audit.module'

@Module({
  imports: [MikroOrmModule.forFeature([User]), AuditModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
