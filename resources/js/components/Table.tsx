import React, { ReactNode } from 'react';

export interface Column<T> {
    header: string;
    key?: string;
    className?: string;
    render?: (item: T, index: number) => ReactNode;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    emptyMessage?: string;
}

export default function Table<T>({ data, columns, emptyMessage = 'Hakuna data inayopatikana' }: TableProps<T>) {
    return (
        <div className="overflow-x-auto w-full bg-white rounded-2xl shadow-xs border border-border">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr className="border-b border-border bg-gray-50/75">
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50/40 select-none ${column.className || ''}`}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center text-sm font-medium text-gray-400">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item, itemIndex) => (
                            <tr
                                key={itemIndex}
                                className="hover:bg-gray-50/50 transition-colors duration-150 ease-in-out"
                            >
                                {columns.map((column, colIndex) => {
                                    const value = column.key ? (item as any)[column.key] : undefined;
                                    return (
                                        <td
                                            key={colIndex}
                                            className={`px-6 py-3.5 text-sm text-gray-600 align-middle font-medium ${column.className || ''}`}
                                        >
                                            {column.render ? column.render(item, itemIndex) : value}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
