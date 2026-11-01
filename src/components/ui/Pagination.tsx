'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isRTL?: boolean;
  className?: string;
  /** Max numbered buttons around the current page (default 1 → ~7 slots total) */
  siblingCount?: number;
}

type PageItem = number | 'ellipsis';

function getVisiblePages(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): PageItem[] {
  // first + last + current + 2*siblings + 2 ellipsis slots
  const maxButtons = siblingCount * 2 + 5;
  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    // Near start: 1 2 3 4 5 … N
    const leftCount = 3 + 2 * siblingCount;
    return [
      ...Array.from({ length: leftCount }, (_, i) => i + 1),
      'ellipsis',
      totalPages,
    ];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    // Near end: 1 … N-4 N-3 N-2 N-1 N
    const rightCount = 3 + 2 * siblingCount;
    return [
      1,
      'ellipsis',
      ...Array.from({ length: rightCount }, (_, i) => totalPages - rightCount + i + 1),
    ];
  }

  // Middle: 1 … c-1 c c+1 … N
  return [
    1,
    'ellipsis',
    ...Array.from(
      { length: rightSibling - leftSibling + 1 },
      (_, i) => leftSibling + i
    ),
    'ellipsis',
    totalPages,
  ];
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  isRTL = false,
  className,
  siblingCount = 1,
}: PaginationProps) {
  const visiblePages = useMemo(
    () => getVisiblePages(currentPage, totalPages, siblingCount),
    [currentPage, totalPages, siblingCount]
  );

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const summary = isRTL
    ? `عرض ${startItem} إلى ${endItem} من أصل ${totalItems}`
    : `Showing ${startItem} to ${endItem} of ${totalItems}`;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-6',
        className
      )}
    >
      <p className="text-sm text-muted-foreground shrink-0 whitespace-nowrap">
        {summary}
      </p>

      <nav
        aria-label={isRTL ? 'التنقل بين الصفحات' : 'Pagination'}
        className={cn('flex items-center gap-1 flex-wrap', isRTL && 'flex-row-reverse')}
      >
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRTL ? 'السابق' : 'Previous'}
        </button>

        {visiblePages.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 py-2 text-sm text-muted-foreground select-none"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              type="button"
              key={item}
              onClick={() => onPageChange(item)}
              aria-current={item === currentPage ? 'page' : undefined}
              className={cn(
                'min-w-10 px-3 py-2 text-sm rounded-lg border transition-colors',
                item === currentPage
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-background border-border text-muted-foreground hover:bg-muted'
              )}
            >
              {item.toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRTL ? 'التالي' : 'Next'}
        </button>
      </nav>
    </div>
  );
}
