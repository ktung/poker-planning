declare interface Vote {
  room_id: string;
  user_id: string;
  complexity: number | null;
  effort: number | null;
  uncertainty: number | null;
}

declare type VoteType = 'complexity' | 'effort' | 'uncertainty';
