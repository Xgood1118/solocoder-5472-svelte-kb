<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import { getDrafts, deleteDraft } from '../utils/storage'

  const dispatch = createEventDispatcher()

  let drafts = []

  onMount(() => {
    drafts = getDrafts()
  })

  function formatTime(timestamp) {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`

    const date = new Date(timestamp)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  function continueEdit(id) {
    window.location.hash = `#/article/${id}/edit`
    dispatch('close')
  }

  function removeDraft(id, e) {
    e.stopPropagation()
    drafts = deleteDraft(id)
  }
</script>

<div class="panel-overlay" on:click={() => dispatch('close')}>
  <div class="panel" on:click|stopPropagation>
    <div class="panel-header">
      <h3>我的草稿</h3>
      <button class="close-btn" on:click={() => dispatch('close')}>×</button>
    </div>
    <div class="panel-content">
      {#if drafts.length === 0}
        <div class="empty">
          <div class="empty-icon">📝</div>
          <p>暂无草稿</p>
          <p class="empty-tip">编辑中的文档会自动保存到草稿</p>
        </div>
      {:else}
        <ul class="draft-list">
          {#each drafts as draft (draft.id)}
            <li class="draft-item" on:click={() => continueEdit(draft.id)}>
              <span class="item-icon">📄</span>
              <div class="item-info">
                <span class="item-title">{draft.title || '未命名文档'}</span>
                <span class="item-time">自动保存于 {formatTime(draft.updatedAt)}</span>
              </div>
              <button class="delete-btn" title="删除草稿" on:click={(e) => removeDraft(draft.id, e)}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</div>

<style>
  .panel-overlay {
    position: fixed;
    top: 56px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 200;
    display: flex;
    justify-content: flex-end;
  }

  .panel {
    width: 360px;
    height: 100%;
    background: #fff;
    box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    animation: slideIn 0.25s ease;
  }

  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  .panel-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e5e6eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .panel-header h3 {
    font-size: 16px;
    font-weight: 600;
  }

  .close-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    font-size: 20px;
    cursor: pointer;
    color: #86909c;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn:hover {
    background: #f2f3f5;
    color: #1f2329;
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
  }

  .empty {
    padding: 48px 20px;
    text-align: center;
    color: #86909c;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .empty p {
    margin: 4px 0;
  }

  .empty-tip {
    font-size: 12px;
    color: #c9cdd4;
  }

  .draft-list {
    list-style: none;
    padding: 8px 0;
  }

  .draft-item {
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .draft-item:hover {
    background: #f7f8fa;
  }

  .draft-item:hover .delete-btn {
    opacity: 1;
  }

  .item-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  .item-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .item-title {
    font-size: 14px;
    color: #1f2329;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-time {
    font-size: 12px;
    color: #86909c;
  }

  .delete-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: #86909c;
    border-radius: 4px;
    opacity: 0;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .delete-btn:hover {
    background: #fff3f0;
    color: #f53f3f;
  }
</style>
