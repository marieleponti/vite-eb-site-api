export function mapPost(p) {
  return {
    id: p.id,
    title: p.title?.rendered || '',
    content: (p.content?.rendered || '').replace(/<\/?[^>]+(>|$)/g, ''),
    date: p.date,
    status: p.status,
  }
}