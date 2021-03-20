import { formatDate } from '@/utils/string'
import { Post } from 'services/blog'

export interface PostHeaderProps {
  post: Post
}

export const PostHeader: React.FunctionComponent<PostHeaderProps> = ({
  post,
}) => (
  <header>
    <div className="mb-8">
      <dl>
        <div>
          <dt className="sr-only">Published on</dt>
          <dd className="text-base leading-6 font-medium text-gray-500">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </dd>
        </div>
      </dl>
      <div>
        <h2 className="text-2xl leading-9 font-extrabold text-gray-900 tracking-tight sm:text-3xl sm:leading-10 md:text-4xl md:leading-14">
          {post.title}
        </h2>
      </div>
    </div>
    <div className="mb-8 md:mb-8 sm:mx-0">
      <img
        src={post.coverImage}
        alt={`${post.title}'s cover`}
        className="shadow-small hover:shadow-medium transition-shadow duration-200"
      />
    </div>
  </header>
)
