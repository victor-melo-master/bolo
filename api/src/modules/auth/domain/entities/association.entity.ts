export class Association {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly rif: string,
    public readonly address: string | null,
    public readonly phone: string | null,
    public readonly adminId: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    data: Omit<Association, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  ): Association {
    return new Association(
      data.id ?? crypto.randomUUID(),
      data.name,
      data.rif,
      data.address ?? null,
      data.phone ?? null,
      data.adminId ?? null,
      data.isActive ?? true,
      new Date(),
      new Date(),
    );
  }
}
