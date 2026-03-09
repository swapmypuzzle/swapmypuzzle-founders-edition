import { useState } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';

export default function AddPuzzle() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [pieces, setPieces] = useState('');
  const [theme, setTheme] = useState('');
  const [condition, setCondition] = useState('Good');
  const [missing, setMissing] = useState('None');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) { setLoading(false); return setMsg('Please log in first.'); }

    const { data: created, error } = await supabase.from('puzzles').insert({
      owner_id: user.user.id,
      title,
      brand: brand || null,
      pieces: pieces ? Number(pieces) : null,
      theme: theme || null,
      condition: condition || null,
      missing_pieces: missing || null,
      notes: notes || null
    }).select('*').single();

    if (error || !created) {
      setLoading(false);
      return setMsg(error?.message ?? 'Could not create puzzle');
    }

    // Upload photos to Supabase Storage (bucket: puzzle-photos)
    // This MVP stores the first uploaded photo as cover_url.
    let coverUrl: string | null = null;
    if (files && files.length > 0) {
      for (let i = 0; i < Math.min(files.length, 8); i++) {
        const f = files[i];
        const path = `${created.owner_id}/${created.id}/${uuidv4()}-${f.name}`;
        const up = await supabase.storage.from('puzzle-photos').upload(path, f, { upsert: false });
        if (!up.error) {
          const { data } = supabase.storage.from('puzzle-photos').getPublicUrl(path);
          const url = data.publicUrl;
          if (!coverUrl) coverUrl = url;
          await supabase.from('puzzle_photos').insert({ puzzle_id: created.id, url });
        }
      }
    }
    if (coverUrl) {
      await supabase.from('puzzles').update({ cover_url: coverUrl }).eq('id', created.id);
    }

    setLoading(false);
    router.push(`/puzzles/${created.id}`);
  }

  return (
    <Layout title="Add a puzzle — SwapMyPuzzle">
      <div className="card" style={{maxWidth:720, margin:'0 auto'}}>
        <h2 className="cardTitle">Add a puzzle</h2>
        <p className="muted">Upload a couple pics (front of box + puzzle close-up). Puzzle people love receipts.</p>
        <form onSubmit={onSubmit} className="row" style={{flexDirection:'column'}}>
          <input className="input" placeholder="Title (e.g., Christmas Village Night)" value={title} onChange={(e)=>setTitle(e.target.value)} required />
          <div className="row">
            <input className="input" placeholder="Brand" value={brand} onChange={(e)=>setBrand(e.target.value)} />
            <input className="input" placeholder="Pieces (e.g., 1000)" value={pieces} onChange={(e)=>setPieces(e.target.value)} />
          </div>
          <input className="input" placeholder="Theme/tags (holiday, landscape, candy…)" value={theme} onChange={(e)=>setTheme(e.target.value)} />
          <div className="row">
            <select className="select" value={condition} onChange={(e)=>setCondition(e.target.value)}>
              <option>Like New</option>
              <option>Good</option>
              <option>Worn Box</option>
            </select>
            <select className="select" value={missing} onChange={(e)=>setMissing(e.target.value)}>
              <option>None</option>
              <option>Unknown</option>
              <option>Missing 1</option>
              <option>Missing more</option>
            </select>
          </div>
          <textarea className="textarea" placeholder="Notes (puzzle-ready? taped? bagged pieces? any quirks?)" value={notes} onChange={(e)=>setNotes(e.target.value)} rows={4} />
          <input className="input" type="file" multiple accept="image/*" onChange={(e)=>setFiles(e.target.files)} />
          <button className="btn btnOrange" disabled={loading}>{loading ? 'Saving…' : 'Publish puzzle'}</button>
          {msg && <div className="muted">{msg}</div>}
        </form>
      </div>
    </Layout>
  );
}
