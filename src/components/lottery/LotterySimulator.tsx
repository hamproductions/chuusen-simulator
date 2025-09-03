import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WinnerProfileChart } from './WinnerProfileChart';
import { WinningProbabilityChart } from './WinningProbabilityChart';
import { ProbabilityRateOfChangeChart } from './ProbabilityRateOfChangeChart';
import { LogNormalDistributionChart } from './LogNormalDistributionChart';
import { Button } from '~/components/ui/button';
import { Field } from '~/components/ui/field';
import { Fieldset } from '~/components/ui/fieldset';
import { NumberInput } from '~/components/ui/number-input';
import { Heading } from '~/components/ui/heading';
import { Box, HStack, Stack } from 'styled-system/jsx';
import type { LotteryInput, LotteryResult } from '~/lib/lottery';
import { runLotterySimulation } from '~/lib/lottery';
import { Spinner } from '~/components/ui/spinner';
import { Text } from '~/components/ui/text';
import { useLocalStorage } from '~/hooks/useLocalStorage';
import { Badge } from '~/components/ui/badge';

const defaultInputs: LotteryInput = {
  totalBallots: 1000000,
  numWinners: 100,
  avgBallotsPerPerson: 10,
  stdDev: 1.5,
  numChannels: 1,
  numSimulations: 10000,
  yourBallots: 1
};

