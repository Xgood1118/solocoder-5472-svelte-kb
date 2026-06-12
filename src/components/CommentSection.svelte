<script>
  import { onMount, createEventDispatcher } from 'svelte'
  import { mockComments, mockCurrentUser } from '../mock'
  import { localDB } from '../utils/indexedDB'
  import { commentApi } from '../api/comment'

  const dispatch = createEventDispatcher()

  export let articleId = ''

  let comments = []
  let loading = true
  let newComment = ''
  let submitting = false
  let replyTo = null
  let replyContent = ''
  let offline = !navigator.onLine

  onMount(async () => {
    await loadComments()
    window.addEventListener('online', () => {
      offline = false
      loadComments()
    })
    window.addEventListener('offline', () => {
      offline = true
    })
  })

  async function loadComments() {
    loading = true
    try {
      let data
      try {
        if (!navigator.onLine) throw new Error('offline')
        data = await commentApi.getComments(articleId)
        const flat = flattenComments(data)
        await localDB.saveComments(articleId, flat)
      } catch (e) {
        console.warn('从服务器获取评论失败，使用本地缓存:', e)
        const cached = await localDB.getComments(articleId)
        if (cached && cached.length > 0) {
          data = buildTree(cached)
        } else {
          await new Promise(r => setTimeout(r, 200))
          data = mockComments[articleId] || []
          const flat = flattenComments(data)
          await localDB.saveComments(articleId, flat)
        }
      }
      comments = data || []
    } catch (e) {
      console.error('加载评论失败:', e)
      comments = []
    } finally {
      loading = false
    }
  }

  function flattenComments(list, parentId = null, result = []) {
    for (const c of list) {
      result.push({
        id: c.id,
        parentId,
        articleId: c.articleId || articleId,
        author: c.author,
        content: c.content,
        createdAt: c.createdAt,
        likes: c.likes || 0
      })
      if (c.replies && c.replies.length) {
        flattenComments(c.replies, c.id, result)
      }
    }
    return result
  }

  function buildTree(flat) {
    const map = {}
    const roots = []
    for (const c of flat) {
      map[c.id] = { ...c, replies: [] }
    }
    for (const c of flat) {
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].replies.push(map[c.id])
      } else {
        roots.push(map[c.id])
      }
    }
    roots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    for (const r of roots) {
      r.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    }
    return roots
  }

  async function submitComment() {
    if (!newComment.trim()) return
    submitting = true

    const tempId = `temp-${Date.now()}`
    const commentData = {
      id: tempId,
      author: { id: mockCurrentUser.id, name: mockCurrentUser.name },
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: []
    }

    try {
      comments = [...comments, commentData]
      dispatch('countChange', getTotalCount())
      newComment = ''

      await localDB.addComment({ ...commentData, articleId, parentId: null })

      if (navigator.onLine) {
        try {
          const created = await commentApi.createComment(articleId, { content: commentData.content })
          const idx = comments.findIndex(c => c.id === tempId)
          if (idx >= 0) {
            comments[idx] = { ...created, replies: [] }
            await localDB.addComment({ ...created, articleId, parentId: null })
          }
        } catch (e) {
          console.warn('服务器保存评论失败，已缓存到本地:', e)
        }
      }
    } finally {
      submitting = false
    }
  }

  function startReply(comment) {
    replyTo = comment
    replyContent = ''
  }

  function cancelReply() {
    replyTo = null
    replyContent = ''
  }

  async function submitReply() {
    if (!replyContent.trim() || !replyTo) return
    submitting = true

    const tempId = `temp-${Date.now()}`
    const reply = {
      id: tempId,
      parentId: replyTo.id,
      author: { id: mockCurrentUser.id, name: mockCurrentUser.name },
      content: replyContent.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: []
    }

    try {
      const replyTargetId = replyTo.id
      updateTree(comments, replyTargetId, (parent) => {
        parent.replies = [...(parent.replies || []), reply]
        return parent
      })
      comments = [...comments]
      dispatch('countChange', getTotalCount())
      replyTo = null
      replyContent = ''

      await localDB.addComment({ ...reply, articleId })

      if (navigator.onLine) {
        try {
          const created = await commentApi.replyComment(articleId, replyTargetId, { content: reply.content })
          updateTree(comments, tempId, (_, list, idx) => {
            list[idx] = { ...created, replies: [] }
          })
          comments = [...comments]
          await localDB.addComment({ ...created, articleId, parentId: replyTargetId })
        } catch (e) {
          console.warn('服务器保存回复失败:', e)
        }
      }
    } finally {
      submitting = false
    }
  }

  function updateTree(list, targetId, updater) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === targetId) {
        list[i] = updater(list[i], list, i)
        return true
      }
      if (list[i].replies && list[i].replies.length > 0) {
        if (updateTree(list[i].replies, targetId, updater)) return true
      }
    }
    return false
  }

  function removeFromTree(list, targetId) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === targetId) {
        list.splice(i, 1)
        return true
      }
      if (list[i].replies && list[i].replies.length > 0) {
        if (removeFromTree(list[i].replies, targetId)) return true
      }
    }
    return false
  }

  async function toggleLike(comment) {
    const liked = await localDB.hasLiked(comment.id)
    const prevLikes = comment.likes

    if (liked) {
      updateTree(comments, comment.id, (c) => ({ ...c, likes: Math.max(0, c.likes - 1) }))
      comments = [...comments]
      await localDB.setLiked(comment.id, false)

      if (navigator.onLine) {
        try { await commentApi.unlikeComment(articleId, comment.id) } catch(e) {
          updateTree(comments, comment.id, (c) => ({ ...c, likes: prevLikes }))
          comments = [...comments]
          await localDB.setLiked(comment.id, true)
        }
      }
    } else {
      updateTree(comments, comment.id, (c) => ({ ...c, likes: c.likes + 1 }))
      comments = [...comments]
      await localDB.setLiked(comment.id, true)

      if (navigator.onLine) {
        try { await commentApi.likeComment(articleId, comment.id) } catch(e) {
          updateTree(comments, comment.id, (c) => ({ ...c, likes: prevLikes }))
          comments = [...comments]
          await localDB.setLiked(comment.id, false)
        }
      }
    }
  }

  async function deleteComment(comment) {
    if (comment.author.id !== mockCurrentUser.id) return
    if (!confirm('确定删除这条评论吗？')) return

    removeFromTree(comments, comment.id)
    comments = [...comments]
    dispatch('countChange', getTotalCount())
    await localDB.deleteComment(comment.id)

    if (navigator.onLine) {
      try {
        await commentApi.deleteComment(articleId, comment.id)
      } catch (e) {
        console.warn('服务器删除失败，本地已删除:', e)
      }
    }
  }

  function getTotalCount() {
    let count = 0
    function walk(list) {
      for (const c of list) {
        count++
        if (c.replies) walk(c.replies)
      }
    }
    walk(comments)
    return count
  }

  function formatTime(dateStr) {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
</script>

<div class="comment-section">
  <div class="comment-header">
    <h3>评论 <span class="count">({getTotalCount()})</span></h3>
    {#if offline}
      <span class="offline-tag">离线模式 · 本地缓存</span>
    {/if}
  </div>

  <div class="comment-input">
    <div class="input-avatar">{mockCurrentUser.name.charAt(0)}</div>
    <div class="input-body">
      <textarea
        bind:value={newComment}
        placeholder="写点什么..."
        rows="3"
        disabled={submitting}
      ></textarea>
      <div class="input-actions">
        <button
          class="submit-btn"
          disabled={!newComment.trim() || submitting}
          on:click={submitComment}
        >
          {#if submitting}提交中...{:else}发表评论{/if}
        </button>
      </div>
    </div>
  </div>

  <div class="comment-list">
    {#if loading}
      <div class="loading">加载中...</div>
    {:else if comments.length === 0}
      <div class="empty">暂无评论，来发表第一条评论吧～</div>
    {:else}
      {#each comments as comment (comment.id)}
        <div class="comment-item">
          <div class="comment-avatar">{comment.author.name.charAt(0)}</div>
          <div class="comment-body">
            <div class="comment-meta">
              <span class="author-name">{comment.author.name}</span>
              <span class="comment-time">{formatTime(comment.createdAt)}</span>
            </div>
            <div class="comment-content">{comment.content}</div>
            <div class="comment-actions">
              <button class="action-btn like" on:click={() => toggleLike(comment)}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                </svg>
                {comment.likes > 0 ? comment.likes : '点赞'}
              </button>
              <button class="action-btn reply" on:click={() => startReply(comment)}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 17 4 12 9 7"/>
                  <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                </svg>
                回复
              </button>
              {#if comment.author.id === mockCurrentUser.id}
                <button class="action-btn delete" on:click={() => deleteComment(comment)}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  删除
                </button>
              {/if}
            </div>

            {#if replyTo && replyTo.id === comment.id}
              <div class="reply-input">
                <div class="reply-to-tag">回复 @{replyTo.author.name}:</div>
                <textarea
                  bind:value={replyContent}
                  placeholder="写下你的回复..."
                  rows="2"
                ></textarea>
                <div class="reply-actions">
                  <button class="cancel-reply" on:click={cancelReply}>取消</button>
                  <button class="submit-reply" disabled={!replyContent.trim() || submitting} on:click={submitReply}>
                    {#if submitting}提交中...{:else}回复{/if}
                  </button>
                </div>
              </div>
            {/if}

            {#if comment.replies && comment.replies.length > 0}
              <div class="reply-list">
                {#each comment.replies as reply (reply.id)}
                  <div class="reply-item">
                    <div class="reply-avatar">{reply.author.name.charAt(0)}</div>
                    <div class="reply-body">
                      <div class="comment-meta">
                        <span class="author-name">{reply.author.name}</span>
                        <span class="comment-time">{formatTime(reply.createdAt)}</span>
                      </div>
                      <div class="comment-content">{reply.content}</div>
                      <div class="comment-actions">
                        <button class="action-btn like" on:click={() => toggleLike(reply)}>
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                          </svg>
                          {reply.likes > 0 ? reply.likes : ''}
                        </button>
                        <button class="action-btn reply" on:click={() => startReply({...reply, _parent: comment})}>
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 17 4 12 9 7"/>
                            <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                          </svg>
                          回复
                        </button>
                        {#if reply.author.id === mockCurrentUser.id}
                          <button class="action-btn delete" on:click={() => deleteComment(reply)}>
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                            删除
                          </button>
                        {/if}
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .comment-section {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #f2f3f5;
  }

  .comment-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .comment-header h3 {
    font-size: 16px;
    font-weight: 600;
  }

  .count {
    font-size: 14px;
    font-weight: 400;
    color: #86909c;
  }

  .offline-tag {
    padding: 2px 8px;
    background: #fff7e6;
    color: #ff7d00;
    border-radius: 4px;
    font-size: 12px;
  }

  .comment-input {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    padding: 16px;
    background: #f7f8fa;
    border-radius: 10px;
  }

  .input-avatar,
  .comment-avatar,
  .reply-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
    flex-shrink: 0;
  }

  .reply-avatar {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .input-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .comment-input textarea,
  .reply-input textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e5e6eb;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    background: #fff;
    outline: none;
    transition: border-color 0.2s;
  }

  .comment-input textarea:focus,
  .reply-input textarea:focus {
    border-color: #3370ff;
  }

  .comment-input textarea:disabled {
    background: #f2f3f5;
    cursor: not-allowed;
  }

  .input-actions,
  .reply-actions {
    display: flex;
    justify-content: flex-end;
  }

  .submit-btn {
    padding: 6px 16px;
    background: #3370ff;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .submit-btn:hover:not(:disabled) {
    background: #265cd1;
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .comment-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .loading,
  .empty {
    padding: 40px;
    text-align: center;
    color: #86909c;
    font-size: 14px;
  }

  .comment-item {
    display: flex;
    gap: 12px;
  }

  .comment-body {
    flex: 1;
    min-width: 0;
  }

  .comment-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }

  .author-name {
    font-size: 13px;
    font-weight: 500;
    color: #1f2329;
  }

  .comment-time {
    font-size: 12px;
    color: #86909c;
  }

  .comment-content {
    font-size: 14px;
    line-height: 1.7;
    color: #4e5969;
    margin-bottom: 8px;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .comment-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 12px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border: none;
    background: transparent;
    color: #86909c;
    font-size: 12px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.15s;
  }

  .action-btn:hover {
    background: #f2f3f5;
    color: #1f2329;
  }

  .action-btn.like:hover {
    color: #f53f3f;
    background: #fff3f0;
  }

  .action-btn.delete:hover {
    color: #f53f3f;
    background: #fff3f0;
  }

  .reply-input {
    margin: 8px 0 12px;
    padding: 12px;
    background: #f7f8fa;
    border-radius: 8px;
  }

  .reply-to-tag {
    font-size: 12px;
    color: #3370ff;
    margin-bottom: 6px;
  }

  .reply-actions {
    gap: 8px;
    margin-top: 8px;
  }

  .cancel-reply {
    padding: 4px 12px;
    border: 1px solid #e5e6eb;
    background: #fff;
    color: #4e5969;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
  }

  .cancel-reply:hover {
    border-color: #c9cdd4;
  }

  .submit-reply {
    padding: 4px 12px;
    background: #3370ff;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
  }

  .submit-reply:hover:not(:disabled) {
    background: #265cd1;
  }

  .submit-reply:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .reply-list {
    margin-left: 12px;
    padding-left: 12px;
    border-left: 2px solid #f2f3f5;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .reply-item {
    display: flex;
    gap: 10px;
  }

  .reply-body {
    flex: 1;
    min-width: 0;
  }
</style>
