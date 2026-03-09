import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';
import type { Puzzle } from '../../lib/types';
import Link from 'next/link';

type Photo = { id: string; puzzle_id: string; url: string; created_at: string };

export default function PuzzleDetail() {
  const router = useRouter();
  const { id } = router.query as { id: string };

  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [myPuzzles, setMyPuzzles] = useState<Puzzle[]>([]);
  const [offerId, setOfferId] = useState<string>('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setMsg(null);
      const { data } = await supabase.from('puzzles').select('*').eq('id', id).single();
      setPuzzle((data as Puzzle) ?? null);
      const photosRes = await supabase.from('puzzle_photos').select('*').eq('puzzle_id', id).order('created_at');
      setPhotos((photosRes.data as Photo[]) ?? []);

      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        const mine = await supabase.from('puzzles').select('*').eq('owner_id', u.user.id).order('created_at', { ascending: false });
        setMyPuzzles((mine.data as Puzzle[]) ?? []);
      }
    })();
  }, [id]);

  const canPropose = useMemo(() => {
    if (!puzzle) return false;
    return myPuzzles.length > 0;
  }, [puzzle, myPuzzles.length]);

  async function proposeTrade() {
    setMsg(null);
    if (!puzzle) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return setMsg('Please log in to propose a trade.');
    if (!offerId) return setMsg('Pick one of your puzzles to offer.');
    if (u.user.id === puzzle.owner_id) return setMsg('That’s your puzzle. (Nice try.)');

    const { data: profile } = await supabase.from('profiles').select('country').eq('id', u.user.id).single();
    const { data: ownerProfile } = await supabase.from('profiles').select('country').eq('id', puzzle.owner_id).single();
    if ((profile?.country ?? 'US') !== 'US' || (ownerProfile?.country ?? 'US') !== 'US') {
      return setMsg('US-only swaps for now.');
    }

    const shipBy = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase.from('trades').insert({
      requester_id: u.user.id,
      responder_id: puzzle.owner_id,
      requested_puzzle_id: puzzle.id,
      offered_puzzle_id: offerId,
      status: 'pending',
      ship_by: shipBy
    }).select('*').single();

    if (error || !data) return setMsg(error?.message ?? 'Could not create trade');
    router.push(`/trades/${data.id}`);
  }

  if (!puzzle) {
    return (
      <Layout title="Puzzle — SwapMyPuzzle">
        <p className="muted">Loading…</p>
      </Layout>
    );
  }

  return (
    <Layout title={`${puzzle.title} — SwapMyPuzzle`}>
      <div className="grid">
        <div className="card" style={{gridColumn:'span 7'}}>
          <h2 className="cardTitle">{puzzle.title}</h2>
          <div className="muted">{puzzle.pieces ? `${puzzle.pieces} pieces` : 'Pieces unknown'} · {puzzle.brand ?? 'Brand unknown'} · {puzzle.condition ?? 'Condition unknown'}</div>
          <div className="kpi" style={{marginTop:10}}>
            <div className="chip">Missing: {puzzle.missing_pieces ?? 'Not specified'}</div>
            <div className="chip">Theme: {puzzle.theme ?? '—'}</div>
          </div>
          {puzzle.notes && <p className="muted" style={{marginTop:10, whiteSpace:'pre-wrap'}}>{puzzle.notes}</p>}

          <div className="card" style={{marginTop:12}}>
            <div className="cardTitle">Photos</div>
            {photos.length === 0 ? (
              <div className="muted">No photos yet.</div>
            ) : (
              <div className="row" style={{flexWrap:'wrap'}}>
                {photos.map(ph => (
                  <a key={ph.id} className="chip" href={ph.url} target="_blank" rel="noreferrer">View photo</a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{gridColumn:'span 5'}}>
          <h3 className="cardTitle">Propose a trade</h3>
          {!canPropose ? (
            <>
              <p className="muted">You need at least one listed puzzle to offer.</p>
              <Link className="btn btnOrange" href="/add-puzzle">Add a puzzle</Link>
            </>
          ) : (
            <>
              <label className="muted">Offer one of your puzzles:</label>
              <select className="select" value={offerId} onChange={(e)=>setOfferId(e.target.value)} style={{marginTop:6}}>
                <option value="">Select…</option>
                {myPuzzles.map(mp => (
                  <option key={mp.id} value={mp.id}>{mp.title}</option>
                ))}
              </select>
              <button className="btn btnPrimary" style={{marginTop:10}} onClick={proposeTrade}>Propose trade</button>
              <p className="muted" style={{marginTop:10}}>
                Each of you pays your own shipping. Ship-by target: <b>3 days</b>.
              </p>
            </>
          )}
          {msg && <p className="muted">{msg}</p>}
        </div>
      </div>
    </Layout>
  );
}
