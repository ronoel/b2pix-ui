export enum BuyStatus {
    /** Buy created, waiting for payment */
    Pending = 'Pending',
    /** Payment received, waiting for crypto transfer */
    Paid = 'Paid',
    /** Crypto transfer completed successfully */
    Completed = 'Completed',
    /** Buy cancelled by buyer or seller */
    Cancelled = 'Cancelled',
    /** Buy expired without payment */
    Expired = 'Expired',
    /** Dispute opened, waiting for moderator intervention */
    InDispute = 'InDispute',
    /** Dispute resolved in favor of buyer (refund) */
    DisputeResolvedBuyer = 'DisputeResolvedBuyer',
    /** Dispute resolved in favor of seller (crypto released) */
    DisputeResolvedSeller = 'DisputeResolvedSeller'
}

export interface Buy {
    id: string;
    advertisement_id: string;
    amount: string;
    price: string;
    fee: string;
    total_fiat_amount: string;
    address_buy: string;
    pix_key: string;
    status: BuyStatus;
    expires_at: string;
    created_at: string;
    updated_at: string;
}