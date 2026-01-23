import Link from 'next/link';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout title="SwapMyPuzzle — Founders Edition">
      <div className="grid">
        <section className="card" style={{gridColumn:'span 7'}}>
          <h1 style={{marginTop:0, fontSize:42, letterSpacing:'-0.8px'}}>Mail a puzzle. Get a new one.</h1>
          <p className="muted" style={{fontSize:16, lineHeight:1.5}}>
            SwapMyPuzzle is a platform for <b>puzzle people</b> to exchange puzzles with each other — no money, just good karma and good cardboard.
          </p>
          <div className="row" style={{marginTop:12}}>
            <Link className="btn btnPrimary" href="/browse">Start browsing</Link>
            <Link className="btn btnOrange" href="/add-puzzle">List a puzzle</Link>
          </div>
          <div className="kpi" style={{marginTop:14}}>
            <div className="chip">US-only (for now)</div>
            <div className="chip">Each person pays their own shipping</div>
            <div className="chip">Rate puzzles: clean • complete • puzzle-ready</div>
          </div>
        </section>

        <section className="card" style={{gridColumn:'span 5'}}>
          <h3 className="cardTitle">How it works</h3>
          <ol className="muted" style={{lineHeight:1.6}}>
            <li>List puzzles you’re ready to pass on.</li>
            <li>Find one you want and propose a trade.</li>
            <li>Both ship within a few days (tracking optional).</li>
            <li>Rate the puzzle + the swapper.</li>
          </ol>
          <p className="muted">Pro tip: don’t send puzzles that smell like your garage. (Unless your garage smells like lavender.)</p>
        </section>
      </div>
    </Layout>
  );
}
