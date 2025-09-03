export interface LotteryInput {
  totalBallots: number
  numWinners: number
  avgBallotsPerPerson: number
  stdDev: number
  numChannels: number
  numSimulations: number
  yourBallots: number
}

export interface WinnerProfile {
  [ballotRange: string]: number
}

export interface LotteryResult {
  probabilityOfWinning: { [ballots: number]: number }
  probabilityRateOfChange: { [ballots: number]: number }
  winnerProfile: WinnerProfile
  avgBallotsPerWinner: number
  medianBallotsPerWinner: number
  modeBallotsPerWinner: number
  channelAnalysis: { [channel: number]: {
    youWonCount: number;
    totalWinners: number;
  } }
  youWinCount: number
  totalPeopleInPool: number
}

function randomNormal(mean: number, stdDev: number): number {
  let u1 = 0,
    u2 = 0
  //Convert [0,1) to (0,1)
  while (u1 === 0) u1 = Math.random()
  while (u2 === 0) u2 = Math.random()
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
  return z * stdDev + mean
}

export const runLotterySimulation = (input: LotteryInput): Promise<LotteryResult> => {
  return new Promise((resolve) => {
    const { totalBallots, numWinners, avgBallotsPerPerson, stdDev, numSimulations, yourBallots, numChannels } = input;

    const allWinnerBallots: number[] = [];
    const winCounts: { [ballots: number]: number } = {};
    let overallYouWonCount = 0;
    const channelAnalysis: { [channel: number]: { youWonCount: number; totalWinners: number; } } = {};
    const allPeople: { id: number; ballots: number }[] = [];

    for (let channelIndex = 0; channelIndex < numChannels; channelIndex++) {
      const channelTotalBallots = Math.floor(totalBallots / numChannels);
      const channelNumWinners = Math.floor(numWinners / numChannels);
      
      let yourBallotsInChannel = 0;
      if (yourBallots > 0) {
        const baseYourBallotsPerChannel = Math.floor(yourBallots / numChannels);
        const remainderYourBallots = yourBallots % numChannels;
        yourBallotsInChannel = baseYourBallotsPerChannel + (channelIndex < remainderYourBallots ? 1 : 0);
        if (yourBallotsInChannel === 0) { // Ensure at least 1 ballot if you have any
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

      for (let i = 0; i < numPeopleInChannel; i++) {
        const ballots = Math.max(1, Math.round(randomNormal(avgBallotsPerPerson, stdDev)));
        const person = { id: i, ballots };
        people.push(person);
        peopleMap.set(i, person);
        allPeople.push(person);
      }

      let ballotPool: number[] = [];
      for (const person of people) {
        for (let i = 0; i < person.ballots; i++) {
          ballotPool.push(person.id);
        }
      }

      // Adjust ballotPool to exactly channelTotalBallots
      if (ballotPool.length > channelTotalBallots) {
        while (ballotPool.length > channelTotalBallots) {
          const randomIndex = Math.floor(Math.random() * ballotPool.length);
          ballotPool.splice(randomIndex, 1);
        }
      } else if (ballotPool.length < channelTotalBallots) {
        while (ballotPool.length < channelTotalBallots) {
          const randomIndex = Math.floor(Math.random() * ballotPool.length);
          ballotPool.push(ballotPool[randomIndex]);
        }
      }

      let channelYouWonCount = 0;
      let channelTotalWinners = 0;

      for (let i = 0; i < numSimulations; i++) {
        const winners = new Set<number>();
        let attempts = 0;
        while (winners.size < channelNumWinners && attempts < ballotPool.length * 2) {
          const winningBallotIndex = Math.floor(Math.random() * ballotPool.length);
          const winnerId = ballotPool[winningBallotIndex];
          if (!winners.has(winnerId)) {
            winners.add(winnerId);
            channelTotalWinners++;
            if (yourId !== null && winnerId === yourId) {
              channelYouWonCount++;
            }
            const winner = peopleMap.get(winnerId);
            if (winner) {
              allWinnerBallots.push(winner.ballots);
              winCounts[winner.ballots] = (winCounts[winner.ballots] || 0) + 1;
            }
          }
          attempts++;
        }
      }
      channelAnalysis[channelIndex] = { youWonCount: channelYouWonCount, totalWinners: channelTotalWinners };
      if (yourId !== null) {
        overallYouWonCount += channelYouWonCount;
      }
    }

    // 4. Aggregate Results (overall)
    const probabilityOfWinning: { [ballots: number]: number } = {};
    for (const ballotCount in winCounts) {
      const count = parseInt(ballotCount, 10);
      const numPeopleWithThisCount = allPeople.filter(p => p.ballots === count).length;
      if (numPeopleWithThisCount > 0) {
        probabilityOfWinning[count] = (winCounts[count] / numSimulations) / numPeopleWithThisCount;
      }
    }

    const probabilityRateOfChange: { [ballots: number]: number } = {};
    const sortedBallotCounts = Object.keys(probabilityOfWinning).map(Number).sort((a, b) => a - b);

    for (let i = 1; i < sortedBallotCounts.length; i++) {
      const currentBallots = sortedBallotCounts[i];
      const previousBallots = sortedBallotCounts[i - 1];
      const change = probabilityOfWinning[currentBallots] - probabilityOfWinning[previousBallots];
      probabilityRateOfChange[currentBallots] = change;
    }

    const avgBallotsPerWinner = allWinnerBallots.reduce((a, b) => a + b, 0) / allWinnerBallots.length;
    const medianBallotsPerWinner = calculateMedian(allWinnerBallots);
    const modeBallotsPerWinner = calculateMode(allWinnerBallots);
    const stdDevBallotsPerWinner = calculateStandardDeviation(allWinnerBallots);

    // Dynamic Winner Profile
    const profileMean = avgBallotsPerWinner;
    const profileStdDev = stdDevBallotsPerWinner;
    const minBallots = Math.max(1, Math.floor(profileMean - 3 * profileStdDev));
    const maxBallots = Math.ceil(profileMean + 3 * profileStdDev);
    const numBins = 20; // More granular bins
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

    const result: LotteryResult = {
      probabilityOfWinning,
      probabilityRateOfChange,
      winnerProfile: dynamicWinnerProfile,
      avgBallotsPerWinner,
      medianBallotsPerWinner,
      modeBallotsPerWinner,
      channelAnalysis,
      youWinCount: overallYouWonCount,
      totalPeopleInPool: Math.floor(totalBallots / avgBallotsPerPerson) + (yourBallots > 0 ? 1 : 0),
    };

    resolve(result);
  });
};

function calculateMedian(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculateMode(arr: number[]): number {
  if (arr.length === 0) return 0;
  const modeMap: { [key: number]: number } = {};
  let maxCount = 0;
  let modes: number[] = [];

  arr.forEach(el => {
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
