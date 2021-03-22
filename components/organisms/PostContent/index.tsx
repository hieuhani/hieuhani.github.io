import { Post } from 'services/blog'
import styles from './styles.module.css'

export interface PostContentProps {
  post: Post
}

export const PostContent: React.FunctionComponent<PostContentProps> = ({
  post,
}) => (
  <div>
    <div className="mb-8 md:mb-8 sm:mx-0">
      <img
        src={post.coverImage}
        alt={`${post.title}'s cover`}
        className="shadow-small hover:shadow-medium transition-shadow duration-200"
      />
    </div>
    <div
      className={styles.markdown}
      dangerouslySetInnerHTML={{ __html: post.content }}
    />
  </div>
)
