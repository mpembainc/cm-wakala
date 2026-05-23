import React, { useState, useEffect, useRef } from 'react';
import FormInput from '@/components/forms/form-input';
import { AccountSuggestion } from '@/types';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
    value: string;
    onChange: (value: string) => void;
    onSelectSuggestion: (suggestion: AccountSuggestion) => void;
    disabled?: boolean;
    error?: string;
}

export default function AccountAutocomplete({
    value,
    onChange,
    onSelectSuggestion,
    disabled,
    error,
}: Props) {
    const [suggestions, setSuggestions] = useState<AccountSuggestion[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searching, setSearching] = useState(false);
    const isSuggestionSelected = useRef(false);

    useEffect(() => {
        if (isSuggestionSelected.current) {
            isSuggestionSelected.current = false;
            return;
        }

        if (value.length < 2) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        const fetchSuggestions = async () => {
            try {
                setSearching(true);
                const res = await fetch(`/accounts/search?q=${value}`);
                if (res.ok) {
                    const results = await res.json();
                    setSuggestions(results);
                    setShowDropdown(true);
                }
            } catch (err) {
                console.error('Error fetching suggestions:', err);
            } finally {
                setSearching(false);
            }
        };

        const debounce = setTimeout(fetchSuggestions, 200);
        return () => clearTimeout(debounce);
    }, [value]);

    const handleSelect = (s: AccountSuggestion) => {
        isSuggestionSelected.current = true;
        onSelectSuggestion(s);
        setShowDropdown(false);
    };

    return (
        <div className="relative w-full">
            <div className="relative">
                <FormInput
                    id="accountNumber"
                    label="Nambari ya Account"
                    type="text"
                    placeholder="E.g., 07XXXXXXXX au akaunti"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    autoComplete="off"
                    error={error}
                />
                {searching && (
                    <span className="absolute right-3 top-9 flex h-4 w-4">
                        <Loader2 className="animate-spin h-4 w-4 text-gray-400" />
                    </span>
                )}
            </div>

            {/* Autocomplete Dropdown suggestions list */}
            {showDropdown && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                    {suggestions.map((s, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelect(s)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-b-0 cursor-pointer"
                        >
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-900">
                                    {s.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {s.number}
                                </span>
                            </div>
                            <Badge variant='secondary'>{s.networkName}</Badge>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
