<script>
  import { tree } from '../stores/tree'
  import { onMount } from 'svelte'

  export let node
  export let level = 0

  let isExpanded = false
  let isSelected = false
  let isDragging = false
  let dropPosition = null // 'before' | 'after' | 'inside' | null

  $: {
    isExpanded = $tree.expanded.includes(node.id)
    isSelected = $tree.selectedId === node.id
  }

  const hasChildren = node.type === 'directory' && node.children && node.children.length > 0

  function toggleExpand(e) {
    e.stopPropagation()
    if (node.type === 'directory') {
      tree.toggleExpand(node.id)
    }
  }

  function handleClick() {
    tree.setSelected(node.id)
    if (node.type === 'article' && node.articleId) {
      window.location.hash = `#/article/${node.articleId}`
    }
  }

  function handleDragStart(e) {
    isDragging = true
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', node.id)
    e.dataTransfer.setData('nodeType', node.type)
  }

  function handleDragEnd() {
    isDragging = false
    dropPosition = null
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const height = rect.height

    if (y < height * 0.25) {
      dropPosition = 'before'
    } else if (y > height * 0.75) {
      dropPosition = 'after'
    } else {
      dropPosition = 'inside'
    }
  }

  function handleDragLeave() {
    dropPosition = null
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()

    const draggedId = e.dataTransfer.getData('text/plain')
    if (draggedId === node.id) {
      dropPosition = null
      return
    }

    console.log(`Move ${draggedId} ${dropPosition} ${node.id}`)
    dropPosition = null
  }

  function getIcon() {
    if (node.type === 'directory') {
      return isExpanded ? '📂' : '📁'
    }
    return '📄'
  }
</script>

<div
  class="tree-node"
  class:expanded={isExpanded}
  class:selected={isSelected}
  class:dragging={isDragging}
  class:drop-before={dropPosition === 'before'}
  class:drop-after={dropPosition === 'after'}
  class:drop-inside={dropPosition === 'inside'}
  draggable={true}
  on:dragstart={handleDragStart}
  on:dragend={handleDragEnd}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  on:click={handleClick}
  style="padding-left: {level * 16 + 8}px"
>
  <div class="node-content">
    <button
      class="expand-btn"
      on:click={toggleExpand}
      class:hidden={node.type !== 'directory'}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" class:rotated={isExpanded}>
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
    <span class="node-icon">{getIcon()}</span>
    <span class="node-name">{node.name}</span>
  </div>

  {#if node.type === 'directory' && isExpanded && node.children}
    <div class="children">
      {#each node.children as child (child.id)}
        <svelte:self node={child} level={level + 1} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .tree-node {
    position: relative;
    cursor: pointer;
  }

  .node-content {
    display: flex;
    align-items: center;
    height: 32px;
    padding: 0 8px;
    gap: 4px;
    border-radius: 6px;
    transition: background-color 0.15s;
  }

  .node-content:hover {
    background: #f2f3f5;
  }

  .tree-node.selected > .node-content {
    background: #e8f3ff;
    color: #3370ff;
  }

  .expand-btn {
    width: 20px;
    height: 20px;
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #86909c;
    flex-shrink: 0;
  }

  .expand-btn.hidden {
    visibility: hidden;
  }

  .expand-btn svg {
    transition: transform 0.2s;
  }

  .expand-btn svg.rotated {
    transform: rotate(90deg);
  }

  .node-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .node-name {
    flex: 1;
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #1f2329;
  }

  .selected .node-name {
    color: #3370ff;
    font-weight: 500;
  }

  .children {
    overflow: hidden;
  }

  .tree-node.dragging {
    opacity: 0.5;
  }

  .tree-node.drop-before::before {
    content: '';
    position: absolute;
    left: 8px;
    right: 8px;
    top: 0;
    height: 2px;
    background: #3370ff;
    border-radius: 1px;
    z-index: 10;
  }

  .tree-node.drop-after::after {
    content: '';
    position: absolute;
    left: 8px;
    right: 8px;
    bottom: 0;
    height: 2px;
    background: #3370ff;
    border-radius: 1px;
    z-index: 10;
  }

  .tree-node.drop-inside > .node-content {
    background: #e8f3ff;
    box-shadow: inset 0 0 0 2px #3370ff;
  }
</style>
