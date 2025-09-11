import { ReactNode, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useResponsiveDesign } from '@/hooks/useResponsiveDesign';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TableColumn {
  key: string;
  header: string;
  render: (item: any) => ReactNode;
  mobileLabel?: string;
  priority: 'high' | 'medium' | 'low'; // Priority for responsive hiding
}

interface TableAction {
  label: string;
  icon?: React.ComponentType<any>;
  onClick: (item: any) => void;
  variant?: 'default' | 'destructive';
}

interface ResponsiveTableProps {
  data: any[];
  columns: TableColumn[];
  actions?: TableAction[];
  title?: string;
  description?: string;
  selectedIds?: string[];
  onSelectAll?: () => void;
  onSelect?: (id: string) => void;
  showSelection?: boolean;
  searchValue?: string;
  emptyState?: ReactNode;
  stickyHeader?: boolean;
}

export function ResponsiveTable({
  data,
  columns,
  actions = [],
  title,
  description,
  selectedIds = [],
  onSelectAll,
  onSelect,
  showSelection = false,
  emptyState,
  stickyHeader = false,
}: ResponsiveTableProps) {
  const { isMobile, isTablet, getTextSizeClasses, getPaddingClasses } = useResponsiveDesign();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Responsive column filtering based on priority and screen size
  const visibleColumns = useMemo(() => {
    if (isMobile) {
      return columns.filter(col => col.priority === 'high');
    }
    if (isTablet) {
      return columns.filter(col => col.priority === 'high' || col.priority === 'medium');
    }
    return columns;
  }, [columns, isMobile, isTablet]);

  const hiddenColumns = useMemo(() => {
    return columns.filter(col => !visibleColumns.includes(col));
  }, [columns, visibleColumns]);

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-3">
        {title && (
          <div className="space-y-1">
            <h3 className={`${getTextSizeClasses('text-lg', 'text-xl', 'text-xl')} font-semibold`}>
              {title}
            </h3>
            {description && (
              <p className={`${getTextSizeClasses('text-sm', 'text-sm', 'text-base')} text-muted-foreground`}>
                {description}
              </p>
            )}
          </div>
        )}
        
        {data.length === 0 ? (
          emptyState || (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No data found</p>
              </CardContent>
            </Card>
          )
        ) : (
          <div className="space-y-3">
            {data.map((item, index) => (
              <Card key={item.id || index} className="overflow-hidden">
                <CardContent className="p-0">
                  <Collapsible
                    open={expandedRows.has(item.id)}
                    onOpenChange={() => toggleRowExpansion(item.id)}
                  >
                    <div className={`${getPaddingClasses('p-3', 'p-4', 'p-4')} space-y-3`}>
                      {/* Main content - high priority columns */}
                      <div className="space-y-2">
                        {visibleColumns.map((column) => (
                          <div key={column.key} className="flex justify-between items-start min-w-0">
                            <span className={`${getTextSizeClasses('text-xs', 'text-sm', 'text-sm')} text-muted-foreground flex-shrink-0 mr-3`}>
                              {column.mobileLabel || column.header}:
                            </span>
                            <div className="min-w-0 flex-1 text-right">
                              {column.render(item)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Expandable section for additional details */}
                      {hiddenColumns.length > 0 && (
                        <div className="flex items-center justify-between">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2 min-h-[44px]">
                              {expandedRows.has(item.id) ? (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  Less details
                                </>
                              ) : (
                                <>
                                  <ChevronRight className="h-4 w-4" />
                                  More details
                                </>
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          
                          {actions.length > 0 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="z-50">
                                {actions.map((action, actionIndex) => (
                                  <DropdownMenuItem
                                    key={actionIndex}
                                    onClick={() => action.onClick(item)}
                                    className={`gap-2 ${action.variant === 'destructive' ? 'text-destructive' : ''}`}
                                  >
                                    {action.icon && <action.icon className="h-4 w-4" />}
                                    {action.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      )}

                      {/* Collapsible content for hidden columns */}
                      {hiddenColumns.length > 0 && (
                        <CollapsibleContent className="space-y-2">
                          <div className="border-t border-border pt-3 space-y-2">
                            {hiddenColumns.map((column) => (
                              <div key={column.key} className="flex justify-between items-start min-w-0">
                                <span className={`${getTextSizeClasses('text-xs', 'text-sm', 'text-sm')} text-muted-foreground flex-shrink-0 mr-3`}>
                                  {column.mobileLabel || column.header}:
                                </span>
                                <div className="min-w-0 flex-1 text-right">
                                  {column.render(item)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      )}
                    </div>
                  </Collapsible>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop/Tablet table view
  return (
    <Card className="overflow-hidden">
      {title && (
        <CardHeader>
          <CardTitle className={getTextSizeClasses('text-lg', 'text-xl', 'text-xl')}>
            {title}
          </CardTitle>
          {description && (
            <p className={`${getTextSizeClasses('text-sm', 'text-sm', 'text-base')} text-muted-foreground`}>
              {description}
            </p>
          )}
        </CardHeader>
      )}
      
      <CardContent className="p-0">
        {data.length === 0 ? (
          emptyState || (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No data found</p>
            </div>
          )
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className={stickyHeader ? 'sticky top-0 z-10 bg-background' : ''}>
                <TableRow>
                  {showSelection && (
                    <TableHead className="w-[40px]">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={selectedIds.length === data.length && data.length > 0}
                          onCheckedChange={onSelectAll}
                          className="h-4 w-4"
                          aria-label="Select all items"
                        />
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.map((column) => (
                    <TableHead key={column.key} className="whitespace-nowrap">
                      {column.header}
                    </TableHead>
                  ))}
                  {actions.length > 0 && (
                    <TableHead className="w-[100px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={item.id || index}>
                    {showSelection && (
                      <TableCell className="w-[40px] p-2">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={selectedIds.includes(item.id)}
                            onCheckedChange={() => onSelect?.(item.id)}
                            className="h-4 w-4"
                            aria-label={`Select ${item.id}`}
                          />
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.map((column) => (
                      <TableCell key={column.key} className="max-w-0">
                        <div className="truncate">
                          {column.render(item)}
                        </div>
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 tap-target">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="z-50">
                            {actions.map((action, actionIndex) => (
                              <DropdownMenuItem
                                key={actionIndex}
                                onClick={() => action.onClick(item)}
                                className={`gap-2 ${action.variant === 'destructive' ? 'text-destructive' : ''}`}
                              >
                                {action.icon && <action.icon className="h-4 w-4" />}
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}