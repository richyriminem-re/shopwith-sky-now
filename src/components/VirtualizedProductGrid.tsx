/**
 * Virtualized Product Grid Component
 * 
 * Optimized grid for large product lists using react-window
 */

import React, { useMemo, useCallback } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import ProductCard from './ProductCard';
import { Product } from '@/types';

interface VirtualizedProductGridProps {
  products: Product[];
  containerWidth: number;
  containerHeight: number;
  onProductClick?: (product: Product) => void;
  className?: string;
}

interface GridItemProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    products: Product[];
    columnCount: number;
    onProductClick?: (product: Product) => void;
  };
}

const GridItem: React.FC<GridItemProps> = ({ columnIndex, rowIndex, style, data }) => {
  const { products, columnCount, onProductClick } = data;
  const productIndex = rowIndex * columnCount + columnIndex;
  const product = products[productIndex];

  if (!product) {
    return <div style={style} />;
  }

  return (
    <div style={{ ...style, padding: '8px' }}>
      <ProductCard
        product={product}
        className="h-full"
      />
    </div>
  );
};

export const VirtualizedProductGrid: React.FC<VirtualizedProductGridProps> = ({
  products,
  containerWidth,
  containerHeight,
  onProductClick,
  className = '',
}) => {
  // Calculate grid dimensions
  const { columnCount, rowCount, columnWidth, rowHeight } = useMemo(() => {
    const minColumnWidth = 200;
    const maxColumnWidth = 300;
    const cols = Math.floor(containerWidth / minColumnWidth);
    const actualColumnWidth = Math.min(containerWidth / cols, maxColumnWidth);
    const rows = Math.ceil(products.length / cols);
    
    return {
      columnCount: cols,
      rowCount: rows,
      columnWidth: actualColumnWidth,
      rowHeight: 320, // Fixed height for product cards
    };
  }, [containerWidth, products.length]);

  // Memoize grid data to prevent unnecessary re-renders
  const gridData = useMemo(
    () => ({
      products,
      columnCount,
      onProductClick,
    }),
    [products, columnCount, onProductClick]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Add keyboard navigation support if needed
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || 
        event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      // Implement arrow key navigation
    }
  }, []);

  if (products.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className={className} onKeyDown={handleKeyDown} tabIndex={0}>
      <Grid
        columnCount={columnCount}
        columnWidth={columnWidth}
        height={containerHeight}
        rowCount={rowCount}
        rowHeight={rowHeight}
        width={containerWidth}
        itemData={gridData}
        overscanRowCount={2}
        overscanColumnCount={1}
      >
        {GridItem}
      </Grid>
    </div>
  );
};