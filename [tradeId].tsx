import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';

export default function RateTrade() {
  const router = useRouter();
  const { tradeId } = router.query as { tradeId: string };

  const [cleanliness, setCleanliness] = useState(5);
  const [puzzleReady, setPuzzleReady] = useState(5);
  const [piecesIncluded, setPiecesIncluded] = useState<'yes'|'no'|'unknown'>('yes');
  const [shipSpeed, setShipSpeed] = useState(5);
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tradeId) return;
  }, [tradeId]);

  async function submit() {
    setMsg(null);
    setLoading(true);

    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setLoading(false); return setMsg('Please log in.'); }

    const { data: trade } = await supabase.from('trades').select('*').eq('id', tradeId).single();
    if (!trade) { setLoading(false); return setMsg('Trade not found.'); }

    // Rater is current user; ratee is the other party.
    const rateeId = trade.requester_id === u.user.id ? trade.responder_id : trade.requester_id;

    const { error } = await supabase.from('ratings').insert({
      trade_id: tradeId,
      rater_id: u.user.id,
      ratee_id: rateeId,
      cleanliness,
      puzzle_ready: puzzleReady,
      pieces_included: piecesIncluded,
      ship_speed: shipSpeed,
      comment: comment || null
    });

    setLoading(false);
    if (error) return setMsg(error.message);
    router.push(`/trades/${tradeId}`);
  }

  return (
    <Layout title="Rate trade — SwapMyPuzzle">
      <div className="card" style={{maxWidth:720, margin:'0 auto'}}>
        <h2 className="cardTitle">Rate the puzzle you received</h2>
        <p className="muted">Be honest, be kind, and remember: sometimes a missing piece is just your cat’s retirement plan.</p>

        <div className="row" style={{flexDirection:'column'}}>
          <label className="muted">Cleanliness (1–5)</label>
          <input className="input" type="number" min={1} max={5} value={cleanliness} onChange={(e)=>setCleanliness(Number(e.target.value))} />

          <label className="muted">Puzzle-ready (1–5) — not taped into chunks</label>
          <input className="input" type="number" min={1} max={5} value={puzzleReady} onChange={(e)=>setPuzzleReady(Number(e.target.value))} />

          <label className="muted">All pieces included?</label>
          <select className="select" value={piecesIncluded} onChange={(e)=>setPiecesIncluded(e.target.value as any)}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="unknown">Unknown</option>
          </select>

          <label className="muted">Shipped on time (1–5)</label>
          <input className="input" type="number" min={1} max={5} value={shipSpeed} onChange={(e)=>setShipSpeed(Number(e.target.value))} />

          <label className="muted">Comment (optional)</label>
          <textarea className="textarea" rows={4} value={comment} onChange={(e)=>setComment(e.target.value)} />

          <button className="btn btnOrange" disabled={loading} onClick={submit}>{loading ? 'Submitting…' : 'Submit rating'}</button>
          {msg && <div className="muted">{msg}</div>}
        </div>
      </div>
    </Layout>
  );
}
