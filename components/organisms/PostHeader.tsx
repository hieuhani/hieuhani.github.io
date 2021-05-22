import { formatDate } from '@/utils/string'
import { Post } from 'services/blog'

export interface PostHeaderProps {
  post: Post
}

export const PostHeader: React.FunctionComponent<PostHeaderProps> = ({
  post,
}) => (
  <header>
    <div className="mb-12 text-center">
      <dl>
        <div>
          <dt className="sr-only">Published on</dt>
          <dd className="text-base leading-6 font-medium text-gray-500">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </dd>
        </div>
      </dl>
      <div>
        <h2 className="text-2xl leading-9 font-medium text-gray-700 tracking-tight sm:text-3xl sm:leading-10 md:text-5xl md:leading-14">
          {post.title}
        </h2>
      </div>
    </div>
  </header>
)
