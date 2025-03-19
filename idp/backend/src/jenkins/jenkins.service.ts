import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV_JENKINS_API_TOKEN_KEY, ENV_JENKINS_URL_KEY, ENV_JENKINS_USER_KEY, ENV_PROTOCOL_KEY } from '../common/const/key-env.const';
import { firstValueFrom, lastValueFrom, max } from 'rxjs';
import { JekninsJobLastSuccessfulBuild, JenkinsJob, JenkinsJobListResponse, JenkinsJobWithBuildResult } from './type/getAlljenkinsJobList.types';
import * as path from 'path';
import * as fs from 'fs';


@Injectable()
export class JenkinsService {
    private protocol: string;
    private url: string;
    private username: string;
    private apiToken: string;
    private authHeader: string;
    private baseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        
    ) {
        this.protocol = this.configService.get<string>(ENV_PROTOCOL_KEY);
        this.url = this.configService.get<string>(ENV_JENKINS_URL_KEY);
        this.username = this.configService.get<string>(ENV_JENKINS_USER_KEY);
        this.apiToken = this.configService.get<string>(ENV_JENKINS_API_TOKEN_KEY);
        this.authHeader = `Basic ${Buffer.from(`${this.username}:${this.apiToken}`).toString('base64')}`;
        this.baseUrl = `${this.protocol}://${this.url}`
      }

    demoMode(fileName: string) {
      const dummyDataPath = path.join(__dirname, 'dummy-data', fileName);
      try {
          const dummyData = fs.readFileSync(dummyDataPath, 'utf-8');
          const fileExt = path.extname(fileName).toLowerCase();
          
          if (fileExt === '.html') {
              return dummyData;
          }
          return JSON.parse(dummyData);
      } catch (error) {
          throw new Error(`Failed to read dummy data: ${error.message}`);
      }
    }

    async getAllJenkinsJobLists(): Promise<JenkinsJob[]> {
        if(process.env.DEMO_MODE ==='true'){
            const response = this.demoMode('getAllJenkinsJobLists.json');
            return response;
        }

        const jobListUrl = `${this.baseUrl}/api/json?tree=jobs[name,color,property[parameterDefinitions[name,defaultParameterValue[value],choices]]]`;

        try{
            const response = await firstValueFrom(
                this.httpService.get(jobListUrl, {
                    headers: {
                        Authorization: this.authHeader,
                    },
                })
            );

            const data: JenkinsJobListResponse = response.data;
            const jobs:JenkinsJob[] = data.jobs;

            jobs.forEach((job)=>{
                job.hasParameters = false;
                if (job.property && Array.isArray(job.property)){
                    for (const prop of job.property){
                        if ( prop.parameterDefinitions && Array.isArray(prop.parameterDefinitions) && prop.parameterDefinitions.length > 0) {
                            job.hasParameters = true;
                            job.parameterDefinitions = prop.parameterDefinitions;
                            break;
                        }
                    }
                }
            })
            const jobsWithBuildResults: JenkinsJobWithBuildResult[] = await Promise.all(
                jobs.map(async (job) =>{
                    const encodedJobName = encodeURIComponent(job.name);
                    const successfulBuildUrl = `${this.baseUrl}/job/${encodedJobName}/lastSuccessfulBuild/api/json?tree=number,result,duration,timestamp`;
                    const failedBuildUrl = `${this.baseUrl}/job/${encodedJobName}/lastFailedBuild/api/json?tree=number,result,duration,timestamp`;

                    let successfulBuildData: JekninsJobLastSuccessfulBuild = null;
                    try {
                        const buildResponse = await firstValueFrom(
                            this.httpService.get(successfulBuildUrl,{
                                headers: {
                                    Authorization: this.authHeader,
                                },
                            })
                        );
                        const buildData: JekninsJobLastSuccessfulBuild = buildResponse.data;
                        successfulBuildData = buildData;
                    } catch (error) {
                        successfulBuildData = null;
                    }

                    let failedBuildData: JekninsJobLastSuccessfulBuild = null;
                    try {
                        const buildResponse = await firstValueFrom(
                            this.httpService.get(failedBuildUrl,{
                                headers: {
                                    Authorization: this.authHeader,
                                },
                            })
                        );
                        const buildData: JekninsJobLastSuccessfulBuild = buildResponse.data;
                        failedBuildData = buildData;
                    } catch (error) {
                        failedBuildData = null;
                    }

                    return {
                        ...job,
                        lastSuccessfulBuild: successfulBuildData,
                        lastFailedBuild: failedBuildData,
                    };
                })
            );
            return jobsWithBuildResults;
        }catch(error){
            throw new Error(`Failed to fetch builds: ${error.message}`);
        }
    }

    async getJenkinsJobBuildResults(jobName: string){
        if(process.env.DEMO_MODE ==='true'){
          const response = this.demoMode('getJenkinsJobBuildResults.json');
          return response;
        }

        const encodedJobName = encodeURIComponent(jobName);
        const successfulBuildUrl = `${this.baseUrl}/job/${encodedJobName}/lastSuccessfulBuild/api/json?tree=number,result,duration,timestamp`;
        const failedBuildUrl = `${this.baseUrl}/job/${encodedJobName}/lastFailedBuild/api/json?tree=number,result,duration,timestamp`;

        try {

            const successfulBuild = firstValueFrom(
                this.httpService.get(successfulBuildUrl,{
                    headers:{
                        Authorization: this.authHeader,
                    }
                })
            ).then(response => response.data)
            .catch((error)=> null);

            const failedBuild = firstValueFrom(
                this.httpService.get(failedBuildUrl,{
                    headers:{
                        Authorization: this.authHeader,
                    }
                })
            ).then(response => response.data)
            .catch((error)=> null);

            const [successfulBuildData, failedBuildData] = await Promise.all([
                successfulBuild,
                failedBuild,
            ])

            return {
                successfulBuildData,
                failedBuildData
            }
        } catch (error) {
            throw new Error(`Failed to fetch job results: ${error.message}`);
        }
    }

    async getJenkinsJobByName(jobName: string){
        // DEMO_MODE
        if(process.env.DEMO_MODE ==='true'){
          const response = this.demoMode('getJenkinsJobByName.json');
          return response;
        }

        const encodedJobName = encodeURIComponent(jobName);
        const jobNameUrl = `${this.baseUrl}/job/${encodedJobName}/api/json`;

        try {
            const response = await firstValueFrom(
                this.httpService.get(jobNameUrl, {
                    headers: {
                        Authorization: this.authHeader,
                    },
                })
            );
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch job Name: ${error.message}`);
        }
    }

    async triggerJobBuild(jobName: string): Promise<any>{
        if(process.env.DEMO_MODE ==='true'){
          const response = this.demoMode('triggerJobBuild.json');
          return response;
        }

        const encodedJobName = encodeURIComponent(jobName);
        const buildUrl  = `${this.baseUrl}/job/${encodedJobName}/build`;

        try {
            const response = await firstValueFrom(this.httpService.post(buildUrl,{},{
                headers:{
                    Authorization: this.authHeader,
                }
            })
            );
            
            return response.data; 
        } catch (error) {
            throw new Error(`Failed to trigger build for ${jobName}: ${error.message}`);
        }
    }

    /**
     * TODO 차후 구현 예정
     * 현재는 default parameter값과 함께 동작함
     */
    async triggerJobBuildWithParameters(jobName: string, params: Record<string, any>): Promise<any>{
        // DEMO_MODE
        if(process.env.DEMO_MODE ==='true'){
          const response = this.demoMode('triggerJobBuild.json');
          return response;
        }

        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)){
            queryParams.append(key, value.toString());
        }
        const encodedJobName = encodeURIComponent(jobName);
        const buildUrl  = `${this.baseUrl}/job/${encodedJobName}/buildWithParameters?${queryParams.toString()}`;

        try {
            const response = await firstValueFrom(this.httpService.post(buildUrl,{},{
                headers:{
                    Authorization: this.authHeader,
                }
            })
            );

            return response.data; 
        } catch (error) {
            throw new Error(`Failed to trigger build with parameters for ${jobName}: ${error.message}`);
        }
    }

    async getBuildStatus(jobName: string, buildNumber: number){
      // DEMO_MODE
      if(process.env.DEMO_MODE ==='true'){
        const response = this.demoMode('getBuildStatus.json');
        return response;
      }

      const encodedJobName = encodeURIComponent(jobName);
      const buildUrl = `${this.baseUrl}/job/${encodedJobName}/${buildNumber}/wfapi/describe`;

      try {
          const response = await firstValueFrom(this.httpService.get(buildUrl,{
              headers:{
                  Authorization: this.authHeader,
                  }
              })
          );
          return response.data;
      } catch (error) {
          throw new Error(`Failed to get build status for ${jobName} build ${buildNumber}: ${error.message}`);
      }
    }

    async getBuildHistory(jobName: string){
      // DEMO_MODE
      if(process.env.DEMO_MODE ==='true'){
        const response = this.demoMode('getBuildHistory.json');
        return response;
      }

      const encodedJobName = encodeURIComponent(jobName);
      const buildUrl = `${this.baseUrl}/job/${encodedJobName}/wfapi/runs`;

      try {
          const response = await firstValueFrom(this.httpService.get(buildUrl,{
              headers:{
                  Authorization: this.authHeader,
                  }
              })
          );
          return response.data;
      } catch (error) {
          throw new Error(`Failed to get build run history for ${jobName} : ${error.message}`);
      }
    }

    async getBuildContextLog(jobName: string, buildNumber: number){
      // DEMO_MODE
      if(process.env.DEMO_MODE ==='true'){
        const response = this.demoMode('getBuildContextLog.html');
        return response;
      }

      const encodedJobName = encodeURIComponent(jobName);
      const buildUrl = `${this.baseUrl}/job/${encodedJobName}/${buildNumber}/consoleText`;

      try {
          const response = await firstValueFrom(this.httpService.get(buildUrl,{
              headers:{
                  Authorization: this.authHeader,
                  }
              })
          );
          return response.data;
      } catch (error) {
          throw new Error(`Failed to get build log for ${jobName} build Number ${buildNumber}: ${error.message}`);
      }
    }
}
