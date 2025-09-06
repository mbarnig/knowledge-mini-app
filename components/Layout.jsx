'use client';
import { useEffect } from 'react';

export default function Layout({
  children, colors, links, logo='/assets/logo.svg',
  prevHref, nextHref, authorInitials, position,
  langOptions = [], currentLang
}){
  useEffect(()=>{
    const root = document.documentElement;
    if (colors?.header) root.style.setProperty('--color-header', colors.header);
    if (colors?.main)   root.style.setProperty('--color-main', colors.main);
    if (colors?.footer) root.style.setProperty('--color-footer', colors.footer);
    // swipe & keyboard nav – avec cleanup correct
    const main = document.getElementById('content');
    const prev = typeof window !== 'undefined' ? document.querySelector('.nav.prev') : null;
    const next = typeof window !== 'undefined' ? document.querySelector('.nav.next') : null;
    const hasPrev = prev && getComputedStyle(prev).visibility !== 'hidden';
    const hasNext = next && getComputedStyle(next).visibility !== 'hidden';

    if (!main || (!hasPrev && !hasNext)) return;

    let sx=0, sy=0, sw=false;
    const onStart = (e)=>{ const t=e.changedTouches[0]; sx=t.clientX; sy=t.clientY; sw=true; };
    const onEnd = (e)=>{
      if (!sw) return;
      const t=e.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy;
      if (Math.abs(dx)>60 && Math.abs(dy)<40){
        if (dx<0 && hasNext && nextHref) location.href = nextHref;
        if (dx>0 && hasPrev && prevHref) location.href = prevHref;
      }
      sw=false;
    };
    const onKey = (e)=>{
      if (e.key==='ArrowLeft' && hasPrev && prevHref) location.href = prevHref;
      if (e.key==='ArrowRight' && hasNext && nextHref) location.href = nextHref;
    };

    main.classList.add('swipeable');
    main.addEventListener('touchstart', onStart, {passive:true});
    main.addEventListener('touchend', onEnd, {passive:true});
    document.addEventListener('keydown', onKey);

    return ()=>{
      main.classList.remove('swipeable');
      main.removeEventListener('touchstart', onStart);
      main.removeEventListener('touchend', onEnd);
      document.removeEventListener('keydown', onKey);
    };
  }, [colors?.header, colors?.main, colors?.footer, prevHref, nextHref]);

  return (
    <div>
      // Header
      <header className="site-header">
        <div className="left">
          <img src={logo} alt="KI-Léierbud" className="logo" />
        </div>
        <div className="right">                  
          <a className="btn" href={links?.search || '#'} target="_blank" rel="noopener noreferrer">Search</a>
          <select
            id="lang-select"
            className="lang"
            defaultValue={`/${(currentLang || '').toLowerCase()}/`}
            onChange={(e)=>{ if(e.target.value) location.href = e.target.value; }}
            aria-label="Change language"
          >
            {(langOptions ?? []).map(opt => (
              <option key={opt.lc} value={`/${opt.lc}/${opt.slug}/`}>{opt.lc.toUpperCase()}</option>
            ))}
          </select>
          <a className="btn" href={links?.login || '#'} target="_blank" rel="noopener noreferrer">Login</a>
        </div>
      </header>
      <main id="content" className="site-main">{children}</main>
      // Footer
      <footer className="site-footer">
        <div className="side">
          <a className="author" href={links?.author || '#'} target="_blank" rel="noopener noreferrer" title="Authors">
            {authorInitials}
          </a>
          <a className="nav prev" style={{visibility: prevHref ? 'visible' : 'hidden'}} href={prevHref || '#'} aria-label="Précédent">⟵</a>
        </div>
        <div className="center">
          <a className="btn" href={links?.welcome || links?.dashboard || '#'} target="_blank" rel="noopener noreferrer">Home</a>
          <span className="position">{position || ''}</span>
          <a className="btn" href={links?.dashboard || '#'} target="_blank" rel="noopener noreferrer">TOC</a>
        </div>
        <div className="side">
          <a className="nav next" style={{visibility: nextHref ? 'visible' : 'hidden'}} href={nextHref || '#'} aria-label="Suivant">⟶</a>
        </div>
      </footer>
    </div>
  );
}

