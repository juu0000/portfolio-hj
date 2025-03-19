import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { JenkinsModule } from './jenkins/jenkins.module';
import { ArgocdModule } from './argocd/argocd.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
        envFilePath: '.env',
        isGlobal: true,
        
    }),
    JenkinsModule,
    ArgocdModule,
    HealthModule,
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
