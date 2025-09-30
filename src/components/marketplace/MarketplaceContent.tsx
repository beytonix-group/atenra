'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, MapPin, Globe, Phone, Mail, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
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
}

export function MarketplaceContent({
  initialCompanies = [],
  initialCategories = [],
  initialTotalPages = 1,
  isUsingPreferences = false,
  defaultCategoryId
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
        const result = await fetchCompanies({
          page: currentPage,
          limit: currentLimit,
          categoryId: currentCategory ? Number(currentCategory) : undefined,
          sortBy: currentSort as 'name' | 'createdAt',
          sortOrder: 'desc',
          search: currentSearch
        });

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                type="text"
                placeholder="Search companies, services, or locations..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 pr-4 h-10 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-600"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              {/* Category Filter */}
              <Select value={currentCategory || 'all'} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[180px] h-10 bg-white dark:bg-gray-700">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="All Categories" />
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
                <SelectTrigger className="w-[150px] h-10 bg-white dark:bg-gray-700">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Newest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>

              {/* Items per page */}
              <Select value={currentLimit.toString()} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-[120px] h-10 bg-white dark:bg-gray-700">
                  <SelectValue placeholder="25 items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 items</SelectItem>
                  <SelectItem value="50">50 items</SelectItem>
                  <SelectItem value="75">75 items</SelectItem>
                  <SelectItem value="100">100 items</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Preference Filter Indicator */}
        {showingPreferences && currentCategory && !currentSearch && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-800 dark:text-blue-200">
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
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                View all
              </Button>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {currentSearch && (
            <span>
              Search results for &quot;{currentSearch}&quot;: {companies.length} companies found
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: currentLimit }).map((_, i) => (
              <Card key={i} className="overflow-hidden bg-white dark:bg-gray-800">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {companies.map((company) => (
              <Link key={company.id} href={`/marketplace/${company.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  {/* Company Logo Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center relative">
                    <Building2 className="h-20 w-20 text-blue-300 dark:text-blue-400" />
                    {company.status === 'pending_verification' && (
                      <Badge className="absolute top-2 right-2 bg-yellow-100 text-yellow-800">
                        Pending Verification
                      </Badge>
                    )}
                  </div>

                  {/* Company Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1 text-gray-900 dark:text-gray-100">
                      {company.name}
                    </h3>

                    {/* Location */}
                    {(company.city || company.state) && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">
                          {[company.city, company.state].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    {company.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {company.description}
                      </p>
                    )}

                    {/* Categories */}
                    {company.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {company.categories.slice(0, 2).map((cat) => (
                          <Badge key={cat.id} variant="secondary" className="text-xs">
                            {cat.name}
                          </Badge>
                        ))}
                        {company.categories.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{company.categories.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Contact Icons */}
                    <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
                      {company.websiteUrl && (
                        <Globe className="h-4 w-4" />
                      )}
                      {company.phone && (
                        <Phone className="h-4 w-4" />
                      )}
                      {company.email && (
                        <Mail className="h-4 w-4" />
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
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No companies found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isPending}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
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
                    className="w-10"
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
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}