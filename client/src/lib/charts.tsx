import React from 'react';
import { useQuery } from '@tanstack/react-query';

// Hook to fetch revenue forecast data
export function useRevenueForecastData() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard/revenue-forecast'],
  });

  // Transform the data for the chart
  const chartData = React.useMemo(() => {
    if (!data?.data) return [];
    
    const { months, actual, forecast, previousYear } = data.data;
    return months.map((month, index) => ({
      name: month,
      Actual: actual[index],
      Forecast: forecast[index],
      'Previous Year': previousYear[index]
    }));
  }, [data]);

  return { chartData, isLoading, error };
}

// Hook to fetch revenue by region data
export function useRevenueByRegionData() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard/revenue-by-region'],
  });

  // Get the data directly
  const chartData = data?.data || [];

  return { chartData, isLoading, error };
}

// Hook to fetch key metrics data
export function useKeyMetricsData() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard/key-metrics'],
  });

  return { metrics: data?.data, isLoading, error };
}

// Custom hook for AI dashboard analysis
export function useAiAnalysis(query: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/ai/analysis', query],
    enabled: !!query,
  });

  return { analysis: data?.data, isLoading, error };
}

// Generate placeholder dashboard data
export const generatePlaceholderRevenueData = () => {
  return [
    { name: 'Jan', Actual: 4.2, 'Previous Year': 3.8 },
    { name: 'Feb', Actual: 4.5, 'Previous Year': 4.0 },
    { name: 'Mar', Actual: 4.8, 'Previous Year': 4.2 },
    { name: 'Apr', Actual: 5.1, 'Previous Year': 4.4 },
    { name: 'May', Actual: 5.4, 'Previous Year': 4.6 },
    { name: 'Jun', Actual: 5.7, 'Previous Year': 4.8 },
    { name: 'Jul', Actual: 6.0, 'Previous Year': 5.0 },
    { name: 'Aug', Actual: 6.3, 'Previous Year': 5.2 },
    { name: 'Sep', Forecast: 6.6, 'Previous Year': 5.4 },
    { name: 'Oct', Forecast: 6.9, 'Previous Year': 5.6 },
    { name: 'Nov', Forecast: 7.2, 'Previous Year': 5.8 },
    { name: 'Dec', Forecast: 7.5, 'Previous Year': 6.0 }
  ];
};

export const generatePlaceholderRegionData = () => {
  return [
    { name: 'North America', value: 45 },
    { name: 'Europe', value: 30 },
    { name: 'Asia Pacific', value: 15 },
    { name: 'Latin America', value: 7 },
    { name: 'Middle East & Africa', value: 3 }
  ];
};

export const generatePlaceholderMetricsData = () => {
  return {
    revenue: {
      value: 4.2,
      change: 12.5,
      trend: [4.0, 4.1, 4.15, 4.2, 4.25, 4.3]
    },
    expenses: {
      value: 2.8,
      change: 3.2,
      trend: [2.6, 2.65, 2.7, 2.75, 2.8, 2.85]
    },
    profitMargin: {
      value: 33.4,
      change: 5.3,
      trend: [30.1, 31.2, 32.0, 32.8, 33.4, 33.5]
    }
  };
};
