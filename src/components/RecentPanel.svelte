<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import { getRecentArticles } from '../utils/storage'

  const dispatch = createEventDispatcher()

  let recentArticles = []

  onMount(() => {
    recentArticles = getRecentArticles()
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

  function goToArticle(id) {
    window.location.hash = `#/article/${id}`
    dispatch('close')
  }
</script>

<div class="panel-overlay" on:click={() => dispatch('close')}>
  <div class="panel" on:click|stopPropagation>
    <div class="panel-header">
      <h3>最近浏览</h3>
      <button class="close-btn" on:click={() => dispatch('close')}>×</button>
    </div>
    <div class="panel-content">
      {#if recentArticles.length === 0}
        <div class="empty">暂无浏览记录</div>
      {:else}
        <ul class="recent-list">
          {#each recentArticles as article (article.id)}
            <li class="recent-item" on:click={() => goToArticle(article.id)}>
              <span class="item-icon">📄</span>
              <div class="item-info">
                <span class="item-title">{article.title}</span>
                <span class="item-path">{article.path || '根目录'}</span>
              </div>
              <span class="item-time">{formatTime(article.visitedAt)}</span>
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
    font-size: 14px;
  }

  .recent-list {
    list-style: none;
    padding: 8px 0;
  }

  .recent-item {
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .recent-item:hover {
    background: #f7f8fa;
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

  .item-path {
    font-size: 12px;
    color: #86909c;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-time {
    font-size: 12px;
    color: #86909c;
    flex-shrink: 0;
  }
</style>
