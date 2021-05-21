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
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames.filter((name) => name.endsWith(extension))
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
    posts: fileNames
      .map(readPost)
      .sort((a, b) => {
        return new Date(b.date) - new Date(a.date)
      })
      .slice(offset, offset + first),
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
