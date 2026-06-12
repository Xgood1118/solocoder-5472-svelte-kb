import { openDB } from 'idb'

const DB_NAME = 'kb_interactions'
const DB_VERSION = 1
const STORES = {
  COMMENTS: 'comments',
  LIKES: 'likes'
}

let dbPromise = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORES.COMMENTS)) {
          const commentStore = db.createObjectStore(STORES.COMMENTS, { keyPath: 'id' })
          commentStore.createIndex('articleId', 'articleId', { unique: false })
          commentStore.createIndex('createdAt', 'createdAt', { unique: false })
        }
        if (!db.objectStoreNames.contains(STORES.LIKES)) {
          const likeStore = db.createObjectStore(STORES.LIKES, { keyPath: 'id' })
          likeStore.createIndex('articleId', 'articleId', { unique: false })
        }
      }
    })
  }
  return dbPromise
}

export const localDB = {
  async saveComments(articleId, comments) {
    const db = await getDB()
    const tx = db.transaction(STORES.COMMENTS, 'readwrite')
    for (const comment of comments) {
      await tx.store.put({ ...comment, articleId })
    }
    await tx.done
  },

  async getComments(articleId) {
    const db = await getDB()
    const index = db.transaction(STORES.COMMENTS).store.index('articleId')
    const comments = await index.getAll(articleId)
    return comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  async addComment(comment) {
    const db = await getDB()
    await db.put(STORES.COMMENTS, comment)
  },

  async deleteComment(commentId) {
    const db = await getDB()
    await db.delete(STORES.COMMENTS, commentId)
  },

  async updateComment(commentId, updates) {
    const db = await getDB()
    const existing = await db.get(STORES.COMMENTS, commentId)
    if (existing) {
      await db.put(STORES.COMMENTS, { ...existing, ...updates })
    }
  },

  async saveLikes(articleId, likes) {
    const db = await getDB()
    const tx = db.transaction(STORES.LIKES, 'readwrite')
    for (const like of likes) {
      await tx.store.put({ ...like, articleId })
    }
    await tx.done
  },

  async hasLiked(commentId) {
    const db = await getDB()
    const like = await db.get(STORES.LIKES, commentId)
    return !!like
  },

  async setLiked(commentId, liked) {
    const db = await getDB()
    if (liked) {
      await db.put(STORES.LIKES, { id: commentId, likedAt: Date.now() })
    } else {
      await db.delete(STORES.LIKES, commentId)
    }
  }
}
