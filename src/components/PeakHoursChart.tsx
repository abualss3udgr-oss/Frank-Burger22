import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Order } from '../types';

interface PeakHoursChartProps {
  orders: Order[];
}

export const PeakHoursChart: React.FC<PeakHoursChartProps> = ({ orders }) => {
  // Aggregate orders by hour
  const chartData = useMemo(() => {
    const hours = new Array(24).fill(0);
    
    orders.forEach(order => {
      if (order.orderDate) {
        const date = new Date(order.orderDate);
        if (!isNaN(date.getTime())) {
          hours[date.getHours()] += 1;
        }
      }
    });

    // Format data for Recharts
    return hours.map((count, hour) => {
      // Convert hour (0-23) to 12-hour format (e.g., "3 PM") for display
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
      
      return {
        hourStr: `${formattedHour} ${ampm}`,
        hourVal: hour,
        orders: count,
      };
    });
  }, [orders]);

  // Find max value to color the peak bar differently
  const maxOrders = Math.max(...chartData.map(d => d.orders));

  // Custom tooltip to style it dark
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#121216] border border-[#24242e] p-3 rounded-lg shadow-xl">
          <p className="text-zinc-400 text-[10px] font-bold mb-1">{label}</p>
          <p className="text-[#E51E2A] text-sm font-black">
            {payload[0].value} <span className="text-zinc-500 font-semibold text-xs">طلب</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#121216] border border-[#24242e] rounded-2xl p-4 sm:p-5 space-y-4 shadow-md h-[300px] flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>خريطة أوقات الذروة للطلبات خلال اليوم</span>
        </h3>
        <span className="text-[10px] text-zinc-400 bg-[#18181f] px-2 py-1 rounded-md border border-[#2c2c36]">
          آخر 24 ساعة
        </span>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#24242e" vertical={false} />
            <XAxis 
              dataKey="hourStr" 
              stroke="#71717a" 
              fontSize={10} 
              tickLine={false}
              axisLine={{ stroke: '#24242e' }}
              minTickGap={15}
            />
            <YAxis 
              stroke="#71717a" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1a1a22' }} />
            <Bar 
              dataKey="orders" 
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.orders === maxOrders && maxOrders > 0 ? '#E51E2A' : '#3f3f46'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
