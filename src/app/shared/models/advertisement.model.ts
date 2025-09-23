export enum AdvertisementStatus {
    /** Advertisement created, not yet validated or funded */
    DRAFT = 'draft',
    /** Advertisement waiting the transaction confirmation */
    PENDING = 'pending',
    /** Advertisement validated and with funds available */
    READY = 'ready',
    /** Failed to validate bank account or PIX key for receiving */
    BANK_FAILED = 'bank_failed',
    /** Failed to receive the expected deposit/funding */
    DEPOSIT_FAILED = 'deposit_failed',
    /** Advertisement closed (manually or by fund exhaustion) */
    CLOSED = 'closed',
    /** Advertisement paused by user action or moderation */
    DISABLED = 'disabled'
}

export interface Advertisement {
    id: string;
    seller_address: string;
    token: string;
    currency: string;
    price: bigint;  // Price in cents per Bitcoin (BRL cents per 1 BTC)
    total_amount: bigint;  // Total amount in sats
    available_amount: bigint;  // Available amount in sats
    min_amount: number;  // Minimum purchase amount in cents (BRL)
    max_amount: number;  // Maximum purchase amount in cents (BRL)
    transaction_id: string | null;  // ID of the funding transaction
    status: AdvertisementStatus;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}