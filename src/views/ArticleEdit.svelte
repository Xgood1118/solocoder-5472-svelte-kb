<script>
  import { onMount, onDestroy } from 'svelte'
  import { mockArticles, mockCurrentUser } from '../mock'
  import MarkdownEditor from '../components/MarkdownEditor.svelte'
  import MarkdownPreview from '../components/MarkdownPreview.svelte'
  import { saveDraft, deleteDraft, startAutoSave, stopAutoSave, getDraft } from '../utils/storage'
  import { articleApi } from '../api/article'

  export let params = {}

  let article = null
  let loading = true
  let saving = false
  let content = ''
  let title = ''
  let lockInfo = null
  let isLocked = false
  let lockUser = null
  let autoSaveTimer = null
  let lockRenewTimer = null
  let lastSaved = null
  let splitRatio = 50
  let isResizing = false

  onMount(() => {
    loadArticle()
  })

  onDestroy(async () => {
    stopAutoSave(autoSaveTimer)
    if (lockRenewTimer) clearInterval(lockRenewTimer)
    if (lockInfo && lockInfo.locked) {
      try {
        await articleApi.releaseLock(params.id)
      } catch (e) {
        console.warn('释放编辑锁失败:', e)
      }
    }
  })

  async function loadArticle() {
    loading = true

    try {
      article = mockArticles[params.id]
      if (article) {
        const draft = getDraft(params.id)
        if (draft && new Date(draft.updatedAt) > new Date(article.updatedAt)) {
          content = draft.content
          title = draft.title
          lastSaved = draft.updatedAt
        } else {
          content = article.content
          title = article.title
        }

        try {
          const lockData = await articleApi.acquireLock(params.id)
          lockInfo = {
            locked: true,
            user: lockData.user || mockCurrentUser,
            expiresAt: Date.now() + 5 * 60 * 1000
          }

          lockRenewTimer = setInterval(async () => {
            if (lockInfo && lockInfo.locked) {
              try {
                await articleApi.renewLock(params.id)
                lockInfo.expiresAt = Date.now() + 5 * 60 * 1000
              } catch (e) {
                console.warn('续期编辑锁失败:', e)
              }
            }
          }, 4 * 60 * 1000)
        } catch (lockErr) {
          const currentLock = await articleApi.getArticleLock(params.id)
          isLocked = true
          lockUser = currentLock.user
        }

        autoSaveTimer = startAutoSave(params.id, () => ({
          title,
          content
        }))
      }
    } catch (e) {
      console.error('加载文章失败:', e)
    }

    loading = false
  }

  function handleContentChange(e) {
    content = e.detail
  }

  function handleTitleInput(e) {
    title = e.target.value
  }

  async function handleSave() {
    saving = true

    try {
      await new Promise(r => setTimeout(r, 500))

      deleteDraft(params.id)
      lastSaved = Date.now()
    } finally {
      saving = false
      await releaseCurrentLock()
      window.location.hash = `#/article/${params.id}`
    }
  }

  async function handleCancel() {
    await releaseCurrentLock()
    window.location.hash = `#/article/${params.id}`
  }

  async function releaseCurrentLock() {
    if (lockInfo && lockInfo.locked) {
      try {
        await articleApi.releaseLock(params.id)
      } catch (e) {
        console.warn('释放编辑锁失败:', e)
      } finally {
        lockInfo = null
      }
    }
  }

  function startResize(e) {
    isResizing = true
    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', stopResize)
    e.preventDefault()
  }

  function handleResize(e) {
    if (!isResizing) return
    const container = e.currentTarget?.parentElement || document.querySelector('.editor-container')
    if (!container) return
    const rect = container.getBoundingClientRect()
    const ratio = ((e.clientX - rect.left) / rect.width) * 100
    splitRatio = Math.max(20, Math.min(80, ratio))
  }

  function stopResize() {
    isResizing = false
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
  }

  function formatLastSaved() {
    if (!lastSaved) return ''
    const date = new Date(lastSaved)
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
  }
</script>

