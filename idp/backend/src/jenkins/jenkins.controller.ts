import { Controller, Post,Get, Param, Body, Sse, Query } from '@nestjs/common';
import { JenkinsService } from './jenkins.service';
import { Observable, switchMap, interval, from, map } from 'rxjs';

@Controller('jenkins')
export class JenkinsController {
  constructor(private readonly jenkinsService: JenkinsService) {}
  
    @Get()
    async getJenkinsJobs() {
      return this.jenkinsService.getAllJenkinsJobLists();
    }

    @Get(':jobName')
    async getJenkinsJob(@Param('jobName')jobName: string){
      return this.jenkinsService.getJenkinsJobByName(jobName);
    }

    @Get('job/:jobName/build/result')
    async getJenkinsBuildResult(@Param('jobName')jobName: string){
      return this.jenkinsService.getJenkinsJobBuildResults(jobName);
    }

    @Get('job/:jobName/build/:buildNumber/status')
    async getJenkinsBuildStatus(@Param('jobName') jobName: string, @Param('buildNumber') buildNumber: number){
      return this.jenkinsService.getBuildStatus(jobName,buildNumber);
    }

    @Get('job/:jobName/build/history')
    async getJenkinsBuildHistory(@Param('jobName') jobName: string){
      return this.jenkinsService.getBuildHistory(jobName);
    }

    @Get('job/:jobName/build/:buildNumber/log')
    async getJenkinsBuildLog(@Param('jobName') jobName: string, @Param('buildNumber') buildNumber: number){
      return this.jenkinsService.getBuildContextLog(jobName,buildNumber);
    }

    @Post('job/:jobName/build')
    async triggerBuild(@Param('jobName') jobName: string): Promise<{message: string}> {
      await this.jenkinsService.triggerJobBuild(jobName);
      return { message: `Build triggered for ${jobName}` };
    }

    @Post('job/:jobName/buildWithParameters')
    async triggerBuildWithParameters(
      @Param('jobName') jobName: string,
      @Body() params: Record<string, any>
    ): Promise<{message: string}> {
      await this.jenkinsService.triggerJobBuildWithParameters(jobName, params);
      return { message: `Build with parameters triggered for ${jobName}` };
    }

    // SSE 엔드포인트: 현재 진행 중인 빌드 상태 스트리밍
    // 예: GET /jenkins/job/status?jobName=Test%20Workflow&buildNumber=16
    @Sse('/job/status')
    getBuildStatus(
      @Query('jobName') jobName?: string,
      @Query('buildNumber') buildNumber?: string
    ): Observable<MessageEvent>{
      // queyr 파라미터가 없으면 기본값 사용
      const actualJobName = jobName || 'Test workflow';
      const actualBuildNumber = buildNumber ? parseInt(buildNumber, 10): 16;

      // 매 5초마다 service의 getBuildStatus 호출
      return interval(5000).pipe(
        switchMap(()=> from(this.jenkinsService.getBuildStatus(actualJobName, actualBuildNumber))),
        map(data => ({data} as MessageEvent<any>))
      );
    }

    // SSE 엔드포인트: 현재 진행 중인 빌드 로그 스트리밍
    // 예: GET /jenkins/job/log?jobName=Test%20Workflow&buildNumber=16
    @Sse('/job/log')
    getBuildLog(
      @Query('jobName') jobName?: string,
      @Query('buildNumber') buildNumber?: string
    ): Observable<MessageEvent>{
      // queyr 파라미터가 없으면 기본값 사용
      const actualJobName = jobName || 'Test workflow';
      const actualBuildNumber = buildNumber ? parseInt(buildNumber, 10): 16;

      // 매 5초마다 service의 getBuildContextLog 호출
      return interval(5000).pipe(
        switchMap(()=> from(this.jenkinsService.getBuildContextLog(actualJobName, actualBuildNumber))),
        map(data => ({data} as MessageEvent<any>))
      );
    }
  }
