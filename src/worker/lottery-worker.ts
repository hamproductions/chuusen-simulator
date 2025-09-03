import type { LotteryInput, LotteryResult, WinnerProfile } from '~/lib/lottery';

/**
 * Generates a single lognormal distributed random number with a given mean and standard deviation.
 * @param {number} lognormalMean - The desired mean of the final lognormal distribution.
 * @param {number} lognormalStdDev - The desired standard deviation of the final lognormal distribution.
 * @returns {number} A lognormal random number.
 */
function lognormalFromStats(lognormalMean: number, lognormalStdDev: number) {
  // 1. Calculate the variance of the lognormal distribution.
  const lognormalVariance = lognormalStdDev ** 2;

  // 2. Convert the lognormal mean and variance to the underlying normal parameters (mu and sigma).
  const mu = Math.log(lognormalMean ** 2 / Math.sqrt(lognormalVariance + lognormalMean ** 2));
  const sigma = Math.sqrt(Math.log(lognormalVariance / lognormalMean ** 2 + 1));

  // 3. Generate a standard normal random number using the Box-Muller transform.
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  // 4. Scale and shift the standard normal number to the desired mu and sigma.
  const normalRandom = mu + sigma * z;

  // 5. Take the exponent to get the final lognormal random number.
  return Math.exp(normalRandom);
}

