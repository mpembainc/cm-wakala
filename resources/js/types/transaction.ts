export interface Transaction {
    id: number;
    network: string;
    networkId: number;
    accountNumber: string;
    accountName: string;
    amount: number;
    customer: string;
    commission: number;
    fee: number;
    createdAt: string;
    createdBy: string;
}
