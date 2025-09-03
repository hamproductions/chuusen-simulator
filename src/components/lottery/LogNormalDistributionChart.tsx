import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { LogNormal } from '@stdlib/stats-base-dists-lognormal';

interface LogNormalDistributionChartProps {
  mean: number;
  stdDev: number;
}

export function LogNormalDistributionChart({ mean, stdDev }: LogNormalDistributionChartProps) {
  // Calculate mu and sigma of the underlying normal distribution
  // from the mean and standard deviation of the log-normal distribution
  const variance = stdDev * stdDev;
  const mu = Math.log(mean / Math.sqrt(1 + variance / (mean * mean)));
  const sigma = Math.sqrt(Math.log(1 + variance / (mean * mean)));

  const data = [];
  // Generate data points for the chart
  // We'll go from a small value up to a reasonable max, e.g., 3 standard deviations from the mean of the log-normal distribution
  // The mean of the log-normal distribution is exp(mu + sigma^2 / 2)
  const logNormalMeanValue = Math.exp(mu + Math.pow(sigma, 2) / 2);
  const maxVal = Math.max(10, logNormalMeanValue * 3); // Ensure a reasonable range

  for (let x = 0.1; x <= maxVal; x += maxVal / 100) {
    // Generate 100 points
    data.push({
      ballots: parseFloat(x.toFixed(2)),
      density: new LogNormal(mu, sigma).pdf(x)
    });
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="ballots"
          label={{ value: 'Number of Ballots', position: 'insideBottom', offset: 0 }}
        />
        <YAxis
          label={{ value: 'Log-Normal Probability Density', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip />
        <Line type="monotone" dataKey="density" dot={false} stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
