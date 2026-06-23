export type DriverRequestStatus = 'pending' | 'approved' | 'rejected';

export class DriverRequest {
  constructor(
    public readonly id: string,
    public readonly driverId: string,
    public readonly associationId: string,
    public readonly status: DriverRequestStatus,
    public readonly documentsUrls: Record<string, any> | null,
    public readonly rejectionReason: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: Omit<DriverRequest, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): DriverRequest {
    return new DriverRequest(
      data.id ?? crypto.randomUUID(),
      data.driverId,
      data.associationId,
      data.status ?? 'pending',
      data.documentsUrls ?? null,
      data.rejectionReason ?? null,
      new Date(),
      new Date(),
    );
  }
}
