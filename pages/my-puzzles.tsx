{puzzles.map(p => (
  <div key={p.id} className="card" style={{gridColumn:'span 6'}}>
    <div className="row" style={{gap:16}}>
      
      {p.cover_url ? (
        <img
          src={p.cover_url}
          alt={p.title}
          style={{
            width:120,
            height:120,
            objectFit:'cover',
            borderRadius:12
          }}
        />
      ) : (
        <div style={{
          width:120,
          height:120,
          borderRadius:12,
          background:'#f4f7fa',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          fontSize:12,
          color:'#7a8a9a'
        }}>
          No photo
        </div>
      )}

      <div style={{flex:1}}>
        <div className="cardTitle">{p.title}</div>
        <div className="muted">
          {p.pieces ? `${p.pieces} pieces` : 'Pieces unknown'} · {p.brand ?? 'Brand unknown'}
        </div>

        <div className="row" style={{marginTop:10}}>
          <Link className="btn" href={`/puzzles/${p.id}`}>View</Link>
          <button className="btn" onClick={()=>remove(p.id)}>Delete</button>
        </div>
      </div>

    </div>
  </div>
))}
