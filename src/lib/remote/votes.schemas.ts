export interface VoteStats {
  teamMean: number | null;
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
export const defaultVoteStats: VoteStats = {
  teamMean: null,
  teamRecommendedValue: null,
  teamMin: { value: null, usernames: [] },
  teamMax: { value: null, usernames: [] },
  complexityRecommandation: null,
  effortRecommandation: null,
  uncertaintyRecommandation: null
};
