import dayjs from 'dayjs'
import remark from 'remark'
import html from 'remark-html'

export const formatDate = (date: string): string =>
  dayjs(date).format('MMMM D, YYYY')

export const markdownToHtml = async (markdown: string): Promise<string> => {
  const result = await remark().use(html).process(markdown)
  return result.toString()
}
