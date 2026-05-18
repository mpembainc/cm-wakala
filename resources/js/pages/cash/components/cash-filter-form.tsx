import React from 'react';
import { User } from '@/types';
import FormInput from '@/components/forms/form-input';
import FormSelect from '@/components/forms/form-select';
import { Button } from '@/components/ui/button';

interface Props {
    filters: {
        startDate: string;
        endDate: string;
        userId: string | number;
    };
    users: User[];
    canListUsers: boolean;
    onChange: (filters: { startDate: string; endDate: string; userId: string | number }) => void;
}

export default function CashFilterForm({ filters, users, canListUsers, onChange }: Props) {
    const handleFilterChange = (key: string, value: any) => {
        onChange({
            ...filters,
            [key]: value,
        });
    };

    return (
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-end">
            <FormInput
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                containerClassName="w-full sm:w-44"
            />
            <FormInput
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                containerClassName="w-full sm:w-44"
            />
            {canListUsers && users.length > 0 && (
                <FormSelect
                    placeholder="Operator"
                    value={filters.userId ? String(filters.userId) : 'all'}
                    onValueChange={(val) => handleFilterChange('userId', val === 'all' ? '' : val)}
                    options={[
                        { label: 'Wote (All Users)', value: 'all' },
                        ...users.map((u) => ({
                            label: u.name,
                            value: String(u.id),
                        })),
                    ]}
                    containerClassname="w-full sm:w-56"
                    className="w-full bg-white text-gray-700 font-semibold"
                />
            )}
            <Button
                type="button"
                variant="outline"
                onClick={() => onChange({ startDate: '', endDate: '', userId: '' })} >
                Futa Filter
            </Button>
        </div>
    );
}
