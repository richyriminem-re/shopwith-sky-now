import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  Users, 
  Crown,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiTabSyncIndicatorProps {
  syncStatus: 'synced' | 'syncing' | 'conflict' | 'offline';
  isLeader: boolean;
  activeTabs: number;
  conflictCount: number;
  onForceSync?: () => void;
  onResolveConflicts?: () => void;
  className?: string;
}

const MultiTabSyncIndicator = ({
  syncStatus,
  isLeader,
  activeTabs,
  conflictCount,
  onForceSync,
  onResolveConflicts,
  className
}: MultiTabSyncIndicatorProps) => {
  // Hide from users - technical sync information not needed
  return null;
  
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (syncStatus === 'syncing') {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'synced':
        return <Wifi className="h-3 w-3" />;
      case 'syncing':
        return <RefreshCw className={cn("h-3 w-3", isAnimating && "animate-spin")} />;
      case 'conflict':
        return <AlertTriangle className="h-3 w-3" />;
      case 'offline':
        return <WifiOff className="h-3 w-3" />;
      default:
        return <Wifi className="h-3 w-3" />;
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'synced':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'syncing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'conflict':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
      case 'offline':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'synced':
        return 'Synced';
      case 'syncing':
        return 'Syncing...';
      case 'conflict':
        return `${conflictCount} Conflict${conflictCount !== 1 ? 's' : ''}`;
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const getTooltipContent = () => {
    const baseInfo = `${activeTabs} active tab${activeTabs !== 1 ? 's' : ''}`;
    const leaderInfo = isLeader ? ' (This tab is the leader)' : '';
    const statusInfo = (() => {
      switch (syncStatus) {
        case 'synced':
          return 'All tabs are synchronized';
        case 'syncing':
          return 'Synchronizing changes across tabs';
        case 'conflict':
          return `${conflictCount} conflict${conflictCount !== 1 ? 's' : ''} need resolution`;
        case 'offline':
          return 'Unable to sync with other tabs';
        default:
          return '';
      }
    })();

    return `${baseInfo}${leaderInfo}. ${statusInfo}`;
  };

  if (activeTabs <= 1) {
    return null; // Don't show indicator for single tab
  }

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-normal transition-colors duration-200",
                getStatusColor()
              )}
            >
              <div className="flex items-center gap-1.5">
                {getStatusIcon()}
                <span>{getStatusText()}</span>
                {isLeader && <Crown className="h-3 w-3" />}
              </div>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <Users className="h-3 w-3" />
                <span className="font-medium">{activeTabs} Active Tabs</span>
                {isLeader && (
                  <>
                    <Crown className="h-3 w-3 ml-1" />
                    <span className="text-xs">(Leader)</span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{getTooltipContent()}</p>
            </div>
          </TooltipContent>
        </Tooltip>

        {syncStatus === 'conflict' && conflictCount > 0 && onResolveConflicts && (
          <Button
            size="sm"
            variant="outline"
            onClick={onResolveConflicts}
            className="h-6 px-2 text-xs"
          >
            Resolve
          </Button>
        )}

        {onForceSync && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={onForceSync}
                className="h-6 w-6 p-0"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Force sync with other tabs
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

export default MultiTabSyncIndicator;