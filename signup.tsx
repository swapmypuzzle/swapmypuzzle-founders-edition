import { useState } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [zip, setZip] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      return setMsg(error.message);
    }

    // Store basic profile (US-only MVP: ZIP required)
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, country: 'US', zip });
    }
    setLoading(false);
    router.push('/browse');
  }

  return (
    <Layout title="Sign up — SwapMyPuzzle">
      <div className="card" style={{maxWidth:520, margin:'0 auto'}}>
        <h2 className="cardTitle">Create your account</h2>
        <p className="muted">US-only for now. We’ll use your ZIP to keep swaps domestic.</p>
        <form onSubmit={onSignup} className="row" style={{flexDirection:'column'}}>
          <input className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input className="input" placeholder="Password (8+ chars recommended)" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <input className="input" placeholder="ZIP code" value={zip} onChange={(e)=>setZip(e.target.value)} />
          <button className="btn btnPrimary" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
        </form>
        {msg && <p className="muted">{msg}</p>}
      </div>
    </Layout>
  );
}
