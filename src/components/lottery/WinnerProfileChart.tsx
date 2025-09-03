import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { WinnerProfile } from '~/lib/lottery';

interface WinnerProfileChartProps {
  data: WinnerProfile;
}

export function WinnerProfileChart({ data }: WinnerProfileChartProps) {
  const chartData = Object.entries(data).map(([range, percentage]) => ({
    name: range,
    '% of Winners': percentage
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
        <Legend />
        <Bar dataKey="% of Winners" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
