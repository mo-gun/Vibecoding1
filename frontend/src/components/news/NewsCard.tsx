import type { NewsArticle } from '../../types'

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 rounded-lg border border-slate-700/50 hover:border-slate-600 hover:bg-slate-700/30 transition-colors"
    >
      <p className="text-sm text-slate-200 font-medium line-clamp-2 leading-snug">
        {article.title}
      </p>
      {article.summary && (
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{article.summary}</p>
      )}
      <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
        {article.source && <span>{article.source}</span>}
        {article.source && article.published_at && <span>·</span>}
        {article.published_at && <span>{article.published_at}</span>}
      </div>
    </a>
  )
}
