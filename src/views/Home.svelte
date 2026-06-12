<script>
  import { onMount } from 'svelte'
  import { mockArticles } from '../mock'

  let hotArticles = []
  let recentUpdated = []

  onMount(() => {
    const articles = Object.values(mockArticles)
    hotArticles = [...articles].sort((a, b) => b.views - a.views).slice(0, 5)
    recentUpdated = [...articles].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5)
  })

  function formatDate(dateStr) {
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  function goToArticle(id) {
    window.location.hash = `#/article/${id}`
  }
</script>

<div class="home-page">
  <div class="welcome-section">
    <h1>欢迎使用团队知识库</h1>
    <p>沉淀团队智慧，让知识流转起来</p>
  </div>

  <div class="stats-section">
    <div class="stat-card">
      <div class="stat-number">{Object.keys(mockArticles).length}</div>
      <div class="stat-label">文档总数</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">6</div>
      <div class="stat-label">团队分组</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">40</div>
      <div class="stat-label">团队成员</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">98%</div>
      <div class="stat-label">覆盖率</div>
    </div>
  </div>

  <div class="content-grid">
    <div class="panel">
      <div class="panel-header">
        <h2>🔥 最热文章</h2>
      </div>
      <div class="panel-body">
        <ul class="article-list">
          {#each hotArticles as article (article.id)}
            <li class="article-item" on:click={() => goToArticle(article.id)}>
              <span class="rank">{hotArticles.indexOf(article) + 1}</span>
              <span class="title">{article.title}</span>
              <span class="views">{article.views} 阅读</span>
            </li>
          {/each}
        </ul>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <h2>📅 最近更新</h2>
      </div>
      <div class="panel-body">
        <ul class="article-list">
          {#each recentUpdated as article (article.id)}
            <li class="article-item" on:click={() => goToArticle(article.id)}>
              <span class="title">{article.title}</span>
              <span class="date">{formatDate(article.updatedAt)}</span>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</div>

<style>
  .home-page {
    max-width: 1000px;
    margin: 0 auto;
  }

  .welcome-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 40px;
    border-radius: 12px;
    margin-bottom: 24px;
  }

  .welcome-section h1 {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .welcome-section p {
    font-size: 14px;
    opacity: 0.9;
  }

  .stats-section {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    background: #fff;
    border-radius: 10px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .stat-number {
    font-size: 32px;
    font-weight: 700;
    color: #3370ff;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 13px;
    color: #86909c;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .panel {
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .panel-header {
    padding: 16px 20px;
    border-bottom: 1px solid #f2f3f5;
  }

  .panel-header h2 {
    font-size: 15px;
    font-weight: 600;
  }

  .panel-body {
    padding: 8px 0;
  }

  .article-list {
    list-style: none;
  }

  .article-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    cursor: pointer;
    transition: background 0.15s;
    gap: 12px;
  }

  .article-item:hover {
    background: #f7f8fa;
  }

  .rank {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background: #f2f3f5;
    font-size: 12px;
    font-weight: 600;
    color: #86909c;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .article-item:nth-child(1) .rank { background: #ff3b30; color: #fff; }
  .article-item:nth-child(2) .rank { background: #ff9500; color: #fff; }
  .article-item:nth-child(3) .rank { background: #ffcc00; color: #fff; }

  .title {
    flex: 1;
    font-size: 14px;
    color: #1f2329;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .views {
    font-size: 12px;
    color: #86909c;
    flex-shrink: 0;
  }

  .date {
    font-size: 12px;
    color: #86909c;
    flex-shrink: 0;
  }
</style>
