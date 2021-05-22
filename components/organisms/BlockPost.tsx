import { Post } from 'services/blog'
import { formatDate } from '@/utils/string'
import Link from 'next/link'

export interface BlockPostProps {
  post: Post
}
export const BlockPost: React.FunctionComponent<BlockPostProps> = ({
  post,
}) => (
  <article key={post.slug} className="mb-8">
    <dl>
      <dt className="sr-only">Published on</dt>
      <dd className="text-sm font-medium leading-6 text-gray-500">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
      </dd>
    </dl>
    <Link href={`/blog/${post.slug}`}>
      <a>
        <h2 className="text-2xl text-yellow-500 hover:text-yellow-600 mb-2 leading-8 font-bold tracking-tight">
          {post.title}
        </h2>
      </a>
    </Link>

    <div className="text-gray-500">{post.excerpt}</div>
    <div className="text-base leading-6 font-medium">
      <Link href={`/blog/${post.slug}`}>
        <a
          aria-label={`Read "${post.title}"`}
        >
          Read more →
        </a>
      </Link>
    </div>
  </article>
)
