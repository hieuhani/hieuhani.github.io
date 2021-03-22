import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { getAllPostSlugs, getPost, Post } from 'services/blog'
import { PostHeader } from '@/components/organisms/PostHeader'
import { markdownToHtml } from '@/utils/string'
import { PostContent } from '@/components/organisms/PostContent'

interface SinglePostProps {
  post: Post
}
const SinglePost: React.FunctionComponent<SinglePostProps> = ({ post }) => {
  return (
    <>
      <Head>
        <title>{post.title}</title>
      </Head>
      <article className="max-w-2xl mx-auto">
        <PostHeader post={post} />
        <PostContent post={post} />
      </article>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = getPost(params.slug as string)
  const content = await markdownToHtml(post.content)
  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getAllPostSlugs()
  return {
    paths: slugs.map((slug) => ({
      params: {
        slug,
      },
    })),
    fallback: false,
  }
}

export default SinglePost
