import { loadConfig, LANG_ORDER } from '../lib/config';
import { fetchPost, postSlug } from '../lib/wp';

export async function getStaticProps(){
  const cfg = loadConfig();
  // 1er article/langue disponible (préférence EN)
  let lang='en', id=null;
  for (const row of cfg.sequence.posts){
    for (const lc of LANG_ORDER){
      if (row[lc]){ lang=lc; id=row[lc]; break; }
    }
    if (id) break;
  }
  let slug = String(id);
  try{
    const p = await fetchPost(id);
    slug = postSlug(p);
  }catch{}
  return { props: { target: `/${lang}/${slug}/` } };
}

export default function Home({target}){
  return (
    <html><head><meta httpEquiv="refresh" content={`0; url=${target}`} /></head><body>
      <p>Redirecting to <a href={target}>{target}</a>…</p>
    </body></html>
  );
}

