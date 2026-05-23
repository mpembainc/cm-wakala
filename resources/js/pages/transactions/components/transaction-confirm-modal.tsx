import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatCurrency } from '@/utils';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: {
        accountNumber: string;
        accountName: string;
        fee: string;
        customer: string;
    };
    transactionType: 'KUWEKA' | 'KUTOA' | 'FLOAT' | '';
    displayAmount: string;
    networkName?: string;
    onConfirm: () => void;
}

export default function TransactionConfirmModal({
    open,
    onOpenChange,
    data,
    transactionType,
    displayAmount,
    networkName,
    onConfirm,
}: Props) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
                        Thibitisha Maelezo ya Muamala
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 pt-2 space-y-3">
                        <p className="text-xs text-gray-500 font-semibold tracking-wider">
                            Hakikisha taarifa zote zifuatazo ni sahihi kabla ya kusajili muamala:
                        </p>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/80 text-sm space-y-2.5">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-semibold">Aina ya Muamala:</span>
                                <span className={`font-bold px-2.5 py-0.5 rounded-md text-[11px] uppercase tracking-wider ${
                                    transactionType === 'KUWEKA' 
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                                        : transactionType === 'KUTOA'
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200/50'
                                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                                }`}>
                                    {transactionType === 'KUWEKA' && 'KUWEKA (DEPOSIT)'}
                                    {transactionType === 'KUTOA' && 'KUTOA (WITHDRAWAL)'}
                                    {transactionType === 'FLOAT' && 'FLOAT PURCHASE'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-100 pt-2.5">
                                <span className="text-gray-500 font-semibold">Nambari ya Akaunti:</span>
                                <span className="font-bold text-gray-900">{data.accountNumber}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-semibold">Jina la Akaunti:</span>
                                <span className="font-bold text-gray-900">{data.accountName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-semibold">Mtandao (Network):</span>
                                <span className="font-bold text-gray-900">{networkName?.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-100">
                                <span className="text-gray-500 font-semibold">Kiasi (Amount):</span>
                                <span className="font-extrabold text-base text-gray-900">
                                    {formatCurrency(Number(displayAmount || 0))}
                                </span>
                            </div>
                            {Number(data.fee) > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-semibold">Ada ya Huduma (Fee):</span>
                                    <span className="font-bold text-gray-900">{formatCurrency(Number(data.fee))}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center border-t border-gray-100">
                                <span className="text-gray-500 font-semibold">Aliyefanya Muamala:</span>
                                <span className="font-bold text-gray-900">{data.customer || data.accountName}</span>
                            </div>
                        </div>
                        <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-100/50 p-2.5 rounded-lg">
                            {transactionType === 'KUWEKA' 
                                ? '* Hakikisha umepokea kiasi cha float kutoka kwa mteja kabla ya kuthibitisha.'
                                : '* Hakikisha umetoa kiasi cha fedha taslimu kwa mteja kabla ya kuthibitisha.'
                            }
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel>Ghairi (Cancel)</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs">
                        Thibitisha (Confirm)
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
