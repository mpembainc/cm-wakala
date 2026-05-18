export interface CashTransaction {
    id: number;
    amount: number;
    transactionId: number | null;
    reference: string | null;
    remark: string;
    createdAt: string;
    createdBy: string;
}
