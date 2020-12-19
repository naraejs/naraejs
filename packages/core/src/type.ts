import { IHealthCheckResponse } from './connection-manager';

export interface INaraeCore {
  healthCheck(): Promise<IHealthCheckResponse>;
  readySignal(): Promise<void>;
}

export type Partial<T> = { [P in keyof T]?: T[P]; };
