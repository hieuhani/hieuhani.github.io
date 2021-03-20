import { Post } from 'services/blog'
import styles from './styles.module.css'

export interface PostContentProps {
  post: Post
}

export const PostContent: React.FunctionComponent<PostContentProps> = ({
  post,
}) => (
  <div
    className={styles.markdown}
    dangerouslySetInnerHTML={{ __html: post.content }}
  />
)
