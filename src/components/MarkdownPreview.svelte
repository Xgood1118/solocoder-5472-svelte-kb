<script>
  import { onMount, afterUpdate, tick } from 'svelte'
  import { renderMarkdown } from '../utils/markdown'
  import mermaid from 'mermaid'

  export let content = ''
  export let highlightKeywords = []

  let previewEl
  let mermaidId = 0

  onMount(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'strict',
      fontSize: 14
    })
  })

  async function renderMermaid() {
    if (!previewEl) return

    const mermaidBlocks = previewEl.querySelectorAll('code.language-mermaid')
    for (const block of mermaidBlocks) {
      const code = block.textContent
      const id = `mermaid-${Date.now()}-${mermaidId++}`

      try {
        const { svg } = await mermaid.render(id, code)
        const div = document.createElement('div')
        div.className = 'mermaid'
        div.innerHTML = svg
        block.parentNode.replaceWith(div)
      } catch (err) {
        console.error('Mermaid render error:', err)
        const div = document.createElement('div')
        div.className = 'mermaid-error'
        div.textContent = '流程图渲染失败: ' + err.message
        block.parentNode.replaceWith(div)
      }
    }
  }

  afterUpdate(async () => {
    await tick()
    renderMermaid()
  })

  $: html = renderMarkdown(content, { highlightKeywords })
</script>

<div class="markdown-preview markdown-body" bind:this={previewEl}>{@html html}</div>

<style>
  .markdown-preview {
    padding: 20px 24px;
    height: 100%;
    overflow-y: auto;
    background: #fff;
  }

  .markdown-preview :global(.mermaid-error) {
    padding: 12px;
    background: #fff3f0;
    border: 1px solid #ffd0c4;
    border-radius: 6px;
    color: #f53f3f;
    font-size: 13px;
  }
</style>
