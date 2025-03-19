export interface JenkinsJob {
  _class: string;
  name: string;
  color: string;
  property?: Array<{
    _class: string;
    parameterDefinitions?: Array<{_class: string, name: string}>;
  }>;
  hasParameters?:boolean;
  parameterDefinitions?: Array<{_class:string, name:string}>;
}

export interface JenkinsJobListResponse {
  jobs: JenkinsJob[];
}

export interface JekninsJobLastSuccessfulBuild{
  number: number;
  result: string;
  duration: number;
  timestamp: number;
}

export interface JenkinsJobLastFailedbuild extends JekninsJobLastSuccessfulBuild{
}

export interface JenkinsJobWithBuildResult extends JenkinsJob {
  lastSuccessfulBuild: JekninsJobLastSuccessfulBuild | null;
  lastFailedBuild: JenkinsJobLastFailedbuild | null;
}

