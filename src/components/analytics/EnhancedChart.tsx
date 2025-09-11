import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { BarChart3, LineChart as LineChartIcon, Activity, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartData {
  name: string;
  [key: string]: any;
}

interface EnhancedChartProps {
  title: string;
  description?: string;
  data: ChartData[];
  dataKeys: Array<{
    key: string;
    name: string;
    color: string;
  }>;
  isLoading?: boolean;
  error?: string;
  onExport?: () => void;
  height?: number;
  timeRange?: {
    options: Array<{ label: string; value: string }>;
    selected: string;
    onChange: (value: string) => void;
  };
}

type ChartType = 'line' | 'area' | 'bar';

const EnhancedChart: React.FC<EnhancedChartProps> = ({
  title,
  description,
  data,
  dataKeys,
  isLoading,
  error,
  onExport,
  height = 300,
  timeRange
}) => {
  const [chartType, setChartType] = useState<ChartType>('line');

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              {dataKeys.map(({ key, color }) => (
                <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map(({ key, name, color }) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                fillOpacity={1}
                fill={`url(#gradient-${key})`}
                name={name}
              />
            ))}
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map(({ key, name, color }) => (
              <Bar key={key} dataKey={key} fill={color} name={name} />
            ))}
          </BarChart>
        );
      
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map(({ key, name, color }) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                name={name}
                dot={{ fill: color, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className={`w-full h-[${height}px]`} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Failed to load chart data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {timeRange && (
              <Tabs value={timeRange.selected} onValueChange={timeRange.onChange}>
                <TabsList className="h-8">
                  {timeRange.options.map(option => (
                    <TabsTrigger key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
            
            <div className="flex items-center border rounded-md">
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('line')}
                className="h-8 px-2"
              >
                <LineChartIcon className="h-3 w-3" />
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('area')}
                className="h-8 px-2"
              >
                <Activity className="h-3 w-3" />
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setChartType('bar')}
                className="h-8 px-2"
              >
                <BarChart3 className="h-3 w-3" />
              </Button>
            </div>
            
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="h-8"
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default EnhancedChart;