export class FilteredApplicationByNameDto {
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
  };
  spec: {
    source: {
      repoURL: string;
      path: string;
      targetRevision: string;
    };
    destination: {
      namespace: string;
    };
    project: string;
    syncPolicy: {
      syncOptions: string[];
    };
  };
  status: {
    sync: {
      status: string;
      revision: string;
    };
    health: {
      status: string;
    };
    resources: Array<{
      group: string;
      version: string;
      kind: string;
      namespace: string;
      name: string;
      status: string;
      health: {
        status: string;
      };
      requiresPruning?: boolean;
    }>;
    conditions: Array<{
      type: string;
      message: string;
      lastTransitionTime: string;
    }>;
    operationState: {
      phase: string;
      message: string;
      // syncResult 필드를 추가합니다.
      syncResult?: {
        resources: Array<{
          group: string;
          version: string;
          kind: string;
          namespace: string;
          name: string;
          status: string;
          message?: string;
          hookPhase?: string;
          syncPhase?: string;
        }>;
        revision: string;
        source: {
          repoURL: string;
          path: string;
          targetRevision: string;
        };
      };
      startedAt: string;
      finishedAt: string;
    };
    reconciledAt: string;
    summary: {
      images: string[];
    };
    history: Array<{
      revision: string;
      deployedAt: string;
      initiatedBy: { username: string };
    }>;
  };
}
