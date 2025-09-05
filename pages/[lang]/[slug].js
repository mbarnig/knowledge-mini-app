// pages/[lang]/[slug].js
import Head from 'next/head';
import Layout from '../../components/Layout';
import { loadConfig, LANG_ORDER, initialsFromName, luminance } from '../../lib/config';
import { fetchPost, fetchUser } from '../../lib/wp'; // plus besoin de postSlug

// On génère SEULEMENT /<lang>/<id>/
export async function getStaticPaths() {
  const cfg = loadConfig();
  const paths = [];
  const seen = new Set();

  for (const row of cfg.sequence.posts) {
    for (const lc of LANG_ORDER) {
      const id = row[lc];
      if (!id) continue;
      const keyId = `${lc}/${id}`;
      if (seen.has(keyId)) continue;
      seen.add(keyId);
      paths.push({ params: { lang: lc, slug: String(id) } });
    }
  }
  return { paths, fallback: false }; // export statique
}

// Ici, slug DOIT être numérique. Sinon => 404
export async function getStaticProps({ params }) {
  const cfg = loadConfig();
  const { lang, slug } = params;

  if (!/^\d+$/.test(slug)) {
    return { notFound: true };
  }
  const id = Number(slug);

  // Charger le post (tolérance réseau avec fallback)
  let post = null;
  try {
    post = await fetchPost(id);
  } catch {
    post = {
      id,
      slug: String(id),
      title: { rendered: `Post ${id}` },
      content: {
        rendered:
          `<div style="padding:1rem;border:1px dashed #888;border-radius:8px;">
             <h2 style="margin-top:0;">Content temporarily unavailable</h2>
             <p>We could not reach the WordPress API to load this article (ID ${id}).</p>
             <p>Please retry later.</p>
           </div>`
      },
      author: null
    };
  }

  const title = (post.title?.rendered) || (post.title?.raw) || 'Sans titre';

  // Auteur (tolérance réseau)
  let author = null;
  if (post.author) {
    try { author = await fetchUser(post.author); } catch {}
  }
  const authorInitials = initialsFromName(author?.name || '');
  const content = post.content?.rendered || '<p>(no content)</p>';

  // Couleurs & contrastes
  const colors = cfg.color || { header: '#1F1F1F', main: '#2E2E2E', footer: '#1A1A1A' };
  const hdrText  = luminance(colors.header) > 0.5 ? '#000' : '#fff';
  const mainText = luminance(colors.main)   > 0.5 ? '#000' : '#fff';
  const ftrText  = luminance(colors.footer) > 0.5 ? '#000' : '#fff';

  // Options de langues pour CE groupe — uniquement numériques, sans fetch
  let currentRow = null;
  for (const row of cfg.sequence.posts) {
    if (row[lang] === id) { currentRow = row; break; }
  }
  const langOptions = [];
  if (currentRow) {
    for (const lc of LANG_ORDER) {
      const pid = currentRow[lc];
      if (!pid) continue;
      langOptions.push({ lc, slug: String(pid) }); // URL numérique
    }
  }

  // Prev/Next dans la même langue — URLs numériques, sans fetch
  const rowsForLang = cfg.sequence.posts.filter(r => r[lang]);
  const idx = rowsForLang.findIndex(r => r[lang] === id);
  const prevId = idx > 0 ? rowsForLang[idx - 1][lang] : 0;
  const nextId = idx < rowsForLang.length - 1 ? rowsForLang[idx + 1][lang] : 0;
  const prevHref = prevId ? `/${lang}/${prevId}/` : null;
  const nextHref = nextId ? `/${lang}/${nextId}/` : null;
  const position = `${idx + 1}/${rowsForLang.length}`;

  return {
    props: {
      cfg,
      title,
      content,
      colors,
      hdrText, mainText, ftrText,
      links: {
        login: cfg.login,
        search: cfg.search,
        user: cfg.user,
        dashboard: cfg.dashboard,
        welcome: cfg.welcome
      },
      lang,
      langOptions,
      prevHref,
      nextHref,
      position,
      authorInitials
    }
  };
}

export default function PostPage(props) {
  const {
    title, content, colors, hdrText, mainText, ftrText, links,
    lang, langOptions = [], prevHref, nextHref, position, authorInitials
  } = props;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          .site-header { color: ${hdrText}; }
          .site-main   { color: ${mainText}; }
          .site-footer { color: ${ftrText}; }
        `}</style>
      </Head>
      <Layout
        colors={colors}
        links={links}
        prevHref={prevHref}
        nextHref={nextHref}
        authorInitials={authorInitials}
        position={position}
        langOptions={langOptions}
        currentLang={lang}
      >
        <article dangerouslySetInnerHTML={{ __html: content }} />
      </Layout>
    </>
  );
}

