export interface VoteStats {
  teamMean: number;
  teamRecommendedValue: number | null;
  teamMin: {
    value: number | null;
    usernames: string[];
  };
  teamMax: {
    value: number | null;
    usernames: string[];
  };
  complexityRecommandation: number | null;
  effortRecommandation: number | null;
  uncertaintyRecommandation: number | null;
}
