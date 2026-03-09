import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import type { Puzzle } from '../lib/types';

export default function MyPuzzles() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) { setLoading(false); return; }
      const { data } = await supabase
        .from('puzzles')
        .select('*')
        .eq('owner_id', user.user.id)
        .order('created_at', { ascending: false });
      setPuzzles((data as Puzzle[]) ?? []);
      setLoading(false);
    })();
  }, []);

  async function remove(id: string) {
    if (!confirm('Delete this puzzle listing?')) return;
    await supabase.from('puzzles').delete().eq('id', id);
    setPuzzles(puzzles.filter(p => p.id !== id));
  }

  return (
    <Layout title="My puzzles — SwapMyPuzzle">
      <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
        <h2 className="cardTitle" style={{margin:0}}>My puzzles</h2>
        <Link className="btn btnOrange" href="/add-puzzle">+ Add a puzzle</Link>
      </div>

      {loading ? <p className="muted">Loading…</p> : (
        <div className="grid" style={{marginTop:14}}>
          {puzzles.map(p => (
            <div key={p.id} className="card" style={{gridColumn:'span 6'}}>
              <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <div className="cardTitle">{p.title}</div>
                  <div className="muted">{p.pieces ? `${p.pieces} pieces` : 'Pieces unknown'} · {p.brand ?? 'Brand unknown'}</div>
                </div>
                <div className="row">
                  <Link className="btn" href={`/puzzles/${p.id}`}>View</Link>
                  <button className="btn" onClick={()=>remove(p.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {puzzles.length === 0 && (
            <div className="card" style={{gridColumn:'span 12'}}>
              <div className="cardTitle">No puzzles yet</div>
              <div className="muted">Add your first puzzle so people can propose trades.</div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
