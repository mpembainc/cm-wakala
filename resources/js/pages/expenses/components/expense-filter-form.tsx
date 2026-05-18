import React from 'react';
import FormInput from '../../../components/forms/form-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';

interface Filters {
    search: string;
    month: string; // m-Y format
}

interface Props {
    filters: Filters;
    onChange: (filters: Filters) => void;
}

export default function ExpenseFilterForm({ filters, onChange }: Props) {
    // Convert m-Y to YYYY-MM for input type="month"
    const getMonthInputValue = (mY: string) => {
        if (!mY) return '';
        const parts = mY.split('-');
        if (parts.length !== 2) return '';
        const month = parts[0].padStart(2, '0');
        const year = parts[1];
        return `${year}-${month}`;
    };

    // Convert YYYY-MM back to m-Y for backend
    const handleMonthChange = (val: string) => {
        if (!val) {
            onChange({ ...filters, month: '' });
            return;
        }
        const parts = val.split('-');
        if (parts.length !== 2) return;
        const year = parts[0];
        const month = parseInt(parts[1], 10).toString();
        onChange({ ...filters, month: `${month}-${year}` });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-4">
            <div className="md:col-span-6">
                <FormInput
                    placeholder="Tafuta..."
                    value={filters.search}
                    onChange={(e) => onChange({ ...filters, search: e.target.value })}
                />
            </div>
            
            <div className="md:col-span-6">
                <FormInput
                    type="month"
                    value={getMonthInputValue(filters.month)}
                    onChange={(e) => handleMonthChange(e.target.value)}
                />
            </div>
        </div>
    );
}