<div class="edit-page">
  {#if loading}
    <div class="loading">加载中...</div>
  {:else if !article}
    <div class="error">
      <h2>404</h2>
      <p>文档不存在</p>
    </div>
  {:else if isLocked}
    <div class="locked-state">
      <div class="locked-icon">🔒</div>
      <h2>文档正在被编辑</h2>
      <p class="locked-user">
        <span class="avatar">{lockUser?.name?.charAt(0) || '?'}</span>
        {lockUser?.name || '未知用户'} 正在编辑这篇文档
      </p>
      <p class="locked-tip">请稍后再试，或联系编辑者协调</p>
      <button class="btn" on:click={handleCancel}>返回查看</button>
    </div>
  {:else}
    <div class="edit-toolbar">
      <div class="toolbar-left">
        <input
          class="title-input"
          type="text"
          placeholder="输入文档标题..."
          value={title}
          on:input={handleTitleInput}
        />
      </div>
      <div class="toolbar-right">
        {#if lastSaved}
          <span class="save-status">已自动保存于 {formatLastSaved()}</span>
        {/if}
        <button class="btn" on:click={handleCancel}>取消</button>
        <button class="btn btn-primary" disabled={saving} on:click={handleSave}>
          {#if saving}保存中...{:else}保存{/if}
        </button>
      </div>
    </div>

    <div class="editor-container" class:resizing={isResizing}>
      <div class="editor-pane" style="width: {splitRatio}%">
        <div class="pane-header">编辑</div>
        <div class="pane-content">
          <MarkdownEditor
            value={content}
            on:change={handleContentChange}
            readOnly={false}
          />
        </div>
      </div>

      <div class="resize-handle" on:mousedown={startResize}>
        <div class="resize-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div class="preview-pane" style="width: {100 - splitRatio}%">
        <div class="pane-header">预览</div>
        <div class="pane-content">
          <MarkdownPreview content={content} />
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .edit-page {
    height: calc(100vh - 56px - 48px);
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }

  .loading {
    padding: 80px;
    text-align: center;
    color: #86909c;
  }

  .error {
    padding: 80px;
    text-align: center;
  }

  .error h2 {
    font-size: 48px;
    color: #c9cdd4;
    margin-bottom: 12px;
  }

  .error p {
    color: #86909c;
  }

  .locked-state {
    padding: 80px;
    text-align: center;
  }

  .locked-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }

  .locked-state h2 {
    font-size: 20px;
    margin-bottom: 16px;
  }

  .locked-user {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #4e5969;
    margin-bottom: 8px;
  }

  .locked-user .avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .locked-tip {
    color: #86909c;
    font-size: 13px;
    margin-bottom: 24px;
  }

  .edit-toolbar {
    height: 56px;
    padding: 0 20px;
    border-bottom: 1px solid #e5e6eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }

  .toolbar-left {
    flex: 1;
    min-width: 0;
  }

  .title-input {
    width: 100%;
    font-size: 18px;
    font-weight: 600;
    border: none;
    outline: none;
    background: transparent;
    color: #1f2329;
  }

  .title-input::placeholder {
    color: #c9cdd4;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .save-status {
    font-size: 12px;
    color: #00b42a;
  }

  .btn {
    padding: 6px 14px;
    border: 1px solid #e5e6eb;
    background: #fff;
    border-radius: 6px;
    font-size: 13px;
    color: #4e5969;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn:hover {
    border-color: #c9cdd4;
    color: #1f2329;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary {
    background: #3370ff;
    border-color: #3370ff;
    color: #fff;
  }

  .btn-primary:hover {
    background: #265cd1;
    border-color: #265cd1;
    color: #fff;
  }

  .editor-container {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .editor-container.resizing {
    user-select: none;
    cursor: col-resize;
  }

  .editor-pane, .preview-pane {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pane-header {
    height: 36px;
    padding: 0 16px;
    background: #f7f8fa;
    border-bottom: 1px solid #e5e6eb;
    font-size: 12px;
    color: #86909c;
    display: flex;
    align-items: center;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .pane-content {
    flex: 1;
    overflow: hidden;
  }

  .resize-handle {
    width: 6px;
    background: #f2f3f5;
    cursor: col-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.2s;
  }

  .resize-handle:hover {
    background: #3370ff;
  }

  .resize-dots {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .resize-dots span {
    width: 3px;
    height: 3px;
    background: #c9cdd4;
    border-radius: 50%;
  }

  .resize-handle:hover .resize-dots span {
    background: #fff;
  }
</style>
