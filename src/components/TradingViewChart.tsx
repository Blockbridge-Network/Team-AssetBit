import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries, AreaSeries, HistogramSeries, UTCTimestamp } from 'lightweight-charts';

interface ChartComponentProps {
  data: any[];
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  };
  symbol: string;
  interval: string;
  width?: number;
  height?: number;
  showVolume?: boolean;
  theme?: 'light' | 'dark';
  onIntervalChange?: (interval: string) => void;
}

const TradingViewChart: React.FC<ChartComponentProps> = ({
  data,
  colors = {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    lineColor: '#2962FF',
    textColor: 'rgba(255, 255, 255, 0.7)',
    areaTopColor: 'rgba(41, 98, 255, 0.3)',
    areaBottomColor: 'rgba(41, 98, 255, 0.05)',
  },
  symbol,
  interval,
  width = 600,
  height = 400,
  showVolume = true,
  theme = 'dark',
  onIntervalChange
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const [selectedInterval, setSelectedInterval] = useState(interval);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [indicators, setIndicators] = useState({
    ma: false,
    ema: false,
    bollinger: false,
    rsi: false,
  });
  // Prevent chart recreation on every render
  const dataRef = useRef(data);
  const rendered = useRef(false);

  const intervals = [
    { label: '5m', value: '5m' },
    { label: '15m', value: '15m' },
    { label: '1h', value: '1h' },
    { label: '4h', value: '4h' },
    { label: '1d', value: '1d' },
    { label: '1w', value: '1w' },
    { label: '1mo', value: '1mo' },
  ];

  const handleIntervalChange = (newInterval: string) => {
    setSelectedInterval(newInterval);
    if (onIntervalChange) {
      onIntervalChange(newInterval);
    }
  };

  // Function to detect data changes requiring a redraw
  const hasDataChanged = useCallback((newData: any[], oldData: any[]) => {
    if (!oldData || oldData.length !== newData.length) return true;
    
    // Check if data actually changed in a meaningful way
    return JSON.stringify(newData) !== JSON.stringify(oldData);
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;
    
    // Check if we need to redraw the chart
    if (rendered.current && chartRef.current && !hasDataChanged(data, dataRef.current)) {
      // No need to redraw, just update the data
      dataRef.current = [...data];
      return;
    }
    
    rendered.current = true;
    dataRef.current = [...data];

    // Create chart and clean up previous
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const backgroundColor = theme === 'dark' ? '#131722' : '#FFFFFF';
    const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const upColor = '#26a69a';
    const downColor = '#ef5350';
    
    // Create chart with options
    const chart = createChart(chartContainerRef.current, {
      width,
      height,
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      rightPriceScale: {
        borderColor: gridColor,
      },
      timeScale: {
        borderColor: gridColor,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
      },
    });
    
    chartRef.current = chart;

    try {
      // Check if we have OHLC data or just price data
      const hasOHLCData = data.some(item => item.open !== undefined && item.high !== undefined);
      
      if (hasOHLCData) {
        // For OHLC data format
        const candleData = data.map(item => ({
          time: (item.time / 1000) as UTCTimestamp,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close
        }));
        
        // Try to add a candlestick series
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
          upColor,
          downColor,
          borderVisible: false,
          wickUpColor: upColor,
          wickDownColor: downColor,
        });
        
        seriesRef.current = candlestickSeries;
        
        // Set data
        candlestickSeries.setData(candleData);
        
        // Add volume if requested
        if (showVolume && data[0] && data[0].volume) {
          const volumeData = data.map(item => ({
            time: (item.time / 1000) as UTCTimestamp,
            value: item.volume || 0,
            color: (item.close > item.open) ? upColor : downColor,
          }));
          
          const volumeSeries = chart.addSeries(HistogramSeries, {
            color: '#26a69a',
            priceScaleId: 'volume',
          });
          
          chart.priceScale('volume').applyOptions({
            scaleMargins: {
              top: 0.8,
              bottom: 0,
            },
          });
          
          volumeSeries.setData(volumeData);
        }
      } else {
        // For simple price data format
        const lineData = data.map(item => ({
          time: (item.time / 1000) as UTCTimestamp,
          value: item.price || item.value || item.close || 0,
        }));
        
        // Create a line series
        const lineSeries = chart.addSeries(LineSeries, {
          color: colors.lineColor || '#2962FF',
          lineWidth: 2,
        });
        
        seriesRef.current = lineSeries;
        
        lineSeries.setData(lineData);
      }
      
      // Add MA indicator if enabled
      if (indicators.ma && data.length > 20) {
        const maData = [];
        const period = 20;
        
        for (let i = period - 1; i < data.length; i++) {
          let sum = 0;
          for (let j = 0; j < period; j++) {
            const value = data[i - j].close || data[i - j].price || data[i - j].value || 0;
            sum += value;
          }
          maData.push({
            time: (data[i].time / 1000) as UTCTimestamp,
            value: sum / period,
          });
        }
        
        const maSeries = chart.addSeries(LineSeries, {
          color: 'rgba(255, 165, 0, 1)',
          lineWidth: 2,
        });
        
        maSeries.setData(maData);
      }
      
      // Fit content
      chart.timeScale().fitContent();
      
    } catch (error) {
      console.error('Error creating chart:', error);
      
      // If main chart fails, create a simple area chart as fallback
      if (chartContainerRef.current) {
        chartContainerRef.current.innerHTML = '';
      }
      
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      
      try {
        const lineChart = createChart(chartContainerRef.current, {
          width,
          height,
          layout: {
            background: { type: ColorType.Solid, color: backgroundColor },
            textColor,
          },
          grid: {
            vertLines: { color: gridColor },
            horzLines: { color: gridColor },
          },
        });
        
        chartRef.current = lineChart;
        
        const simpleData = data.map(item => ({
          time: (item.time / 1000) as UTCTimestamp,
          value: item.price || item.close || item.value || 0,
        }));
        
        const areaSeries = lineChart.addSeries(AreaSeries, {
          lineColor: colors.lineColor || '#2962FF',
          topColor: colors.areaTopColor || 'rgba(41, 98, 255, 0.3)',
          bottomColor: colors.areaBottomColor || 'rgba(41, 98, 255, 0.05)',
          lineWidth: 2,
        });
        
        seriesRef.current = areaSeries;
        
        areaSeries.setData(simpleData);
        lineChart.timeScale().fitContent();
      } catch (innerError) {
        console.error('Error creating fallback chart:', innerError);
      }
    }

    // Clean up function
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, colors, width, height, theme, showVolume, indicators, hasDataChanged]);

  // Handle interval change separately to avoid recreation of the entire chart
  useEffect(() => {
    if (chartRef.current && seriesRef.current) {
      const title = `${symbol} - ${interval}`;
      // We could update any chart properties related to the interval here
    }
  }, [symbol, interval]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-2 p-2 bg-gray-800 rounded-t-lg">
        <div className="text-white font-semibold">{symbol} - {interval}</div>
        <div className="flex space-x-1">
          {intervals.map((int) => (
            <button
              key={int.value}
              onClick={() => handleIntervalChange(int.value)}
              className={`px-2 py-1 text-xs rounded ${
                selectedInterval === int.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {int.label}
            </button>
          ))}
          <button
            onClick={() => setIsToolbarOpen(!isToolbarOpen)}
            className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            Indicators
          </button>
        </div>
      </div>
      
      {isToolbarOpen && (
        <div className="flex space-x-2 p-2 bg-gray-900 mb-2">
          <button
            onClick={() => setIndicators({ ...indicators, ma: !indicators.ma })}
            className={`px-2 py-1 text-xs rounded ${
              indicators.ma ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            MA
          </button>
          <button
            onClick={() => setIndicators({ ...indicators, ema: !indicators.ema })}
            className={`px-2 py-1 text-xs rounded ${
              indicators.ema ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            EMA
          </button>
          <button
            onClick={() => setIndicators({ ...indicators, bollinger: !indicators.bollinger })}
            className={`px-2 py-1 text-xs rounded ${
              indicators.bollinger ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Bollinger
          </button>
          <button
            onClick={() => setIndicators({ ...indicators, rsi: !indicators.rsi })}
            className={`px-2 py-1 text-xs rounded ${
              indicators.rsi ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            RSI
          </button>
        </div>
      )}
      
      <div 
        ref={chartContainerRef} 
        className="w-full h-full rounded-b-lg overflow-hidden"
        style={{ height }}
      />
    </div>
  );
};

export default TradingViewChart; 