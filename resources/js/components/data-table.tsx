import {
    ColumnDef,
    ColumnFiltersState,
    FilterFn,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import { ReactNode, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageSize?: number;
    searchPlaceholder?: string;
    searchColumn?: string;
    globalFilterFn?: FilterFn<TData>;
    filters?: ReactNode;
    // Add this prop to control visibility of the internal search bar
    showSearch?: boolean; 
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageSize = 10,
    searchPlaceholder = 'Search...',
    searchColumn,
    globalFilterFn,
    filters,
    showSearch = true, // Default to true
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn,
        state: { sorting, columnFilters, globalFilter },
        initialState: { pagination: { pageSize } },
    });

    return (
        <div className="space-y-4">
            {/* Only render this container if showSearch is true OR 
               if external filters are provided.
            */}
            {(showSearch || filters) && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2">
                    {showSearch && (
                        <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={(table.getState().globalFilter as string) ?? ""}
                                onChange={(event) =>
                                    table.setGlobalFilter(event.target.value)
                                }
                                className="w-full h-9 pl-10 pr-3 border border-gray-200 rounded text-sm"
                            />
                        </div>
                    )}
                    {filters && (
                        <div className="flex flex-wrap gap-2">
                            {filters}
                        </div>
                    )}
                </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-none">
                <div className="overflow-x-auto">
                    <Table className="w-full">
                        <TableHeader className="bg-slate-50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="border-b border-slate-50">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="px-4 py-3 text-xs font-semibold text-slate-600">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef.header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="px-4 py-3 text-sm text-slate-700">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="px-4 py-8 text-center text-sm text-slate-400"
                                    >
                                        No results found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {table.getPageCount() > 1 && (
                    <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-50">
                        {table.getCanPreviousPage() && (
                            <Button
                                size="sm"
                                className="h-8 w-8 p-0 bg-slate-900 hover:bg-slate-800 text-white"
                                onClick={() => table.previousPage()}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        )}
                        {table.getCanNextPage() && (
                            <Button
                                size="sm"
                                className="h-8 w-8 p-0 bg-slate-900 hover:bg-slate-800 text-white"
                                onClick={() => table.nextPage()}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}