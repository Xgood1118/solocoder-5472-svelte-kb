<script>
  import { onMount } from 'svelte'
  import { mockArticles } from '../mock'
  import { rankResults, highlightText } from '../utils/search'
  import { extractPlainText } from '../utils/markdown'

  let keyword = ''
  let results = []
  let loading = false
  let query = ''

  onMount(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '')
    query = params.get('q') || ''
    keyword = query
    if (query) {
      doSearch()
    }
  })

  function doSearch() {
    loading = true
    results = []

    setTimeout(() => {
      const articles = Object.values(mockArticles).map(a => ({
        ...a,
        plainContent: extractPlainText(a.content)
      }))
      results = rankResults(articles, keyword)
      loading = false
    }, 300)
  }

  function handleSearch() {
    if (!keyword.trim()) return
    query = keyword
    doSearch()
  }

  function handleKeydown(e) {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  function goToArticle(id) {
    window.location.hash = `#/article/${id}`
  }

  function getHighlightedText(text, keywords) {
    return highlightText(text, keywords)
  }

  function getSnippet(content) {
    const plain = extractPlainText(content)
    const keywords = keyword.trim().toLowerCase().split(/\s+/)
    let snippet = plain.slice(0, 200)

    for (const kw of keywords) {
      const idx = plain.toLowerCase().indexOf(kw)
      if (idx !== -1) {
        const start = Math.max(0, idx - 50)
        const end = Math.min(plain.length, idx + 150)
        snippet = plain.slice(start, end)
        if (start > 0) snippet = '...' + snippet
        if (end < plain.length) snippet = snippet + '...'
        break
      }
    }

    return highlightText(snippet, keywords)
  }
</script>

<div class="search-page">
  <div class="search-header">
    <div class="search-box">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="text"
        placeholder="搜索标题、内容或标签..."
        bind:value={keyword}
        on:keydown={handleKeydown}
      />
      <button class="search-btn" on:click={handleSearch}>搜索</button>
    </div>
  </div>

  <div class="search-results">
    {#if loading}
      <div class="loading">搜索中...</div>
    {:else if query}
      <div class="result-count">找到 {results.length} 个结果</div>

      {#if results.length === 0}
        <div class="empty">
          <div class="empty-icon">🔍</div>
          <p>没有找到相关内容</p>
          <p class="empty-tip">试试其他关键词吧</p>
        </div>
      {:else}
        <ul class="result-list">
          {#each results as result (result.id)}
            <li class="result-item" on:click={() => goToArticle(result.id)}>
              <h3 class="result-title">
                {@html getHighlightedText(result.title, keyword.trim().split(/\s+/))}
              </h3>
              <p class="result-snippet">
                {@html getSnippet(result.content)}
              </p>
              <div class="result-meta">
                <span class="result-author">{result.author.name}</span>
                <span class="result-views">{result.views} 阅读</span>
                <div class="result-tags">
                  {#each result.tags.slice(0, 3) as tag}
                    <span class="tag">#{tag}</span>
                  {/each}
                </div>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    {:else}
      <div class="empty">
        <div class="empty-icon">📝</div>
        <p>输入关键词开始搜索</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .search-page {
    max-width: 800px;
    margin: 0 auto;
  }

  .search-header {
    background: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    background: #f7f8fa;
    border: 1px solid #e5e6eb;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .search-box:focus-within {
    background: #fff;
    border-color: #3370ff;
    box-shadow: 0 0 0 3px rgba(51, 112, 255, 0.1);
  }

  .search-box svg {
    color: #86909c;
    flex-shrink: 0;
  }

  .search-box input {
    flex: 1;
    height: 44px;
    border: none;
    background: transparent;
    outline: none;
    font-size: 15px;
    color: #1f2329;
  }

  .search-box input::placeholder {
    color: #86909c;
  }

  .search-btn {
    padding: 8px 20px;
    background: #3370ff;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .search-btn:hover {
    background: #265cd1;
  }

  .search-results {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    padding: 8px 0;
  }

  .loading {
    padding: 60px;
    text-align: center;
    color: #86909c;
  }

  .result-count {
    padding: 16px 24px;
    font-size: 13px;
    color: #86909c;
    border-bottom: 1px solid #f2f3f5;
  }

  .empty {
    padding: 80px 24px;
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
    font-size: 13px;
    color: #c9cdd4;
  }

  .result-list {
    list-style: none;
  }

  .result-item {
    padding: 20px 24px;
    border-bottom: 1px solid #f2f3f5;
    cursor: pointer;
    transition: background 0.15s;
  }

  .result-item:last-child {
    border-bottom: none;
  }

  .result-item:hover {
    background: #f7f8fa;
  }

  .result-title {
    font-size: 16px;
    font-weight: 500;
    color: #1f2329;
    margin-bottom: 8px;
  }

  .result-title :global(mark) {
    background: #fff3cd;
    padding: 0 2px;
    border-radius: 2px;
  }

  .result-snippet {
    font-size: 13px;
    color: #4e5969;
    line-height: 1.6;
    margin-bottom: 12px;
  }

  .result-snippet :global(mark) {
    background: #fff3cd;
    padding: 0 2px;
    border-radius: 2px;
  }

  .result-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 12px;
    color: #86909c;
  }

  .result-tags {
    display: flex;
    gap: 6px;
    margin-left: auto;
  }

  .tag {
    padding: 2px 8px;
    background: #f2f3f5;
    border-radius: 10px;
    font-size: 11px;
    color: #4e5969;
  }
</style>
