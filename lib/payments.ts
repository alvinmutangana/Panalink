export type ChargeInput = { orderId: string; amount: number; phone: string };
export type ChargeResult = { status: "paid" | "failed"; reference: string };

export interface PaymentProvider {
  name: string;
  charge(input: ChargeInput): Promise<ChargeResult>;
}

// Rwandan mobile numbers: 078/079 (MTN), 072/073 (Airtel)
export const RW_PHONE = /^07[2389]\d{7}$/;

const mockProvider: PaymentProvider = {
  name: "mock",
  async charge({ orderId, phone }) {
    await new Promise((r) => setTimeout(r, 800)); // pretend to wait for the phone prompt
    const reference = `MOCK-${orderId.slice(0, 8)}-${Date.now()}`;
    return { status: phone.endsWith("000") ? "failed" : "paid", reference };
  },
};

export function getProvider(): PaymentProvider {
  return mockProvider;
}
