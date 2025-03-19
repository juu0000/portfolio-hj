import { Module } from '@nestjs/common';
import { ArgocdService } from './argocd.service';
import { ArgocdController } from './argocd.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports:[HttpModule],
  controllers: [ArgocdController],
  providers: [ArgocdService],
})
export class ArgocdModule {}
