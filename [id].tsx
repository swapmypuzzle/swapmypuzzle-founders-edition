import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';
import type { Trade, Puzzle } from '../../lib/types';
import Link from 'next/link';

export default function TradeDetail() {
  const router = useRouter();
  const { id } = router.query as { id: string };

  const [trade, setTrade] = useState<Trade | null>(null);
  const [requested, setRequested] = useState<Puzzle | null>(null);
  const [offered, setOffered] = useState<Puzzle | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [tracking, setTracking] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setMe(u.user?.id ?? null);
      const { data } = await supabase.from('trades').select('*').eq('id', id).single();
      setTrade((data as Trade) ?? null);
      if (data) {
        const req = await supabase.from('puzzles').select('*').eq('id', data.requested_puzzle_id).single();
        const off = await supabase.from('puzzles').select('*').eq('id', data.offered_puzzle_id).single();
        setRequested((req.data as Puzzle) ?? null);
        setOffered((off.data as Puzzle) ?? null);
      }
    })();
  }, [id]);

  async function updateStatus(status: Trade['status']) {
    if (!trade) return;
    setMsg(null);
    const { data, error } = await supabase.from('trades').update({ status }).eq('id', trade.id).select('*').single();
    if (error) return setMsg(error.message);
    setTrade(data as Trade);
  }

  async function saveTracking() {
    if (!trade || !me) return;
    setMsg(null);
    const payload: any = {};
    if (me === trade.requester_id) payload.requester_tracking = tracking;
    if (me === trade.responder_id) payload.responder_tracking = tracking;
    const { data, error } = await supabase.from('trades').update(payload).eq('id', trade.id).select('*').single();
    if (error) return setMsg(error.message);
    setTrade(data as Trade);
    setTracking('');
  }

  if (!trade) {
    return (
      <Layout title="Trade — SwapMyPuzzle">
        <p className="muted">Loading…</p>
      </Layout>
    );
  }

  const iAmResponder = me === trade.responder_id;
  const iAmRequester = me === trade.requester_id;

  return (
    <Layout title={`Trade ${trade.id.slice(0,8)} — SwapMyPuzzle`}>
      <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
        <h2 className="cardTitle" style={{margin:0}}>Trade #{trade.id.slice(0, 8)}</h2>
        <div className="badge">Status: {trade.status}</div>
      </div>

      <div className="grid" style={{marginTop:12}}>
        <div className="card" style={{gridColumn:'span 7'}}>
          <h3 className="cardTitle">Trade details</h3>
          <div className="muted">Requested: <b>{requested?.title ?? '—'}</b></div>
          <div className="muted">Offered: <b>{offered?.title ?? '—'}</b></div>
          <div className="muted" style={{marginTop:8}}>Ship-by target: <b>{trade.ship_by ? new Date(trade.ship_by).toLocaleDateString() : '—'}</b></div>
          <div className="row" style={{marginTop:12}}>
            <Link className="btn" href={requested ? `/puzzles/${requested.id}` : '#'}>View requested</Link>
            <Link className="btn" href={offered ? `/puzzles/${offered.id}` : '#'}>View offered</Link>
          </div>

          <div className="card" style={{marginTop:12}}>
            <div className="cardTitle">Tracking</div>
            <div className="muted">Your tracking is optional — but it reduces “did you ship?” anxiety by about 73%.</div>
            <div className="row" style={{marginTop:10}}>
              <input className="input" placeholder="Enter tracking number" value={tracking} onChange={(e)=>setTracking(e.target.value)} />
              <button className="btn btnPrimary" onClick={saveTracking}>Save</button>
            </div>
            <div className="muted" style={{marginTop:10}}>
              Requester tracking: {trade.requester_tracking ?? '—'}<br/>
              Responder tracking: {trade.responder_tracking ?? '—'}
            </div>
          </div>
        </div>

        <div className="card" style={{gridColumn:'span 5'}}>
          <h3 className="cardTitle">Actions</h3>

          {trade.status === 'pending' && iAmResponder && (
            <div className="row">
              <button className="btn btnPrimary" onClick={()=>updateStatus('accepted')}>Accept</button>
              <button className="btn" onClick={()=>updateStatus('declined')}>Decline</button>
            </div>
          )}

          {trade.status === 'accepted' && (
            <>
              <p className="muted">Once you ship, mark it shipped. When both have shipped, mark delivered when received.</p>
              <div className="row">
                <button className="btn btnPrimary" onClick={()=>updateStatus('shipped')}>Mark shipped</button>
                <button className="btn" onClick={()=>updateStatus('pending')}>Undo</button>
              </div>
            </>
          )}

          {trade.status === 'shipped' && (
            <>
              <p className="muted">When you receive the puzzle, mark delivered. Then rate the swap.</p>
              <div className="row">
                <button className="btn btnPrimary" onClick={()=>updateStatus('delivered')}>Mark delivered</button>
              </div>
            </>
          )}

          {trade.status === 'delivered' && (
            <>
              <p className="muted">Rate the puzzle you received (clean, complete, puzzle-ready) and the ship speed.</p>
              <Link className="btn btnOrange" href={`/rate/${trade.id}`}>Rate this trade</Link>
              <div className="row" style={{marginTop:10}}>
                <button className="btn" onClick={()=>updateStatus('completed')}>Mark completed</button>
              </div>
            </>
          )}

          {trade.status === 'completed' && (
            <p className="muted">Completed. May your next puzzle be missing zero pieces and only minimal corner frustration.</p>
          )}

          {msg && <p className="muted">{msg}</p>}

          {!me && <p className="muted">Log in to manage this trade.</p>}
        </div>
      </div>
    </Layout>
  );
}
