'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface CompanyPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function CompanyPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: CompanyPaginationProps) {
  if (totalItems === 0 || totalPages <= 1) {
    if (totalItems > 0) {
      return (
        <div className="flex items-center justify-between py-3 px-1 text-xs text-slate-400 border-t border-white/5">
          <span>
            Showing all <strong className="text-white font-bold">{totalItems}</strong> brand opportunities
          </span>
          <span className="text-[11px] text-purple-300/70 font-semibold">Page 1 of 1</span>
        </div>
      );
    }
    return null;
  }

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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 pb-2 border-t border-white/10 text-xs">
      {/* Left: Results Counter */}
      <div className="text-slate-400">
        Showing <strong className="text-white font-bold">{startItem}–{endItem}</strong> of{' '}
        <strong className="text-white font-bold">{totalItems}</strong> brands
      </div>

      {/* Right: Pagination Controls */}
      <div className="flex items-center gap-1.5">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="First Page"
          className="p-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-purple-500/30 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous Page"
          className="p-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-purple-500/30 disabled:opacity-40 disabled:pointer-events-none transition-colors"
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
                className={`min-w-[32px] h-8 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-200 border-purple-500/40 shadow-sm shadow-purple-950/40'
                    : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white hover:border-purple-500/30'
                }`}
              >
                {pageNum}
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
          className="p-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-purple-500/30 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Last Page"
          className="p-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-purple-500/30 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
