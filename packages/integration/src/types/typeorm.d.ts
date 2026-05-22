declare module 'typeorm' {
  export class DataSource {
    constructor(options: Record<string, unknown>);
    isInitialized: boolean;
    initialize(): Promise<void>;
    getRepository<T>(entity: new () => T): {
      find(): Promise<T[]>;
    };
  }

  export function Entity(options?: Record<string, unknown>): ClassDecorator;
  export function Column(options?: Record<string, unknown>): PropertyDecorator;
  export function PrimaryColumn(options?: Record<string, unknown>): PropertyDecorator;
}
