import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ProbabilityRateOfChangeChartProps {
  data: { [ballots: number]: number };
}

export function ProbabilityRateOfChangeChart({ data }: ProbabilityRateOfChangeChartProps) {
  const chartData = Object.entries(data)
    .map(([ballots, rate]) => ({
      name: `${ballots} ballots`,
      'Rate of Change': rate * 100
    }))
    .sort((a, b) => {
      const aNum = parseInt(a.name, 10);
      const bNum = parseInt(b.name, 10);
      return aNum - bNum;
    });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis unit="%" />
        <Tooltip formatter={(value: number) => `${value.toFixed(4)}%`} />
        <Legend />
        <Line type="monotone" dataKey="Rate of Change" activeDot={{ r: 8 }} stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
