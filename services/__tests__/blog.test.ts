import { getMarkdownFileNames, getPosts } from '../blog'

test('getMarkdownFiles', () => {
  const slugs = getMarkdownFileNames()
  expect(Array.isArray(slugs)).toBeTruthy()
})

test('getMarkdownFiles', () => {
  const paginatedPosts = getPosts(10, 0)
  expect(paginatedPosts.totalCount).not.toBeNaN()
  expect(Array.isArray(paginatedPosts.posts)).toBeTruthy()
  expect(paginatedPosts.posts[0].title).not.toBeNull()
  expect(paginatedPosts.posts[0].excerpt).not.toBeNull()
  expect(paginatedPosts.posts[0].coverImage).not.toBeNull()
  expect(paginatedPosts.posts[0].date).not.toBeNull()
  expect(paginatedPosts.posts[0].content).not.toBeNull()
})