export const runLotterySimulation = (input: LotteryInput): Promise<LotteryResult> => {
  return new Promise((resolve) => {
    const {
      totalBallots,
      numWinners,
      avgBallotsPerPerson,
      stdDev,
      numSimulations,
      yourBallots,
      numChannels
    } = input;

    const allWinnerBallots: number[] = [];
    const winCounts: { [ballots: number]: number } = {};
    let overallYouWonCount = 0;
    const channelAnalysis: { [channel: number]: { youWonCount: number; totalWinners: number } } =
      {};
    const allPeopleBallotsInSimulations: number[] = [];

    let lastReportedProgress = 0;
    const simulationPhaseWeight = 0.9; // 90% of total progress
    // const aggregationPhaseWeight = 0.1; // 10% of total progress

    for (let i = 0; i < numSimulations; i++) {
      if (shouldTerminate) {
        postMessage({ type: 'cancelled' });
        resolve({} as LotteryResult); // Resolve the promise immediately on cancellation
        return;
      }
      for (let channelIndex = 0; channelIndex < numChannels; channelIndex++) {
        const channelTotalBallots = Math.floor(totalBallots / numChannels);
        const channelNumWinners = Math.floor(numWinners / numChannels);

        let yourBallotsInChannel = 0;
        if (yourBallots > 0) {
          const baseYourBallotsPerChannel = Math.floor(yourBallots / numChannels);
          const remainderYourBallots = yourBallots % numChannels;
          yourBallotsInChannel =
            baseYourBallotsPerChannel + (channelIndex < remainderYourBallots ? 1 : 0);
          if (yourBallotsInChannel === 0) {
            // Ensure at least 1 ballot if you have any
            yourBallotsInChannel = 1;
          }
        }

        const totalBallotsForOthersInChannel = channelTotalBallots - yourBallotsInChannel;
        const numPeopleInChannel = Math.floor(totalBallotsForOthersInChannel / avgBallotsPerPerson);

        const people: { id: number; ballots: number }[] = [];
        const peopleMap = new Map<number, { id: number; ballots: number }>();
        let yourId: number | null = null;

        // Add 'You' as a participant to each channel with a portion of your ballots
        if (yourBallotsInChannel > 0) {
          yourId = -1; // Unique ID for 'You'
          const you = { id: yourId, ballots: yourBallotsInChannel };
          people.push(you);
          peopleMap.set(yourId, you);
        }

        for (let j = 0; j < numPeopleInChannel; j++) {
          const ballots = Math.max(1, Math.round(lognormalFromStats(avgBallotsPerPerson, stdDev)));
          const person = { id: j, ballots };
          people.push(person);
          peopleMap.set(j, person);
          allPeopleBallotsInSimulations.push(ballots);
        }

        const ballotPool: number[] = [];
        for (const person of people) {
          for (let k = 0; k < person.ballots; k++) {
            ballotPool.push(person.id);
          }
        }

        // Adjust ballotPool to exactly channelTotalBallots
        if (ballotPool.length > channelTotalBallots) {
          // Fisher-Yates shuffle to randomly select elements to keep
          for (let k = ballotPool.length - 1; k > 0; k--) {
            const j = Math.floor(Math.random() * (k + 1));
            [ballotPool[k], ballotPool[j]] = [ballotPool[j], ballotPool[k]]; // Swap
          }
          ballotPool.length = channelTotalBallots; // Truncate to desired size
        } else if (ballotPool.length < channelTotalBallots) {
          while (ballotPool.length < channelTotalBallots) {
            const randomIndex = Math.floor(Math.random() * ballotPool.length);
            ballotPool.push(ballotPool[randomIndex]);
          }
        }

        const winners = new Set<number>();
        let attempts = 0;
        while (winners.size < channelNumWinners && attempts < ballotPool.length * 2) {
          const winningBallotIndex = Math.floor(Math.random() * ballotPool.length);
          const winnerId = ballotPool[winningBallotIndex];
          if (!winners.has(winnerId)) {
            winners.add(winnerId);
            if (yourId !== null && winnerId === yourId) {
              overallYouWonCount++;
            }
            const winner = peopleMap.get(winnerId);
            if (winner) {
              allWinnerBallots.push(winner.ballots);
              winCounts[winner.ballots] = (winCounts[winner.ballots] || 0) + 1;
            }
          }
          attempts++;
        }
        // Aggregate channel analysis per simulation run
        channelAnalysis[channelIndex] = {
          youWonCount:
            (channelAnalysis[channelIndex]?.youWonCount || 0) +
            (yourId !== null && winners.has(yourId) ? 1 : 0),
          totalWinners: (channelAnalysis[channelIndex]?.totalWinners || 0) + winners.size
        };
      }

      const currentSimulationProgress = Math.floor(((i + 1) / numSimulations) * 100);
      const overallProgress = Math.floor(currentSimulationProgress * simulationPhaseWeight);

      if (overallProgress > lastReportedProgress) {
        postMessage({ type: 'progress', value: overallProgress });
        lastReportedProgress = overallProgress;
      }
    }

    // 4. Aggregate Results (overall)
    const probabilityOfWinning: { [ballots: number]: number } = {};
    // Calculate total number of people generated across all simulations for each ballot count
    const totalPeopleCountByBallots: { [ballots: number]: number } = {};
    allPeopleBallotsInSimulations.forEach((ballots) => {
      totalPeopleCountByBallots[ballots] = (totalPeopleCountByBallots[ballots] || 0) + 1;
    });

    for (const ballotCount in winCounts) {
      const count = parseInt(ballotCount, 10);
      // Divide by numSimulations because winCounts accumulates wins over all simulations
      // Divide by totalPeopleCountByBallots[count] to get probability per person with that ballot count
      if (totalPeopleCountByBallots[count] > 0) {
        probabilityOfWinning[count] = winCounts[count] / totalPeopleCountByBallots[count];
      }
    }

    const probabilityRateOfChange: { [ballots: number]: number } = {};
    const sortedBallotCounts = Object.keys(probabilityOfWinning)
      .map(Number)
      .sort((a, b) => a - b);

    for (let i = 1; i < sortedBallotCounts.length; i++) {
      const currentBallots = sortedBallotCounts[i];
      const previousBallots = sortedBallotCounts[i - 1];
      const change = probabilityOfWinning[currentBallots] - probabilityOfWinning[previousBallots];
      probabilityRateOfChange[currentBallots] = change;
    }

    const avgBallotsPerWinner =
      allWinnerBallots.reduce((a, b) => a + b, 0) / allWinnerBallots.length;
    const medianBallotsPerWinner = calculateMedian(allWinnerBallots);
    const modeBallotsPerWinner = calculateMode(allWinnerBallots);
    const stdDevBallotsPerWinner = calculateStandardDeviation(allWinnerBallots);

    // Dynamic Winner Profile
    const profileMean = avgBallotsPerWinner;
    const profileStdDev = stdDevBallotsPerWinner;
    const minBallots = Math.max(1, Math.floor(profileMean - 3 * profileStdDev));
    const maxBallots = Math.ceil(profileMean + 2 * profileStdDev);
    const numBins = 50; // More granular bins
    const binSize = Math.max(1, Math.round((maxBallots - minBallots) / numBins));

    const dynamicWinnerProfile: WinnerProfile = {};
    for (let i = 0; i < numBins; i++) {
      const lowerBound = minBallots + i * binSize;
      const upperBound = lowerBound + binSize - 1;
      const rangeKey = `${lowerBound}-${upperBound}`;
      dynamicWinnerProfile[rangeKey] = 0;
    }

    for (const ballots of allWinnerBallots) {
      let assigned = false;
      for (let i = 0; i < numBins; i++) {
        const lowerBound = minBallots + i * binSize;
        const upperBound = lowerBound + binSize - 1;
        if (ballots >= lowerBound && ballots <= upperBound) {
          const rangeKey = `${lowerBound}-${upperBound}`;
          dynamicWinnerProfile[rangeKey] = (dynamicWinnerProfile[rangeKey] || 0) + 1;
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        if (ballots < minBallots) {
          const firstBinKey = `${minBallots}-${minBallots + binSize - 1}`;
          dynamicWinnerProfile[firstBinKey] = (dynamicWinnerProfile[firstBinKey] || 0) + 1;
        } else if (ballots > maxBallots) {
          const lastBinKey = `${minBallots + (numBins - 1) * binSize}-${maxBallots}`;
          dynamicWinnerProfile[lastBinKey] = (dynamicWinnerProfile[lastBinKey] || 0) + 1;
        }
      }
    }

    // Normalize dynamic profile
    for (const range in dynamicWinnerProfile) {
      dynamicWinnerProfile[range] = (dynamicWinnerProfile[range] / allWinnerBallots.length) * 100;
    }

    // Calculate Applicant Distribution
    const applicantDistribution: WinnerProfile = {};
    if (allPeopleBallotsInSimulations.length > 0) {
      let minApplicantBallots = allPeopleBallotsInSimulations[0];
      let maxApplicantBallots = allPeopleBallotsInSimulations[0];
      for (const ballots of allPeopleBallotsInSimulations) {
        if (ballots < minApplicantBallots) {
          minApplicantBallots = ballots;
        }
        if (ballots > maxApplicantBallots) {
          maxApplicantBallots = ballots;
        }
      }
      const numApplicantBins = 50;
      const applicantBinSize = Math.max(
        1,
        Math.round((maxApplicantBallots - minApplicantBallots) / numApplicantBins)
      );

      for (let i = 0; i < numApplicantBins; i++) {
        const lowerBound = Math.max(0, minApplicantBallots + i * applicantBinSize);
        const upperBound = Math.max(0, lowerBound + applicantBinSize - 1);
        const rangeKey = `${lowerBound}-${upperBound}`;
        applicantDistribution[rangeKey] = 0;
      }

      for (const ballots of allPeopleBallotsInSimulations) {
        let assigned = false;
        for (let i = 0; i < numApplicantBins; i++) {
          const lowerBound = minApplicantBallots + i * applicantBinSize;
          const upperBound = lowerBound + applicantBinSize - 1;
          if (ballots >= lowerBound && ballots <= upperBound) {
            const rangeKey = `${lowerBound}-${upperBound}`;
            applicantDistribution[rangeKey] = (applicantDistribution[rangeKey] || 0) + 1;
            assigned = true;
            break;
          }
        }
        if (!assigned) {
          if (ballots < minApplicantBallots) {
            const firstBinKey = `${minApplicantBallots}-${minApplicantBallots + applicantBinSize - 1}`;
            applicantDistribution[firstBinKey] = (applicantDistribution[firstBinKey] || 0) + 1;
          } else if (ballots > maxApplicantBallots) {
            const lastBinKey = `${minApplicantBallots + (numApplicantBins - 1) * applicantBinSize}-${maxApplicantBallots}`;
            applicantDistribution[lastBinKey] = (applicantDistribution[lastBinKey] || 0) + 1;
          }
        }
      }

      // Normalize applicant distribution
      for (const range in applicantDistribution) {
        applicantDistribution[range] =
          (applicantDistribution[range] / allPeopleBallotsInSimulations.length) * 100;
      }
    }

    const result: LotteryResult = {
      probabilityOfWinning,
      probabilityRateOfChange,
      winnerProfile: dynamicWinnerProfile,
      applicantDistribution,
      avgBallotsPerWinner,
      medianBallotsPerWinner,
      modeBallotsPerWinner,
      channelAnalysis,
      youWinCount: overallYouWonCount,
      totalPeopleInPool: Math.floor(totalBallots / avgBallotsPerPerson) + (yourBallots > 0 ? 1 : 0)
    };

    console.log(result);
    resolve(result);
  });
};

function quickSelect(arr: number[], k: number): number {
  if (arr.length === 0) return 0;

  const partition = (low: number, high: number): number => {
    const pivot = arr[high];
    let i = low;
    for (let j = low; j < high; j++) {
      if (arr[j] <= pivot) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        i++;
      }
    }
    [arr[i], arr[high]] = [arr[high], arr[i]];
    return i;
  };

  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const pivotIndex = partition(low, high);
    if (pivotIndex === k) {
      return arr[pivotIndex];
    } else if (pivotIndex < k) {
      low = pivotIndex + 1;
    } else {
      high = pivotIndex - 1;
    }
  }
  return -1; // Should not happen if k is valid
}

