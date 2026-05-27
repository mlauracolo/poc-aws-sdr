declare module 'typeorm' {
  interface SelectQueryBuilder<T> {
    subQuery(): SelectQueryBuilder<unknown>;
    select(selection: string): this;
    addSelect(selection: string, alias?: string): this;
    from(entity: new () => unknown, alias: string): this;
    where(condition: string | ((qb: SelectQueryBuilder<T>) => string), params?: Record<string, unknown>): this;
    groupBy(field: string): this;
    getQuery(): string;
    setParameters(params: Record<string, unknown>): this;
    orderBy(field: string, order?: 'ASC' | 'DESC'): this;
    take(limit: number): this;
    getMany(): Promise<T[]>;
    getOne(): Promise<T | null>;
  }

  export class DataSource {
    constructor(options: Record<string, unknown>);
    isInitialized: boolean;
    initialize(): Promise<void>;
    getRepository<T>(entity: new () => T): {
      find(): Promise<T[]>;
      save(entity: T): Promise<T>;
      createQueryBuilder(alias: string): SelectQueryBuilder<T>;
    };
  }

  export function Entity(options?: Record<string, unknown>): ClassDecorator;
  export function Column(options?: Record<string, unknown>): PropertyDecorator;
  export function PrimaryColumn(options?: Record<string, unknown>): PropertyDecorator;
}
