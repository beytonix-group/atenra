'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, MapPin, Globe, Phone, Mail, ChevronLeft, ChevronRight, Filter, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchCompanies, fetchServiceCategories, type CompanyWithCategories } from '@/app/marketplace/actions';
import { useDebounce } from 'use-debounce';

interface MarketplaceContentProps {
  initialCompanies?: CompanyWithCategories[];
  initialCategories?: Array<{ id: number; name: string; description: string | null }>;
  initialTotalPages?: number;
  isUsingPreferences?: boolean;
  defaultCategoryId?: number;
  isAdmin?: boolean;
}

export function MarketplaceContent({
  initialCompanies = [],
  initialCategories = [],
  initialTotalPages = 1,
  isUsingPreferences = false,
  defaultCategoryId,
  isAdmin = false
}: MarketplaceContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [companies, setCompanies] = useState<CompanyWithCategories[]>(initialCompanies);
  const [categories, setCategories] = useState(initialCategories);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [showingPreferences, setShowingPreferences] = useState(isUsingPreferences);

  // Get current filter values from URL
  // Only use defaultCategoryId if category param is not in URL at all
  const currentPage = Number(searchParams.get('page') || 1);
  const currentLimit = Number(searchParams.get('limit') || 25);
  const categoryParam = searchParams.get('category');
  const currentCategory = categoryParam !== null ? categoryParam : (defaultCategoryId ? String(defaultCategoryId) : '');
  const currentSort = searchParams.get('sort') || 'createdAt';
  const currentSearch = searchParams.get('search') || '';

  // Local search input state with debouncing
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [debouncedSearch] = useDebounce(searchInput, 300);

  // Load data when URL params change
  useEffect(() => {
    loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, currentLimit, currentCategory, currentSort, currentSearch]);

  // Update URL when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== currentSearch) {
      setShowingPreferences(false); // Hide preferences when searching
      updateUrlParams({ search: debouncedSearch || null, page: '1' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Load categories on mount if not provided
  useEffect(() => {
    if (categories.length === 0) {
      loadCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await fetchServiceCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadCompanies = async () => {
    startTransition(async () => {
      try {
        let result = await fetchCompanies({
          page: currentPage,
          limit: currentLimit,
          categoryId: currentCategory ? Number(currentCategory) : undefined,
          sortBy: currentSort as 'name' | 'createdAt',
          sortOrder: 'desc',
          search: currentSearch
        });

        // If using preferences and no results, fall back to showing all companies
        if (showingPreferences && result.companies.length === 0 && currentCategory) {
          result = await fetchCompanies({
            page: currentPage,
            limit: currentLimit,
            categoryId: undefined, // No category filter
            sortBy: currentSort as 'name' | 'createdAt',
            sortOrder: 'desc',
            search: currentSearch
          });
          setShowingPreferences(false);
        }

        setCompanies(result.companies);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error('Error loading companies:', error);
      }
    });
  };

  const updateUrlParams = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });

    router.push(`/marketplace?${newParams.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    setShowingPreferences(false); // User manually changed category, not using preferences
    updateUrlParams({ category: value === 'all' ? '' : value, page: '1' });
  };

  const handleLimitChange = (value: string) => {
    updateUrlParams({ limit: value, page: '1' });
  };

  const handleSortChange = (value: string) => {
    updateUrlParams({ sort: value, page: '1' });
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page: page.toString() });
  };


  return (
    <div className="w-full -mt-4 lg:-mt-6">
      {/* Header */}
      <div className="bg-background border-b border-border -mx-4 lg:-mx-6 px-3 md:px-4 lg:px-6 mb-4 md:mb-6 sticky top-[-1rem] lg:top-[-1.5rem] z-50 shadow-md">
        <div className="max-w-full py-2 md:py-3">
          <div className="flex flex-col gap-2 md:gap-3">
            {/* Search Bar and Add Company Button */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search companies..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 pr-4 h-9 md:h-10 text-sm bg-muted border-border focus:bg-background w-full"
                />
              </div>
              {isAdmin && (
                <Link href="/marketplace/create">
                  <Button
                    size="sm"
                    className="h-9 md:h-10 whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Company
                  </Button>
                </Link>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {/* Category Filter */}
              <Select value={currentCategory || 'all'} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[140px] md:w-[180px] h-9 md:h-10 bg-muted flex-shrink-0 text-xs md:text-sm ">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Filter className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Filter */}
              <Select value={currentSort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[120px] md:w-[150px] h-9 md:h-10 bg-muted flex-shrink-0 text-xs md:text-sm ">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Newest</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>

              {/* Items per page */}
              <Select value={currentLimit.toString()} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-[100px] md:w-[120px] h-9 md:h-10 bg-muted flex-shrink-0 text-xs md:text-sm ">
                  <SelectValue placeholder="Show" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="75">75</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-full">
        {/* Preference Filter Indicator */}
        {showingPreferences && currentCategory && !currentSearch && (
          <div className="mb-3 md:mb-4 p-2.5 md:p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-xs md:text-sm text-blue-800 dark:text-blue-200">
                  Showing results based on your preferences
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowingPreferences(false);
                  updateUrlParams({ category: null, page: '1' });
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 h-8 text-xs w-full sm:w-auto"
              >
                View all
              </Button>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="mb-3 md:mb-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
          {currentSearch && (
            <span>
              Search results for &quot;{currentSearch}&quot;: {companies.length} found
            </span>
          )}
          {!currentSearch && (
            <span>
              Showing {companies.length} companies
            </span>
          )}
        </div>

        {/* Companies Grid */}
        {isPending ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card
                key={i}
                className="overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              >
                <Skeleton className="h-40 md:h-48 w-full" />
                <div className="p-3 md:p-4 space-y-2">
                  <Skeleton className="h-5 md:h-6 w-3/4" />
                  <Skeleton className="h-3 md:h-4 w-1/2" />
                  <Skeleton className="h-3 md:h-4 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {companies.map((company) => (
              <Link key={company.id} href={`/marketplace/${company.id}`}>
                <Card
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                >
                  {/* Company Logo Placeholder */}
                  <div className="h-40 md:h-48 flex items-center justify-center relative bg-gray-100 dark:bg-gray-800">
                    <Building2 className="h-16 w-16 md:h-20 md:w-20 text-gray-400 dark:text-gray-500" />
                    {company.status === 'pending_verification' && (
                      <Badge className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">
                        Pending
                      </Badge>
                    )}
                  </div>

                  {/* Company Info */}
                  <div className="p-3 md:p-4">
                    <h3 className="font-semibold text-base md:text-lg mb-1 line-clamp-1 text-gray-900 dark:text-gray-100">
                      {company.name}
                    </h3>

                    {/* Location */}
                    {(company.city || company.state) && (
                      <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {[company.city, company.state].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    {company.description && (
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 md:mb-3 line-clamp-2">
                        {company.description}
                      </p>
                    )}

                    {/* Categories */}
                    {company.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2 md:mb-3">
                        {company.categories.slice(0, 2).map((cat) => (
                          <Badge key={cat.id} variant="secondary" className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">
                            {cat.name}
                          </Badge>
                        ))}
                        {company.categories.length > 2 && (
                          <Badge variant="secondary" className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">
                            +{company.categories.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Contact Icons */}
                    <div className="flex items-center gap-2 md:gap-3 text-gray-400 dark:text-gray-500">
                      {company.websiteUrl && (
                        <Globe className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      )}
                      {company.phone && (
                        <Phone className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      )}
                      {company.email && (
                        <Mail className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isPending && companies.length === 0 && (
          <div className="text-center py-8 md:py-12">
            <Building2 className="h-10 w-10 md:h-12 md:w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No companies found</h3>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isPending}
              className="w-full sm:w-auto text-xs md:text-sm h-8 md:h-9"
            >
              <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
              <span className="ml-1">Previous</span>
            </Button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={i}
                    variant={pageNum === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isPending}
                    className="w-8 md:w-10 h-8 md:h-9 text-xs md:text-sm"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isPending}
              className="w-full sm:w-auto text-xs md:text-sm h-8 md:h-9"
            >
              <span className="mr-1">Next</span>
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}