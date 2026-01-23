import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import type { Trade } from '../lib/types';

export default function Trades() {
  const [items, setItems] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { setLoading(false); return; }
      const { data } = await supabase
        .from('trades')
        .select('*')
        .or(`requester_id.eq.${u.user.id},responder_id.eq.${u.user.id}`)
        .order('created_at', { ascending: false });
      setItems((data as Trade[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <Layout title="Trades — SwapMyPuzzle">
      <h2 className="cardTitle">Trades</h2>
      <p className="muted">Pending, accepted, shipped — all your swaps live here.</p>

      {loading ? <p className="muted">Loading…</p> : (
        <div className="grid" style={{marginTop:12}}>
          {items.map(t => (
            <Link key={t.id} href={`/trades/${t.id}`} className="card" style={{gridColumn:'span 6'}}>
              <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <div className="cardTitle">Trade #{t.id.slice(0, 8)}</div>
                  <div className="muted">Status: <b>{t.status}</b></div>
                </div>
                <div className="badge">Ship-by: {t.ship_by ? new Date(t.ship_by).toLocaleDateString() : '—'}</div>
              </div>
            </Link>
          ))}
          {items.length === 0 && (
            <div className="card" style={{gridColumn:'span 12'}}>
              <div className="cardTitle">No trades yet</div>
              <div className="muted">Browse puzzles and propose your first trade.</div>
              <Link className="btn btnPrimary" href="/browse" style={{marginTop:10}}>Browse puzzles</Link>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
