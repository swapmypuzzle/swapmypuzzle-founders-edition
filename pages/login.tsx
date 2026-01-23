import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setMsg(error.message);
    router.push('/browse');
  }

  async function oauth(provider: 'google' | 'apple') {
    setMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/browse` : undefined
      }
    });
    if (error) setMsg(error.message);
  }

  return (
    <Layout title="Log in — SwapMyPuzzle">
      <div className="grid">
        <div className="card" style={{gridColumn:'span 6'}}>
          <h2 className="cardTitle">Log in</h2>
          <form onSubmit={onLogin} className="row" style={{flexDirection:'column'}}>
            <input className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <input className="input" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <button className="btn btnPrimary" disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</button>
          </form>
          {msg && <p className="muted">{msg}</p>}
        </div>

        <div className="card" style={{gridColumn:'span 6'}}>
          <h3 className="cardTitle">Or use</h3>
          <div className="row">
            <button className="btn" onClick={()=>oauth('google')}>Continue with Google</button>
            <button className="btn" onClick={()=>oauth('apple')}>Continue with Apple</button>
          </div>
          <p className="muted" style={{marginTop:12}}>New here? <a href="/signup" style={{textDecoration:'underline'}}>Create an account</a>.</p>
        </div>
      </div>
    </Layout>
  );
}