function calculateMedian(arr: number[]): number {
  if (arr.length === 0) return 0;
  const mid = Math.floor(arr.length / 2);
  if (arr.length % 2 !== 0) {
    return quickSelect([...arr], mid);
  } else {
    const val1 = quickSelect([...arr], mid - 1);
    const val2 = quickSelect([...arr], mid);
    return (val1 + val2) / 2;
  }
}

function calculateMode(arr: number[]): number {
  if (arr.length === 0) return 0;
  const modeMap: { [key: number]: number } = {};
  let maxCount = 0;
  let modes: number[] = [];

  arr.forEach((el) => {
    modeMap[el] = (modeMap[el] || 0) + 1;
    if (modeMap[el] > maxCount) {
      maxCount = modeMap[el];
      modes = [el];
    } else if (modeMap[el] === maxCount) {
      modes.push(el);
    }
  });

  return modes[0]; // Return the first mode if multiple
}

function calculateStandardDeviation(arr: number[]): number {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
  const variance = arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

let shouldTerminate = false;

onmessage = async (e: MessageEvent) => {
  const { type, input } = e.data;

  if (type === 'cancel') {
    shouldTerminate = true;
    return;
  }

  try {
    shouldTerminate = false; // Reset flag for new simulations
    const result = await runLotterySimulation(input);
    postMessage({ type: 'success', result });
  } catch (error) {
    postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
};
