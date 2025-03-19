import { Module } from '@nestjs/common';
import { JenkinsService } from './jenkins.service';
import { JenkinsController } from './jenkins.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports:[HttpModule],
    controllers: [JenkinsController],
    providers: [JenkinsService],
})
export class JenkinsModule {}
