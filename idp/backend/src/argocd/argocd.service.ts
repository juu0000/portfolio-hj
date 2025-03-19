import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ENV_ARGOCD_API_TOKEN_KEY, ENV_ARGOCD_URL_KEY, ENV_PROTOCOL_KEY } from 'src/common/const/key-env.const';
import { FilteredApplicationDto } from './dto/filtered-application.dto';
import { FilteredApplicationByNameDto } from './dto/filtered-application-by-name.dto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ArgocdService {
  private protocol: string;
  private url: string;
  private apiToken: string;
  private authHeader: string;
  private baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ){
    this.protocol = this.configService.get<string>(ENV_PROTOCOL_KEY);
    this.url = this.configService.get<string>(ENV_ARGOCD_URL_KEY);
    this.apiToken = this.configService.get<string>(ENV_ARGOCD_API_TOKEN_KEY);
    this.authHeader = `Bearer ${this.apiToken}`;
    this.baseUrl = `${this.protocol}://${this.url}`;
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

  async getAllArgocdAppLists(){
    if(process.env.DEMO_MODE ==='true'){
      const response = this.demoMode('getAllArgocdAppLists.json');
      return response.items;
    }

    const appListUrl = `${this.baseUrl}/api/v1/applications`;
    try {
      const response = await firstValueFrom(
        this.httpService.get(appListUrl, {
          headers:{
            Authorization: this.authHeader,
          },
        })
      );
      const data = response.data;
      return data.items;
    } catch (error) {
      throw new Error(`Failed to fetch deploys: ${error.message}`);
    }
  }


  async getFilteredApplications(){
    const applications = await this.getAllArgocdAppLists();

    return applications.map(app => {
      const filtered: FilteredApplicationDto = {
        name: app.metadata.name,
        project: app.spec.project,
        healthStatus: app.status?.health?.status ?? 'Unknown',
        syncStatus: app.status?.sync?.status ?? 'Unkown',
      };
      return filtered;
    })
  }


  async syncApplication(appName: string): Promise<any>{
    if(process.env.DEMO_MODE ==='true'){
      const response = this.demoMode('syncApplication.json');
      return response;
    }

    const syncUrl = `${this.baseUrl}/api/v1/applications/${appName}/sync`;
    const body ={}
    try {
      const response = await firstValueFrom(
        this.httpService.post(syncUrl, body,{
          headers:{
            Authorization: this.authHeader,
          },
        })
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to sync ${appName} application: ${error.message}`);
    }
  }


  async getApplicationByName(appName: string){
    if(process.env.DEMO_MODE ==='true'){
      const response = this.demoMode('getApplicationByName.json');
      return response;
    }

    const appUrl = `${this.baseUrl}/api/v1/applications/${appName}`;
    try {
      const response = await firstValueFrom(
        this.httpService.get(appUrl, {
          headers:{
            Authorization: this.authHeader,
          },
        })
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get application ${appName}: ${error.message}`);
    }
  }


  async getFilteredApplicationByName(appName: string): Promise<FilteredApplicationByNameDto> {
    const applicationByName = await this.getApplicationByName(appName);
  
    const filtered: FilteredApplicationByNameDto = {
      metadata: {
        name: applicationByName.metadata.name,
        namespace: applicationByName.metadata.namespace,
        uid: applicationByName.metadata.uid,
        creationTimestamp: applicationByName.metadata.creationTimestamp,
      },
      spec: {
        source: {
          repoURL: applicationByName.spec.source.repoURL,
          path: applicationByName.spec.source.path,
          targetRevision: applicationByName.spec.source.targetRevision,
        },
        destination: {
          namespace: applicationByName.spec.destination.namespace,
        },
        project: applicationByName.spec.project,
        syncPolicy: {
          syncOptions: applicationByName.spec.syncPolicy?.syncOptions || [],
        },
      },
      status: {
        sync: {
          status: applicationByName.status.sync.status,
          revision: applicationByName.status.sync.revision,
        },
        health: {
          status: applicationByName.status.health.status,
        },
        resources: applicationByName.status.resources.map((res) => ({
          group: res.group,
          version: res.version,
          kind: res.kind,
          namespace: res.namespace,
          name: res.name,
          status: res.status,
          health: { status: res.health.status },
          requiresPruning: res.requiresPruning,
        })),
        conditions: applicationByName.status.conditions?.map((cond) => ({
          type: cond.type,
          message: cond.message,
          lastTransitionTime: cond.lastTransitionTime,
        })) || [],
        operationState: {
          phase: applicationByName.status.operationState.phase,
          message: applicationByName.status.operationState.message,
          syncResult: applicationByName.status.operationState.syncResult
            ? {
                resources: applicationByName.status.operationState.syncResult.resources?.map((r) => ({
                  group: r.group,
                  version: r.version,
                  kind: r.kind,
                  namespace: r.namespace,
                  name: r.name,
                  status: r.status,
                  message: r.message,
                  hookPhase: r.hookPhase,
                  syncPhase: r.syncPhase,
                })) || [],
                revision: applicationByName.status.operationState.syncResult.revision,
                source: {
                  repoURL: applicationByName.status.operationState.syncResult.source.repoURL,
                  path: applicationByName.status.operationState.syncResult.source.path,
                  targetRevision: applicationByName.status.operationState.syncResult.source.targetRevision,
                },
              }
            : undefined,
          startedAt: applicationByName.status.operationState.startedAt,
          finishedAt: applicationByName.status.operationState.finishedAt,
        },
        reconciledAt: applicationByName.status.reconciledAt,
        summary: {
          images: applicationByName.status.summary.images,
        },
        history: applicationByName.status.history.map((entry) => ({
          revision: entry.revision,
          deployedAt: entry.deployedAt,
          initiatedBy: { username: entry.initiatedBy.username },
        })),
      },
    };
  
    return filtered;
  }
  
}
