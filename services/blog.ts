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
const extension = '.md'

export const getMarkdownFileNames = (): string[] => {
  return fs.readdirSync(postsDirectory)
}

export const fileNameToSlug = (fileName: string) => {
  return fileName.substring(0, fileName.length - extension.length)
}

export const readPost = (fileName: string): Post => {
  const fullPath = path.join(postsDirectory, fileName)
  const rawContent = fs.readFileSync(fullPath, 'utf-8')
  const { data, content } = matter(rawContent)
  const slug = fileNameToSlug(fileName)

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

export const getPost = (slug: string): Post => {
  return readPost(`${slug}${extension}`)
}

export const getAllPostSlugs = (): string[] => {
  const fileNames = getMarkdownFileNames()

  return fileNames.map((fileName) => fileNameToSlug(fileName))
}