export function LotterySimulator() {
  const { t } = useTranslation();
  const [inputs, setInputs] = useLocalStorage<LotteryInput>(
    'lotterySimulatorInputs',
    defaultInputs
  );
  const [result, setResult] = useState<LotteryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentInputs = inputs ?? defaultInputs;

  const handleInputChange = (field: keyof LotteryInput, value: number) => {
    setInputs((prev) => ({ ...(prev ?? defaultInputs), [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    try {
      const res = await runLotterySimulation(currentInputs);
      setResult(res);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={{ base: '4', md: '6' }}>
      <Heading as="h2" size="2xl" mb="4">
        {t('lotterySimulator.title')}
      </Heading>
      <form onSubmit={(...a) => void handleSubmit(...a)}>
        <Box
          display={{ base: 'block', md: 'grid' }}
          gap="6"
          gridTemplateColumns={{ md: 'repeat(2, 1fr)' }}
        >
          <Fieldset.Root>
            <Fieldset.Legend>{t('lotterySimulator.form.lotterySetup')}</Fieldset.Legend>
            <Stack>
              <Field.Root>
                <Field.Label>{t('lotterySimulator.form.totalBallotsSold')}</Field.Label>
                <NumberInput
                  min={1}
                  value={String(currentInputs.totalBallots)}
                  onValueChange={(e) => handleInputChange('totalBallots', e.valueAsNumber)}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>{t('lotterySimulator.form.numberOfWinners')}</Field.Label>
                <NumberInput
                  min={1}
                  value={String(currentInputs.numWinners)}
                  onValueChange={(e) => handleInputChange('numWinners', e.valueAsNumber)}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>{t('lotterySimulator.form.numberOfChannels')}</Field.Label>
                <NumberInput
                  min={1}
                  value={String(currentInputs.numChannels)}
                  onValueChange={(e) => handleInputChange('numChannels', e.valueAsNumber)}
                />
              </Field.Root>
            </Stack>
          </Fieldset.Root>

          <Fieldset.Root mt="6">
            <Fieldset.Legend>{t('lotterySimulator.form.participantBehavior')}</Fieldset.Legend>
            <Stack>
              <Field.Root>
                <Field.Label>{t('lotterySimulator.form.averageBallotsPerPerson')}</Field.Label>
                <NumberInput
                  min={1}
                  value={String(currentInputs.avgBallotsPerPerson)}
                  onValueChange={(e) => handleInputChange('avgBallotsPerPerson', e.valueAsNumber)}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>{t('lotterySimulator.form.standardDeviation')}</Field.Label>
                <NumberInput
                  step={0.1}
                  min={0.1}
                  value={String(currentInputs.stdDev)}
                  onValueChange={(e) => handleInputChange('stdDev', e.valueAsNumber)}
                />
              </Field.Root>
            </Stack>
          </Fieldset.Root>

          <Fieldset.Root mt="6">
            <Fieldset.Legend>{t('lotterySimulator.form.simulationControl')}</Fieldset.Legend>
            <Stack>
              <Field.Root>
                <Field.Label>{t('lotterySimulator.form.numberOfSimulationRuns')}</Field.Label>
                <NumberInput
                  min={1}
                  max={100000}
                  value={String(currentInputs.numSimulations)}
                  onValueChange={(e) => handleInputChange('numSimulations', e.valueAsNumber)}
                />
              </Field.Root>
            </Stack>
          </Fieldset.Root>

          <Fieldset.Root mt="6">
            <Fieldset.Legend>{t('lotterySimulator.form.yourParticipation')}</Fieldset.Legend>
            <Stack>
              <Field.Root>
                <Field.Label>{t('lotterySimulator.form.yourBallots')}</Field.Label>
                <NumberInput
                  min={1}
                  value={String(currentInputs.yourBallots)}
                  onValueChange={(e) => handleInputChange('yourBallots', e.valueAsNumber)}
                />
              </Field.Root>
            </Stack>
          </Fieldset.Root>
        </Box>
        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading ? <Spinner /> : t('lotterySimulator.form.runSimulation')}
        </Button>
      </form>

      <Box mt="8">
        <Heading as="h4" size="lg" mb="2">
          {t('lotterySimulator.results.distributionVisualized')}
        </Heading>
        <LogNormalDistributionChart
          mean={currentInputs.avgBallotsPerPerson}
          stdDev={currentInputs.stdDev}
        />
      </Box>

      {result && (
        <Box mt="8">
          <Heading as="h3" size="xl" mb="4">
            {t('lotterySimulator.results.simulationResults')}
          </Heading>
          <Text mb="6">{t('lotterySimulator.results.simulationResultsDescription')}</Text>
          <Box
            display={{ base: 'block', md: 'grid' }}
            gap="6"
            gridTemplateColumns={{ md: 'repeat(2, 1fr)' }}
          >
            <Box>
              <Heading as="h4" size="lg" mb="2">
                {t('lotterySimulator.results.yourResult')}
              </Heading>
              <Badge size="lg" variant="outline">
                {t('lotterySimulator.results.youWon', { count: result.youWinCount })}
              </Badge>
              <Badge size="md" variant="outline">
                {t('lotterySimulator.results.totalPeopleInPool', {
                  count: result.totalPeopleInPool
                })}
              </Badge>
              <Badge size="md" variant="outline">
                {t('lotterySimulator.results.probabilityOfYourWin', {
                  percentage: ((result.youWinCount / currentInputs.numSimulations) * 100).toFixed(2)
                })}
              </Badge>
              <Badge size="md" variant="outline">
                {t('lotterySimulator.results.expectedWins', {
                  count: (
                    (currentInputs.yourBallots / currentInputs.totalBallots) *
                    currentInputs.numWinners *
                    currentInputs.numSimulations
                  ).toFixed(2)
                })}
              </Badge>
            </Box>

            <Box>
              <Heading as="h4" size="lg" mb="2">
                {t('lotterySimulator.results.lotteryOverview')}
              </Heading>
              <HStack gap="8">
                <Box>
                  <Text fontWeight="bold">{t('lotterySimulator.results.totalBallots')}</Text>
                  <Badge size="md" variant="outline">
                    {currentInputs.totalBallots}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold">{t('lotterySimulator.results.numberOfWinners')}</Text>
                  <Badge size="md" variant="outline">
                    {currentInputs.numWinners}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold">{t('lotterySimulator.results.simulationsRun')}</Text>
                  <Badge size="md" variant="outline">
                    {currentInputs.numSimulations}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold">
                    {t('lotterySimulator.results.winningChancePerBallot')}
                  </Text>
                  <Badge size="md" variant="outline">
                    {((currentInputs.numWinners / currentInputs.totalBallots) * 100).toFixed(4)}%
                  </Badge>
                </Box>
              </HStack>
            </Box>

            <Box>
              <Heading as="h4" size="lg" mb="2">
                {t('lotterySimulator.results.winnerProfile')}
              </Heading>
              <WinnerProfileChart data={result.winnerProfile} />
            </Box>

            <Box>
              <Heading as="h4" size="lg" mb="2">
                {t('lotterySimulator.results.winnerStatistics')}
              </Heading>
              <HStack gap="8">
                <Box>
                  <Text fontWeight="bold">{t('lotterySimulator.results.averageBallots')}</Text>
                  <Badge size="md" variant="outline">
                    {result.avgBallotsPerWinner.toFixed(2)}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold">{t('lotterySimulator.results.medianBallots')}</Text>
                  <Badge size="md" variant="outline">
                    {result.medianBallotsPerWinner}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold">{t('lotterySimulator.results.modeBallots')}</Text>
                  <Badge size="md" variant="outline">
                    {result.modeBallotsPerWinner}
                  </Badge>
                </Box>
              </HStack>
            </Box>

            <Box>
              <Heading as="h4" size="lg" mb="2">
                {t('lotterySimulator.results.probabilityOfWinning')}
              </Heading>
              <WinningProbabilityChart data={result.probabilityOfWinning} />
            </Box>

            <Box>
              <Heading as="h4" size="lg" mb="2">
                {t('lotterySimulator.results.probabilityRateOfChange')}
              </Heading>
              <ProbabilityRateOfChangeChart data={result.probabilityRateOfChange} />
            </Box>

            {Object.keys(result.channelAnalysis).length > 1 && (
              <Box>
                <Heading as="h4" size="lg" mb="2">
                  {t('lotterySimulator.results.channelAnalysis')}
                </Heading>
                <Stack gap="2" alignItems="stretch">
                  {Object.entries(result.channelAnalysis).map(([channelIndex, data]) => (
                    <Box key={channelIndex} borderRadius="md" borderWidth="1px" p="3">
                      <Text fontWeight="bold">
                        {t('lotterySimulator.results.channel', {
                          index: parseInt(channelIndex) + 1
                        })}
                      </Text>
                      <Text>
                        {t('lotterySimulator.results.yourWins', { count: data.youWonCount })}
                      </Text>
                      <Text>
                        {t('lotterySimulator.results.totalWinners', { count: data.totalWinners })}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
