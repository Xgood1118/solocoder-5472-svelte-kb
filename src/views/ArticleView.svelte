<script>
  import { onMount } from 'svelte'
  import { mockArticles, mockVersions } from '../mock'
  import MarkdownPreview from '../components/MarkdownPreview.svelte'
  import CommentSection from '../components/CommentSection.svelte'
  import { addRecentArticle } from '../utils/storage'
  import { tree } from '../stores/tree'

  export let params = {}

  let article = null
  let loading = true
  let error = null
  let lockInfo = null
  let showVersionPanel = false
  let commentCount = 0

  onMount(() => {
    loadArticle()
  })

  function loadArticle() {
    loading = true
    error = null

    setTimeout(() => {
      article = mockArticles[params.id]
      if (!article) {
        error = '文档不存在'
      } else {
        addRecentArticle(article)
        tree.expandToNode(article.id, tree.nodes)
      }
      loading = false
    }, 200)
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  function goEdit() {
    window.location.hash = `#/article/${params.id}/edit`
  }

  function goVersionCompare() {
    window.location.hash = `#/version/compare/${params.id}`
  }
</script>

<div class="article-view">
  {#if loading}
    <div class="loading">加载中...</div>
  {:else if error}
    <div class="error">
      <h2>404</h2>
      <p>文档不存在或您没有访问权限</p>
    </div>
  {:else}
    <div class="article-header">
      <h1 class="article-title">{article.title}</h1>
      <div class="article-meta">
        <div class="meta-left">
          <span class="author">
            <span class="avatar">{article.author.name.charAt(0)}</span>
            {article.author.name}
          </span>
          <span class="meta-item">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {formatDate(article.updatedAt)}
          </span>
          <span class="category">{article.category}</span>
        </div>
        <div class="meta-right">
          <span class="stat-item" title="阅读量">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            {article.views}
          </span>
          <span class="stat-item" title="点赞">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            {article.likes}
          </span>
          <span class="stat-item" title="评论">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {commentCount > 0 ? commentCount : article.comments}
          </span>
        </div>
      </div>

      <div class="tags">
        {#each article.tags as tag}
          <span class="tag">#{tag}</span>
        {/each}
      </div>

      <div class="article-actions">
        <button class="btn btn-primary" on:click={goEdit}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          编辑文档
        </button>
        <button class="btn" on:click={goVersionCompare}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          版本历史
        </button>
      </div>
    </div>

    <div class="article-content">
      <MarkdownPreview content={article.content} />
    </div>

    <div style="padding: 0 40px 40px;">
      <CommentSection
        articleId={params.id}
        on:countChange={(e) => commentCount = e.detail}
      />
    </div>
  {/if}
</div>

<style>
  .article-view {
    max-width: 960px;
    margin: 0 auto;
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

  .article-header {
    padding: 32px 40px 24px;
    border-bottom: 1px solid #f2f3f5;
  }

  .article-title {
    font-size: 28px;
    font-weight: 600;
    color: #1f2329;
    margin-bottom: 16px;
    line-height: 1.4;
  }

  .article-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-size: 13px;
    color: #86909c;
  }

  .meta-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .author {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #4e5969;
  }

  .avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .category {
    padding: 2px 8px;
    background: #e8f3ff;
    color: #3370ff;
    border-radius: 4px;
    font-size: 12px;
  }

  .meta-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: color 0.2s;
  }

  .stat-item:hover {
    color: #3370ff;
  }

  .tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  .tag {
    padding: 4px 10px;
    background: #f2f3f5;
    color: #4e5969;
    border-radius: 14px;
    font-size: 12px;
  }

  .article-actions {
    display: flex;
    gap: 12px;
  }

  .btn {
    padding: 8px 16px;
    border: 1px solid #e5e6eb;
    background: #fff;
    border-radius: 6px;
    font-size: 13px;
    color: #4e5969;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
  }

  .btn:hover {
    border-color: #c9cdd4;
    color: #1f2329;
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

  .article-content {
    padding: 24px 40px 40px;
  }
</style>
