import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import type { Puzzle } from '../lib/types';

export default function Browse() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [pieces, setPieces] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [theme, setTheme] = useState<string>('');
  const [missing, setMissing] = useState<string>('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('puzzles')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setPuzzles(data as Puzzle[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return puzzles.filter(p => {
      if (pieces) {
        const n = Number(pieces);
        if (Number.isFinite(n) && (p.pieces ?? 0) !== n) return false;
      }
      if (brand && !(p.brand ?? '').toLowerCase().includes(brand.toLowerCase())) return false;
      if (theme && !(p.theme ?? '').toLowerCase().includes(theme.toLowerCase())) return false;
      if (missing && !(p.missing_pieces ?? '').toLowerCase().includes(missing.toLowerCase())) return false;
      return true;
    });
  }, [puzzles, pieces, brand, theme, missing]);

  return (
    <Layout title="Browse puzzles — SwapMyPuzzle">
      <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h2 className="cardTitle" style={{marginBottom:4}}>Browse puzzles</h2>
          <div className="muted">Find your next obsession. Then trade for it.</div>
        </div>
        <Link className="btn btnOrange" href="/add-puzzle">+ Add a puzzle</Link>
      </div>

      <div className="card" style={{marginTop:14}}>
        <div className="row">
          <input className="input" placeholder="Pieces (e.g., 500)" value={pieces} onChange={(e)=>setPieces(e.target.value)} style={{maxWidth:160}} />
          <input className="input" placeholder="Brand (Ravensburger…)" value={brand} onChange={(e)=>setBrand(e.target.value)} />
          <input className="input" placeholder="Theme (holiday, landscape, candy…)" value={theme} onChange={(e)=>setTheme(e.target.value)} />
          <input className="input" placeholder="Missing pieces (none, 1, unknown…)" value={missing} onChange={(e)=>setMissing(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <p className="muted" style={{marginTop:14}}>Loading puzzles…</p>
      ) : (
        <div className="grid" style={{marginTop:14}}>
          {filtered.map(p => (
            <Link key={p.id} href={`/puzzles/${p.id}`} className="card" style={{gridColumn:'span 4'}}>
              <div style={{display:'flex', justifyContent:'space-between', gap:10}}>
                <div>
                  <div className="cardTitle">{p.title}</div>
                  <div className="muted">{p.pieces ? `${p.pieces} pieces` : 'Pieces unknown'} · {p.brand ?? 'Brand unknown'}</div>
                </div>
                <div className="badge">{p.missing_pieces ?? 'No missing noted'}</div>
              </div>
              <div className="muted" style={{marginTop:8}}>{p.theme ?? '—'}</div>
            </Link>
          ))}
          {filtered.length === 0 && <div className="muted">No matches. Try fewer filters.</div>}
        </div>
      )}
    </Layout>
  );
}
