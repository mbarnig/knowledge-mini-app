// pages/index.js
import Head from 'next/head';
import { loadConfig, LANG_ORDER } from '../lib/config';

export async function getStaticProps(){
  const cfg = loadConfig();

  // 1er post dispo (préférence EN) — sans fetch
  let lang = 'en';
  let id = null;
  outer: for (const row of cfg.sequence.posts) {
    for (const lc of LANG_ORDER) {
      if (row[lc]) { lang = lc; id = row[lc]; break outer; }
    }
  }
  const target = id ? `/${lang}/${id}/` : '/404/';

  return { props: { target } };
}

export default function Home({ target }) {
  return (
    <>
      <Head>
        <title>Redirecting…</title>
        <meta httpEquiv="refresh" content={`0; url=${target}`} />
      </Head>
      <script
        dangerouslySetInnerHTML={{
          __html: `location.replace(${JSON.stringify(target)});`
        }}
      />
      <p>Redirecting to <a href={target}>{target}</a>…</p>
    </>
  );
}

