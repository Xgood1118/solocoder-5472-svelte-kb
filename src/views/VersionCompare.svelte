<script>
  import { onMount } from 'svelte'
  import { mockArticles, mockVersions } from '../mock'
  import { blockDiff } from '../utils/diff'
  import { renderMarkdown } from '../utils/markdown'

  export let params = {}

  let article = null
  let versions = []
  let oldVersion = null
  let newVersion = null
  let diffResult = []
  let loading = true
  let compareMode = 'block'

  onMount(() => {
    loadData()
  })

  function loadData() {
    loading = true

    setTimeout(() => {
      article = mockArticles[params.id]
      versions = mockVersions[params.id] || []

      if (versions.length >= 2) {
        newVersion = versions[0]
        oldVersion = versions[1]
        doCompare()
      }

      loading = false
    }, 200)
  }

  function doCompare() {
    if (!article) return

    const oldContent = article.content + '\n\n## 旧版本段落\n\n这是旧版本独有的内容。'
    const newContent = article.content

    diffResult = blockDiff(oldContent, newContent)
  }

  function selectOldVersion(v) {
    oldVersion = v
    doCompare()
  }

  function selectNewVersion(v) {
    newVersion = v
    doCompare()
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  function renderBlockDiff(block) {
    if (block.type === 'unchanged') {
      return `<div class="diff-block unchanged">${renderMarkdown(block.block.content)}</div>`
    }
    if (block.type === 'added') {
      return `<div class="diff-block added"><div class="diff-label">新增</div>${renderMarkdown(block.block.content)}</div>`
    }
    if (block.type === 'removed') {
      return `<div class="diff-block removed"><div class="diff-label">删除</div>${renderMarkdown(block.block.content)}</div>`
    }
    if (block.type === 'modified') {
      if (block.lineDiff) {
        let lines = ''
        for (const part of block.lineDiff) {
          const prefix = part.added ? '+' : part.removed ? '-' : ' '
          const className = part.added ? 'line-added' : part.removed ? 'line-removed' : 'line-unchanged'
          lines += `<div class="diff-line ${className}"><span class="line-prefix">${prefix}</span><span class="line-content">${escapeHtml(part.value)}</span></div>`
        }
        return `<div class="diff-block modified"><div class="diff-label">修改</div><pre class="code-diff">${lines}</pre></div>`
      }
      if (block.wordDiff) {
        let text = ''
        for (const part of block.wordDiff) {
          if (part.added) {
            text += `<ins class="word-added">${escapeHtml(part.value)}</ins>`
          } else if (part.removed) {
            text += `<del class="word-removed">${escapeHtml(part.value)}</del>`
          } else {
            text += escapeHtml(part.value)
          }
        }
        return `<div class="diff-block modified"><div class="diff-label">修改</div><p>${text}</p></div>`
      }
    }
    return ''
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br>')
  }
</script>

<div class="version-page">
  {#if loading}
    <div class="loading">加载中...</div>
  {:else}
    <div class="page-header">
      <h1>版本对比</h1>
      <div class="version-selectors">
        <div class="selector">
          <label>旧版本</label>
          <select on:change={(e) => selectOldVersion(versions.find(v => v.id === e.target.value))} value={oldVersion?.id}>
            {#each versions as v}
              <option value={v.id}>
                v{v.version} - {v.summary} ({formatDate(v.createdAt)})
              </option>
            {/each}
          </select>
        </div>
        <span class="vs">VS</span>
        <div class="selector">
          <label>新版本</label>
          <select on:change={(e) => selectNewVersion(versions.find(v => v.id === e.target.value))} value={newVersion?.id}>
            {#each versions as v}
              <option value={v.id}>
                v{v.version} - {v.summary} ({formatDate(v.createdAt)})
              </option>
            {/each}
          </select>
        </div>
      </div>
    </div>

    <div class="diff-container">
      {#each diffResult as block (block.block?.startLine || Math.random())}
        {@html renderBlockDiff(block)}
      {/each}
    </div>
  {/if}
</div>

<style>
  .version-page {
    max-width: 960px;
    margin: 0 auto;
  }

  .loading {
    padding: 80px;
    text-align: center;
    color: #86909c;
  }

  .page-header {
    background: #fff;
    padding: 24px 32px;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
  }

  .page-header h1 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .version-selectors {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .selector {
    flex: 1;
  }

  .selector label {
    display: block;
    font-size: 12px;
    color: #86909c;
    margin-bottom: 6px;
  }

  .selector select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #e5e6eb;
    border-radius: 6px;
    font-size: 13px;
    background: #fff;
    outline: none;
    cursor: pointer;
  }

  .selector select:focus {
    border-color: #3370ff;
  }

  .vs {
    font-weight: 600;
    color: #86909c;
    padding-top: 20px;
  }

  .diff-container {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    padding: 24px 32px;
  }

  .diff-container :global(.diff-block) {
    margin: 16px 0;
    padding: 12px 16px;
    border-radius: 8px;
    position: relative;
  }

  .diff-container :global(.diff-block.unchanged) {
    background: #fff;
    opacity: 0.7;
  }

  .diff-container :global(.diff-block.added) {
    background: #f0f9eb;
    border-left: 4px solid #00b42a;
  }

  .diff-container :global(.diff-block.removed) {
    background: #fff3f0;
    border-left: 4px solid #f53f3f;
  }

  .diff-container :global(.diff-block.modified) {
    background: #fff7e6;
    border-left: 4px solid #ff7d00;
  }

  .diff-container :global(.diff-label) {
    position: absolute;
    top: -8px;
    left: 12px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;
  }

  .diff-container :global(.added .diff-label) {
    background: #00b42a;
    color: #fff;
  }

  .diff-container :global(.removed .diff-label) {
    background: #f53f3f;
    color: #fff;
  }

  .diff-container :global(.modified .diff-label) {
    background: #ff7d00;
    color: #fff;
  }

  .diff-container :global(.code-diff) {
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 13px;
    line-height: 1.6;
    margin: 8px 0 0;
    padding: 0;
    background: transparent;
  }

  .diff-container :global(.diff-line) {
    display: flex;
    white-space: pre;
  }

  .diff-container :global(.line-prefix) {
    width: 20px;
    flex-shrink: 0;
    user-select: none;
  }

  .diff-container :global(.line-content) {
    flex: 1;
  }

  .diff-container :global(.line-added) {
    background: #d9f7be;
  }

  .diff-container :global(.line-removed) {
    background: #ffccc7;
  }

  .diff-container :global(.word-added) {
    background: #d9f7be;
    text-decoration: none;
    padding: 0 2px;
    border-radius: 2px;
  }

  .diff-container :global(.word-removed) {
    background: #ffccc7;
    text-decoration: line-through;
    padding: 0 2px;
    border-radius: 2px;
  }
</style>
