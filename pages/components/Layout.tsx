import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Layout({ title, children }: { title: string; children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="nav">
        <div className="navLeft">
          <Link href="/" className="row" style={{alignItems:'center'}}>
            <Image src="/logo.png" alt="Swap My Puzzle" width={42} height={42} />
            <div>
              <div className="brandTitle">SwapMyPuzzle</div>
              <div className="badge">Founders Edition</div>
            </div>
          </Link>
        </div>
        <div className="navLinks">
          <Link className="btn btnGhost" href="/browse">Browse</Link>
          <Link className="btn btnGhost" href="/my-puzzles">My Puzzles</Link>
          <Link className="btn btnGhost" href="/trades">Trades</Link>
          <Link className="btn btnGhost" href="/community">Community</Link>
          {email ? (
            <>
              <span className="badge">{email}</span>
              <button className="btn" onClick={signOut}>Sign out</button>
            </>
          ) : (
            <Link className="btn btnPrimary" href="/login">Log in</Link>
          )}
        </div>
      </div>
      <main className="container">{children}</main>
    </>
  );
}
