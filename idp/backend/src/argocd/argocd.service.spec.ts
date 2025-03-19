import { Test, TestingModule } from '@nestjs/testing';
import { ArgocdService } from './argocd.service';

describe('ArgocdService', () => {
  let service: ArgocdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArgocdService],
    }).compile();

    service = module.get<ArgocdService>(ArgocdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
