import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
}

export default function Pagination({ currentPage, setCurrentPage, totalPages }: PaginationProps) {
  const maxVisible = 3;
  const start = Math.max(1, Math.min(currentPage - 1, Math.max(1, totalPages - maxVisible + 1)));
  const end = Math.min(totalPages, start + maxVisible - 1);
  const visiblePages = [];
  for (let page = start; page <= end; page += 1) {
    visiblePages.push(page);
  }
  const showStart = start > 1;
  const showEnd = end < totalPages;
  const showStartEllipsis = start > 2;
  const showEndEllipsis = end < totalPages - 1;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */}
      <button
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || totalPages <= 1}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
        style={{ color: 'var(--muted-foreground)' }}
      >
        <ChevronLeft size={18} />
      </button>

      {/* Page Numbers */}
      {showStart && (
        <button
          onClick={() => setCurrentPage(1)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
          style={{
            backgroundColor: currentPage === 1 ? 'var(--primary)' : 'transparent',
            color: currentPage === 1 ? 'var(--primary-foreground)' : 'var(--muted-foreground)'
          }}
        >
          1
        </button>
      )}

      {showStartEllipsis && (
        <div className="px-2" style={{ color: 'var(--muted-foreground)' }}>
          ...
        </div>
      )}

      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
          style={{
            backgroundColor: currentPage === page ? 'var(--primary)' : 'transparent',
            color: currentPage === page ? 'var(--primary-foreground)' : 'var(--muted-foreground)'
          }}
        >
          {page}
        </button>
      ))}

      {showEndEllipsis && (
        <div className="px-2" style={{ color: 'var(--muted-foreground)' }}>
          ...
        </div>
      )}

      {showEnd && (
        <button
          onClick={() => setCurrentPage(totalPages)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
          style={{
            backgroundColor: currentPage === totalPages ? 'var(--primary)' : 'transparent',
            color: currentPage === totalPages ? 'var(--primary-foreground)' : 'var(--muted-foreground)'
          }}
        >
          {totalPages}
        </button>
      )}

      {/* Next Button */}
      <button
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || totalPages <= 1}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
        style={{ color: 'var(--muted-foreground)' }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
