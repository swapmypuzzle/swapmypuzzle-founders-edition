export type Puzzle = {
  id: string;
  owner_id: string;
  title: string;
  brand: string | null;
  pieces: number | null;
  theme: string | null;
  condition: string | null;
  missing_pieces: string | null;
  notes: string | null;
  created_at: string;
  cover_url: string | null;
};

export type Trade = {
  id: string;
  requester_id: string;
  responder_id: string;
  requested_puzzle_id: string;
  offered_puzzle_id: string;
  status: 'pending'|'accepted'|'declined'|'countered'|'shipped'|'delivered'|'completed';
  requester_tracking: string | null;
  responder_tracking: string | null;
  ship_by: string | null;
  created_at: string;
};
