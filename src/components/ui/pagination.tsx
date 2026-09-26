import * as React from "react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

interface PaginationProps {
  totalItems: number
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
  className?: string
  itemsPerPageOptions?: number[]
  showItemsPerPage?: boolean
  maxPageLinks?: number
}

const DEFAULT_ITEMS_PER_PAGE_OPTIONS = [10, 15, 25, 50, 100]

function Pagination({
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className,
  itemsPerPageOptions = DEFAULT_ITEMS_PER_PAGE_OPTIONS,
  showItemsPerPage = true,
  maxPageLinks = 5,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    const halfMax = Math.floor(maxPageLinks / 2)

    const startPage = Math.max(1, currentPage - halfMax)
    let endPage = Math.min(totalPages, startPage + maxPageLinks - 1)

    if (endPage - startPage + 1 < maxPageLinks) {
      endPage = Math.min(totalPages, startPage + maxPageLinks - 1)
    }

    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) pages.push("ellipsis")
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push("ellipsis")
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full items-center justify-between gap-4 flex-wrap", className)}
    >
      {showItemsPerPage && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">Show</span>
          <Select value={itemsPerPage.toString()} onValueChange={(v) => onItemsPerPageChange(Number(v))}>
            <SelectTrigger className="w-[100px] h-8 text-sm">
              <SelectValue placeholder="Items" />
            </SelectTrigger>
            <SelectContent>
              {itemsPerPageOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option} per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-sm text-text-secondary">
          Page {currentPage} of {totalPages} ({totalItems} items)
        </span>
        
        <ul data-slot="pagination-content" className="flex items-center gap-0.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            <ChevronLeftIcon data-icon="inline-start" className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>

          {pageNumbers.map((page, index) =>
            page === "ellipsis" ? (
              <li key={`ellipsis-${index}`} className="flex size-7 items-center justify-center text-text-tertiary">
                <MoreHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">More pages</span>
              </li>
            ) : (
              <li key={page}>
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  onClick={() => onPageChange(page)}
                  aria-label={`Go to page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                  className="h-8 w-8"
                >
                  {page}
                </Button>
              </li>
            )
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            <ChevronRightIcon data-icon="inline-end" className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </ul>
      </div>
    </nav>
  )
}

export { Pagination }
