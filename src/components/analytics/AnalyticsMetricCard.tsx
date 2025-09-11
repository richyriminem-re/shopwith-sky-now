import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsMetricCardProps {
  title: string;
  description?: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  progress?: {
    current: number;
    max: number;
    label: string;
  };
  icon?: React.ReactNode;
  isLoading?: boolean;
  isStale?: boolean;
  status?: 'good' | 'warning' | 'critical';
  onClick?: () => void;
}

const AnalyticsMetricCard: React.FC<AnalyticsMetricCardProps> = ({
  title,
  description,
  value,
  trend,
  progress,
  icon,
  isLoading,
  isStale,
  status,
  onClick
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.value === 0) return <Minus className="h-3 w-3 text-muted-foreground" />;
    return trend.isPositive 
      ? <TrendingUp className="h-3 w-3 text-success" />
      : <TrendingDown className="h-3 w-3 text-destructive" />;
  };

  const getStatusBadgeColor = () => {
    switch (status) {
      case 'good': return 'bg-success/10 text-success hover:bg-success/20';
      case 'warning': return 'bg-warning/10 text-warning hover:bg-warning/20';
      case 'critical': return 'bg-destructive/10 text-destructive hover:bg-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`
        transition-all duration-200 hover:shadow-md cursor-pointer
        ${isStale ? 'opacity-60' : ''}
        ${status === 'critical' ? 'border-destructive/20' : ''}
        ${status === 'warning' ? 'border-warning/20' : ''}
        ${status === 'good' ? 'border-success/20' : ''}
      `}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {isStale && (
            <RefreshCw className="h-3 w-3 text-muted-foreground animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-2">
          {status && (
            <Badge variant="secondary" className={getStatusBadgeColor()}>
              {status}
            </Badge>
          )}
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        
        {trend && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {getTrendIcon()}
            {Math.abs(trend.value).toFixed(1)}% {trend.label}
          </p>
        )}
        
        {progress && (
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span>{progress.label}</span>
              <span>{progress.current}/{progress.max}</span>
            </div>
            <Progress 
              value={(progress.current / progress.max) * 100} 
              className="h-2"
            />
          </div>
        )}
        
        {description && (
          <CardDescription className="mt-2">{description}</CardDescription>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsMetricCard;