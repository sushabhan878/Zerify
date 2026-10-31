'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface CreatorPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export default function CreatorPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: CreatorPaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers array with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 border-t border-white/10 light:border-slate-200/80 text-xs">
      {/* Left: Results Counter & Page Size Selector */}
      <div className="flex items-center gap-3 text-slate-400 light:text-slate-600">
        <div>
          Showing <strong className="text-white light:text-slate-900 font-bold">{startItem}–{endItem}</strong> of{' '}
          <strong className="text-white light:text-slate-900 font-bold">{totalItems}</strong> creators
        </div>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-white/10 light:border-slate-200">
            <span className="text-[11px] text-slate-500">Per page:</span>
            {[8, 10, 12].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onPageSizeChange(size)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors ${
                  pageSize === size
                    ? 'bg-purple-500/20 light:bg-purple-100 text-purple-200 light:text-purple-700 border border-purple-500/30 light:border-purple-300'
                    : 'text-slate-500 hover:text-slate-300 light:hover:text-slate-900'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* First Page */}
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="First Page"
            className="p-2 rounded-xl bg-slate-900 light:bg-white border border-white/10 light:border-slate-200/80 text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:border-purple-500/30 light:shadow-sm disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Previous Page"
            className="p-2 rounded-xl bg-slate-900 light:bg-white border border-white/10 light:border-slate-200/80 text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:border-purple-500/30 light:shadow-sm disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Number Buttons */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, idx) => {
              if (page === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-2 py-1 text-slate-500 text-xs select-none">
                    ...
                  </span>
                );
              }

              const pageNum = Number(page);
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[34px] h-8 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center ${
                    isActive
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-950/50 keep-white'
                      : 'bg-slate-900 light:bg-white border border-white/10 light:border-slate-200/80 text-slate-400 light:text-slate-700 hover:text-white light:hover:text-slate-900 hover:border-purple-500/30 light:shadow-sm'
                  }`}
                >
                  <span className={isActive ? 'keep-white text-white' : ''}>{pageNum}</span>
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Next Page"
            className="p-2 rounded-xl bg-slate-900 light:bg-white border border-white/10 light:border-slate-200/80 text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:border-purple-500/30 light:shadow-sm disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Last Page"
            className="p-2 rounded-xl bg-slate-900 light:bg-white border border-white/10 light:border-slate-200/80 text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:border-purple-500/30 light:shadow-sm disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
