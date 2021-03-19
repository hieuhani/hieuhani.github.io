import path from 'path'
import fs from 'fs'
import matter from 'gray-matter'

export interface Post {
  title: string
  excerpt: string
  coverImage: string
  date: string
  content: string
  slug: string
}

export interface PaginatedPosts {
  posts: Post[]
  totalCount: number
}

const postsDirectory = path.resolve('data/blog')

export const getMarkdownFileNames = (): string[] => {
  return fs.readdirSync(postsDirectory)
}

export const readPost = (fileName: string): Post => {
  const extension = '.md'
  const fullPath = path.join(postsDirectory, fileName)
  const rawContent = fs.readFileSync(fullPath, 'utf-8')
  const { data, content } = matter(rawContent)
  const slug = fileName.substring(0, fileName.length - extension.length)

  return {
    title: data.title,
    excerpt: data.excerpt,
    coverImage: data.coverImage,
    date: data.date,
    content,
    slug,
  }
}

export const getPosts = (first: number, offset: number): PaginatedPosts => {
  const fileNames = getMarkdownFileNames()
  return {
    posts: fileNames.slice(offset, offset + first).map(readPost),
    totalCount: fileNames.length,
  }
}
