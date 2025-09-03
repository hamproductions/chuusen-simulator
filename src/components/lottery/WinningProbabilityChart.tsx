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

interface WinningProbabilityChartProps {
  data: { [ballots: number]: number };
}

export function WinningProbabilityChart({ data }: WinningProbabilityChartProps) {
  const chartData = Object.entries(data)
    .map(([ballots, prob]) => ({
      name: `${ballots} ballots`,
      'Win Probability': prob * 100
    }))
    .sort((a, b) => {
      const aNum = parseInt(a.name, 10);
      const bNum = parseInt(b.name, 10);
      return aNum - bNum;
    });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis unit="%" />
        <Tooltip formatter={(value: number) => `${value.toFixed(4)}%`} />
        <Legend />
        <Bar dataKey="Win Probability" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}
