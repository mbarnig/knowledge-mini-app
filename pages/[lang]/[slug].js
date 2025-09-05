// pages/[lang]/[slug].js
import Head from 'next/head';
import Layout from '../../components/Layout';
import { loadConfig, LANG_ORDER, initialsFromName, luminance } from '../../lib/config';
import { fetchPost, fetchUser, postSlug } from '../../lib/wp';

export async function getStaticPaths() {
  const cfg = loadConfig();
  const paths = [];
  const seen = new Set();

  for (const row of cfg.sequence.posts) {
    for (const lc of LANG_ORDER) {
      const id = row[lc];
      if (!id) continue;

      // 1) Toujours générer la variante ID (ex: /en/1988/) — SANS fetch
      {
        const keyId = `${lc}/${id}`;
        if (!seen.has(keyId)) {
          seen.add(keyId);
          paths.push({ params: { lang: lc, slug: String(id) } });
        }
      }

      // 2) Essayer en plus de générer la variante SLUG (ex: /en/visionaries-end/)
      try {
        const post = await fetchPost(id);
        const slug = postSlug(post);
        const keySlug = `${lc}/${slug}`;
        if (!seen.has(keySlug)) {
          seen.add(keySlug);
          paths.push({ params: { lang: lc, slug } });
        }
      } catch (e) {
        // Si l'API ne répond pas, on garde au moins la route /<lang>/<id>/
      }
    }
  }

  // Export statique => pas de fallback
  return { paths, fallback: false };
}

function findIdBySlug(cfg, lang, slug, postsCache) {
  for (const row of cfg.sequence.posts) {
    const id = row[lang];
    if (!id) continue;
    const p = postsCache.get(id);
    if (!p) continue;
    if (p.slug === slug || String(p.id) === slug) return id;
  }
  return null;
}

export async function getStaticProps({ params }) {
  const cfg = loadConfig();
  const { lang, slug } = params;

  // Précharger les posts de la langue courante
  const postsCache = new Map();
  for (const row of cfg.sequence.posts) {
    const id = row[lang];
    if (!id) continue;
    try {
      const p = await fetchPost(id);
      postsCache.set(id, p);
    } catch (e) {}
  }

  // Le param `slug` peut être un slug ou un ID numérique
  let id = null;
  const numeric = /^\d+$/.test(slug) ? Number(slug) : null;
  if (numeric) {
    id = numeric;
  } else {
    id = findIdBySlug(cfg, lang, slug, postsCache);
  }

  if (!id) {
    // 404 propre si introuvable (ne devrait pas arriver avec fallback:false + paths complets)
    return { notFound: true };
  }

  const post = postsCache.get(id) || (await fetchPost(id));
  const title = (post.title?.rendered) || (post.title?.raw) || 'Sans titre';
  const authorId = post.author;
  const author = authorId ? await fetchUser(authorId) : null;
  const authorInitials = initialsFromName(author?.name || '');
  const content = post.content?.rendered || '';

  const colors = cfg.color || { header: '#1F1F1F', main: '#2E2E2E', footer: '#1A1A1A' };
  const hdrText = luminance(colors.header) > 0.5 ? '#000' : '#fff';
  const mainText = luminance(colors.main) > 0.5 ? '#000' : '#fff';
  const ftrText = luminance(colors.footer) > 0.5 ? '#000' : '#fff';

  // Options de langues pour CE groupe (abbr. uniquement, ordre EN→LB)
  let currentRow = null;
  for (const row of cfg.sequence.posts) {
    if (row[lang] === id) { currentRow = row; break; }
  }
  const langOptions = [];
  if (currentRow) {
    for (const lc of LANG_ORDER) {
      const pid = currentRow[lc];
      if (!pid) continue;
      try {
        const pp = pid === id ? post : await fetchPost(pid);
        langOptions.push({ lc, slug: pp.slug });
      } catch (e) {}
    }
  }

  // Prev/Next dans la même langue
  const rowsForLang = cfg.sequence.posts.filter(r => r[lang]);
  const idx = rowsForLang.findIndex(r => r[lang] === id);
  const prevId = idx > 0 ? rowsForLang[idx - 1][lang] : 0;
  const nextId = idx < rowsForLang.length - 1 ? rowsForLang[idx + 1][lang] : 0;

  async function idToSlug(pid) {
    if (!pid) return null;
    const p = postsCache.get(pid) || (await fetchPost(pid));
    return `/${lang}/${p.slug}/`;
  }

  const prevHref = await idToSlug(prevId);
  const nextHref = await idToSlug(nextId);
  const position = `${idx + 1}/${rowsForLang.length}`;

  return {
    props: {
      cfg,
      title,
      content,
      colors,
      hdrText,
      mainText,
      ftrText,
      links: {
        login: cfg.login,
        search: cfg.search,
        user: cfg.user,
        dashboard: cfg.dashboard,
        welcome: cfg.welcome
      },
      lang,
      langOptions,        // toujours un tableau
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

