export interface Network {
    id: number;
    name: string;
    balance: number;
}

export interface AccountSuggestion {
    number: string;
    name: string;
    networkId: number;
    networkName: string;
}