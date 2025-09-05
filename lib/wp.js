import fetch from 'node-fetch';

const BASE = 'https://admin.ki-leierbud.lu/wp-json/wp/v2';

export async function fetchPost(id) {
  const r = await fetch(`${BASE}/posts/${id}?_embed=1`, { headers: { 'User-Agent': 'visionaries-static' } });
  if (!r.ok) throw new Error(`fetchPost(${id}) HTTP ${r.status}`);
  return await r.json();
}

export async function fetchUser(id) {
  const r = await fetch(`${BASE}/users/${id}`, { headers: { 'User-Agent': 'visionaries-static' } });
  if (!r.ok) return null;
  return await r.json();
}

export function postTitle(post) {
  if (!post) return 'Sans titre';
  if (post.title?.rendered) return post.title.rendered;
  if (post.title?.raw) return post.title.raw;
  return 'Sans titre';
}

export function postSlug(post) {
  return post?.slug ? post.slug : String(post?.id || '').trim();
}

