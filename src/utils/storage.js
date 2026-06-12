const RECENT_KEY = 'kb_recent'
const DRAFT_KEY = 'kb_drafts'
const MAX_RECENT = 20
const DRAFT_AUTOSAVE_INTERVAL = 30000

export function getRecentArticles() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
  } catch {
    return []
  }
}

export function addRecentArticle(article) {
  const recent = getRecentArticles()
  const filtered = recent.filter(a => a.id !== article.id)
  filtered.unshift({
    id: article.id,
    title: article.title,
    path: article.path || '',
    visitedAt: Date.now()
  })
  const trimmed = filtered.slice(0, MAX_RECENT)
  localStorage.setItem(RECENT_KEY, JSON.stringify(trimmed))
  return trimmed
}

export function clearRecentArticles() {
  localStorage.removeItem(RECENT_KEY)
}

export function getDrafts() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]')
  } catch {
    return []
  }
}

export function getDraft(articleId) {
  const drafts = getDrafts()
  return drafts.find(d => d.id === articleId) || null
}

export function saveDraft(articleId, data) {
  const drafts = getDrafts()
  const index = drafts.findIndex(d => d.id === articleId)
  const draft = {
    id: articleId,
    ...data,
    updatedAt: Date.now()
  }

  if (index >= 0) {
    drafts[index] = draft
  } else {
    drafts.unshift(draft)
  }

  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts))
  return draft
}

export function deleteDraft(articleId) {
  const drafts = getDrafts()
  const filtered = drafts.filter(d => d.id !== articleId)
  localStorage.setItem(DRAFT_KEY, JSON.stringify(filtered))
  return filtered
}

export function clearDrafts() {
  localStorage.removeItem(DRAFT_KEY)
}

export function startAutoSave(articleId, getContent) {
  return setInterval(() => {
    const content = getContent()
    if (content) {
      saveDraft(articleId, content)
    }
  }, DRAFT_AUTOSAVE_INTERVAL)
}

export function stopAutoSave(timerId) {
  if (timerId) clearInterval(timerId)
}
