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
import { ReactNode, useState, useEffect } from 'react';
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
import { ChevronLeft, ChevronRight, Search, Inbox } from 'lucide-react';

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
    const [highlightedRow, setHighlightedRow] = useState<number | null>(null);

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

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const rows = table.getRowModel().rows;
            if (rows.length === 0) return;

            // Arrow Down - next row
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedRow(prev => {
                    if (prev === null) return 0;
                    return Math.min(prev + 1, rows.length - 1);
                });
            }
            // Arrow Up - previous row
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedRow(prev => {
                    if (prev === null) return 0;
                    return Math.max(prev - 1, 0);
                });
            }
            // Right Arrow - next page
            else if (e.key === 'ArrowRight' && e.ctrlKey) {
                e.preventDefault();
                if (table.getCanNextPage()) table.nextPage();
            }
            // Left Arrow - previous page
            else if (e.key === 'ArrowLeft' && e.ctrlKey) {
                e.preventDefault();
                if (table.getCanPreviousPage()) table.previousPage();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [table]);

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
                                table.getRowModel().rows.map((row, idx) => (
                                    <TableRow
                                        key={row.id}
                                        onMouseEnter={() => setHighlightedRow(idx)}
                                        onMouseLeave={() => setHighlightedRow(null)}
                                        className={`border-b border-slate-100 transition-all duration-150 ${
                                            highlightedRow === idx
                                                ? 'bg-slate-100 shadow-sm'
                                                : 'hover:bg-slate-50'
                                        }`}
                                    >
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
                                        className="px-4 py-12 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Inbox className="h-12 w-12 text-slate-200" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700">No results found</p>
                                                <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {table.getPageCount() > 1 && (
                    <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-slate-50">
                        <div className="text-xs text-slate-500">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} · {table.getFilteredRowModel().rows.length} {table.getFilteredRowModel().rows.length === 1 ? 'item' : 'items'}
                        </div>
                        <div className="flex items-center gap-2">
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
                    </div>
                )}
            </div>
        </div>
    );
}