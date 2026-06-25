// ops/domain/entities/route.entity.ts
export class Route {
  constructor(
    public readonly id: string,
    public readonly associationId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly coopFareId: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: {
    associationId: string;
    name: string;
    description?: string;
    coopFareId: string;
  }): Route {
    return new Route(
      crypto.randomUUID(),
      data.associationId,
      data.name,
      data.description ?? null,
      data.coopFareId,
      true, // isActive: true por defecto
      new Date(),
      new Date(),
    );
  }
}
