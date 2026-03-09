import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';

type Post = { id: string; user_id: string; title: string; body: string; created_at: string };

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    setPosts((data as Post[]) ?? []);
  }

  useEffect(() => { load(); }, []);

  async function create() {
    setMsg(null);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return setMsg('Please log in to post.');
    const { error } = await supabase.from('posts').insert({ user_id: u.user.id, title, body });
    if (error) return setMsg(error.message);
    setTitle(''); setBody('');
    await load();
  }

  return (
    <Layout title="Community — SwapMyPuzzle">
      <h2 className="cardTitle">Community</h2>
      <p className="muted">Puzzle talk. Rants about edge pieces. Occasional humblebrag about finishing a 2000-piece monster.</p>

      <div className="grid" style={{marginTop:12}}>
        <div className="card" style={{gridColumn:'span 5'}}>
          <h3 className="cardTitle">Start a thread</h3>
          <input className="input" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <textarea className="textarea" rows={5} placeholder="What’s on your puzzle mind?" value={body} onChange={(e)=>setBody(e.target.value)} style={{marginTop:10}} />
          <button className="btn btnPrimary" onClick={create} style={{marginTop:10}}>Post</button>
          {msg && <div className="muted">{msg}</div>}
        </div>

        <div className="card" style={{gridColumn:'span 7'}}>
          <h3 className="cardTitle">Latest</h3>
          <div className="row" style={{flexDirection:'column'}}>
            {posts.map(p => (
              <div key={p.id} className="card" style={{background:'#fff'}}>
                <div className="cardTitle">{p.title}</div>
                <div className="muted" style={{whiteSpace:'pre-wrap'}}>{p.body}</div>
              </div>
            ))}
            {posts.length === 0 && <div className="muted">No posts yet. Be the first puzzle person to speak.</div>}
          </div>
        </div>
      </div>
    </Layout>
  );
}
