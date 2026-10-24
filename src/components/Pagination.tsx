import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages?: number | null;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
}) => {
  return (
    <div className="flex items-center justify-center gap-2 pt-10 pb-6">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage && currentPage <= 1}
        className="flex items-center gap-1 px-3 py-2 rounded text-xs font-semibold bg-background-surface border border-border-subtle text-neutral-300 hover:text-white hover:bg-background-elevated disabled:opacity-40 disabled:pointer-events-none transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Sebelumnya</span>
      </button>

      {/* Page Indicator */}
      <div className="px-4 py-2 rounded bg-background-elevated border border-border-subtle text-xs font-medium text-neutral-300">
        Halaman <span className="font-bold text-white">{currentPage}</span>
        {totalPages ? ` dari ${totalPages}` : ''}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="flex items-center gap-1 px-3 py-2 rounded text-xs font-semibold bg-background-surface border border-border-subtle text-neutral-300 hover:text-white hover:bg-background-elevated disabled:opacity-40 disabled:pointer-events-none transition-colors"
      >
        <span>Berikutnya</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

