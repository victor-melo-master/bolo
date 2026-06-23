export class Wallet {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly balance: number,          // centavos
    public readonly debtBalance: number,      // centavos
    public readonly creditUsed: boolean,
    public readonly currency: string,
    public readonly lastTransactionAt: Date | null,
    public readonly version: number,          // OCC
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(userId: string, currency: string = 'USD'): Wallet {
    return new Wallet(
      crypto.randomUUID(),
      userId,
      0,
      0,
      false,
      currency,
      null,
      1,
      new Date(),
      new Date(),
    );
  }
}
