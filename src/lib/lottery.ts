export interface LotteryInput {
  totalBallots: number;
  numWinners: number;
  avgBallotsPerPerson: number;
  stdDev: number;
  numChannels: number;
  numSimulations: number;
  yourBallots: number;
  yourNumAccounts: number;
}

export interface WinnerProfile {
  [ballotRange: string]: number;
}

export interface LotteryResult {
  probabilityOfWinning: { [ballots: number]: number };
  probabilityRateOfChange: { [ballots: number]: number };
  winnerProfile: WinnerProfile;
  applicantDistribution: WinnerProfile;
  avgBallotsPerWinner: number;
  medianBallotsPerWinner: number;
  modeBallotsPerWinner: number;
  channelAnalysis: {
    [channel: number]: {
      youWonCount: number;
      totalWinners: number;
    };
  };
  youWinCount: number;
  totalPeopleInPool: number;
}
