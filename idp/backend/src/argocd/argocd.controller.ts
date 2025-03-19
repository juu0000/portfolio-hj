import { Controller, Get, HttpException, HttpStatus, Param, Post, Query, Sse } from '@nestjs/common';
import { ArgocdService } from './argocd.service';
import { interval, switchMap, from } from 'rxjs';

@Controller('argocd')
export class ArgocdController {
  constructor(private readonly argocdService: ArgocdService) {}

  @Get()
  async getArgocdApps(){
    return this.argocdService.getFilteredApplications();
  }

  @Get('/app/:appName')
  async getArgocdApp(@Param('appName') appName:string){
    return this.argocdService.getApplicationByName(appName);
  }

  @Get('/app/:appName/filtered')
  async getArgocdAppFiltered(@Param('appName') appName:string){
    return this.argocdService.getFilteredApplicationByName(appName);
  }

  @Post('/app/:appName/sync')
  async syncArgocdApplication(@Param('appName') appName: string){
    try {
      const result = await this.argocdService.syncApplication(appName);
      return result;
    } catch (error) {
      throw new HttpException(`ArgoCD sync 실행 실패`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
