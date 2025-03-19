import { Test, TestingModule } from '@nestjs/testing';
import { ArgocdController } from './argocd.controller';
import { ArgocdService } from './argocd.service';

describe('ArgocdController', () => {
  let controller: ArgocdController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArgocdController],
      providers: [ArgocdService],
    }).compile();

    controller = module.get<ArgocdController>(ArgocdController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
