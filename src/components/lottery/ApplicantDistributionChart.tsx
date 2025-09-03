import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import type { WinnerProfile } from '~/lib/lottery';

interface ApplicantDistributionChartProps {
  data: WinnerProfile;
}

export function ApplicantDistributionChart(props: ApplicantDistributionChartProps) {
  const { t } = useTranslation();
  const chartData = Object.entries(props.data).map(([range, count]) => ({
    range,
    count
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip
          formatter={(value: number) => [
            `${value.toFixed(2)}%`,
            t('lotterySimulator.results.percentage')
          ]}
        />
        <Bar dataKey="count" fill="var(--colors-accent-default)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
