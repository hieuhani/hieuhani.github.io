import { GetStaticProps } from 'next'
import { getPosts, PaginatedPosts } from 'services/blog'
import { BlockPost } from '@/components/organisms/BlockPost'

interface BlogProps {
  paginatedPost: PaginatedPosts
}
const Blog: React.FunctionComponent<BlogProps> = ({ paginatedPost }) => {
  return (
    <div className="container">
      {paginatedPost.posts.map((post) => (
        <BlockPost key={post.slug} post={post} />
      ))}
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const paginatedPost = getPosts(10, 0)
  return {
    props: {
      paginatedPost,
    },
  }
}

export default Blog
