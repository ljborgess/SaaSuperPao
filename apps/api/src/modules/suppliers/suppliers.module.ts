import { Module } from '@nestjs/common'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { Supplier } from '@superpao/database'
import { SuppliersController } from './suppliers.controller'
import { SuppliersService } from './suppliers.service'

@Module({
  imports: [MikroOrmModule.forFeature([Supplier])],
  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SuppliersModule {}
