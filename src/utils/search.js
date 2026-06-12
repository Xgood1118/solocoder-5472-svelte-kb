import { extractPlainText } from './markdown'

const WEIGHTS = {
  title: 10,
  tags: 5,
  content: 1
}

export function calculateScore(article, keyword) {
  const keywords = keyword.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!keywords.length) return 0

  let totalScore = 0

  for (const kw of keywords) {
    const titleCount = countOccurrences(article.title || '', kw)
    const titleScore = titleCount > 0 ? (1 + Math.log(titleCount)) * WEIGHTS.title : 0

    const tagCount = (article.tags || []).filter(t => t.toLowerCase().includes(kw)).length
    const tagScore = tagCount > 0 ? (1 + Math.log(tagCount)) * WEIGHTS.tags : 0

    const content = extractPlainText(article.content || '').toLowerCase()
    const contentCount = countOccurrences(content, kw)
    const contentScore = contentCount > 0 ? (1 + Math.log(contentCount)) * WEIGHTS.content : 0

    totalScore += titleScore + tagScore + contentScore
  }

  return totalScore
}

function countOccurrences(text, keyword) {
  if (!text || !keyword) return 0
  const lowerText = text.toLowerCase()
  const lowerKw = keyword.toLowerCase()

  let count = 0
  let idx = 0
  while ((idx = lowerText.indexOf(lowerKw, idx)) !== -1) {
    count++
    idx += lowerKw.length
  }
  return count
}

export function rankResults(articles, keyword) {
  return articles
    .map(article => ({
      ...article,
      score: calculateScore(article, keyword)
    }))
    .filter(a => a.score > 0)
    .sort((a, b) => b.score - a.score)
}

export function highlightText(text, keywords) {
  if (!text || !keywords || !keywords.length) return text

  const pattern = keywords.map(k => escapeRegExp(k)).join('|')
  const regex = new RegExp(`(${pattern})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
