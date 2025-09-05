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

    const main = document.getElementById('content');
    const prev = document.querySelector('.nav.prev');
    const next = document.querySelector('.nav.next');
    const hasPrev = prev && getComputedStyle(prev).visibility !== 'hidden';
    const hasNext = next && getComputedStyle(next).visibility !== 'hidden';
    if (main && (hasPrev || hasNext)){
      let sx=0, sy=0, sw=false;
      main.classList.add('swipeable');
      main.addEventListener('touchstart', e => { const t=e.changedTouches[0]; sx=t.clientX; sy=t.clientY; sw=true; }, {passive:true});
      main.addEventListener('touchend', e => {
        if (!sw) return;
        const t=e.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy;
        if (Math.abs(dx)>60 && Math.abs(dy)<40){
          if (dx<0 && hasNext && nextHref) location.href = nextHref;
          if (dx>0 && hasPrev && prevHref) location.href = prevHref;
        }
        sw=false;
      }, {passive:true});
      const onKey = (e)=>{
        if (e.key==='ArrowLeft' && hasPrev && prevHref) location.href = prevHref;
        if (e.key==='ArrowRight' && hasNext && nextHref) location.href = nextHref;
      };
      document.addEventListener('keydown', onKey);
      return ()=> document.removeEventListener('keydown', onKey);
    }
  }, [colors, prevHref, nextHref]);

  return (
    <div>
      <header className="site-header">
        <div className="left">
          <img src={logo} alt="KI-Léierbud" className="logo" />
        </div>
        <div className="right">
          <a className="btn" href={links?.search || '#'}>Search</a>
          {/* Menu langues (abbr. uniquement) */}
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
          <a className="btn" href={links?.login || '#'}>Login</a>
        </div>
      </header>
      <main id="content" className="site-main">{children}</main>
      <footer className="site-footer">
        <div className="side">
          <a className="author" href={links?.user || '#'}>{authorInitials || 'AU'}</a>
          <a className="nav prev" style={{visibility: prevHref ? 'visible' : 'hidden'}} href={prevHref || '#'} aria-label="Précédent">⟵</a>
        </div>
        <div className="center">
          <a className="btn" href={links?.welcome || links?.dashboard || '#'}>Home</a>
          <span className="position">{position || ''}</span>
          <a className="btn" href={links?.dashboard || '#'}>TOC</a>
        </div>
        <div className="side">
          <a className="nav next" style={{visibility: nextHref ? 'visible' : 'hidden'}} href={nextHref || '#'} aria-label="Suivant">⟶</a>
        </div>
      </footer>
    </div>
  );
}

