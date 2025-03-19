import { Test, TestingModule } from '@nestjs/testing';
import { JenkinsController } from './jenkins.controller';
import { JenkinsService } from './jenkins.service';

describe('JenkinsController', () => {
  let controller: JenkinsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JenkinsController],
      providers: [JenkinsService],
    }).compile();

    controller = module.get<JenkinsController>(JenkinsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
