<script>
  import { tree } from '../stores/tree'
  import { ui } from '../stores/ui'
  import TreeView from './TreeView.svelte'
  import { mockTree } from '../mock'
  import { onMount } from 'svelte'

  onMount(() => {
    tree.setNodes(mockTree)
  })
</script>

<aside class="sidebar" class:collapsed={$ui.sidebarCollapsed}>
  <div class="sidebar-header">
    <span class="sidebar-title">目录</span>
    <button class="new-btn" title="新建">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>
  </div>
  <div class="sidebar-content">
    <TreeView nodes={mockTree} />
  </div>
</aside>

<style>
  .sidebar {
    width: 260px;
    background: #fff;
    border-right: 1px solid #e5e6eb;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    transition: width 0.25s ease;
    overflow: hidden;
  }

  .sidebar.collapsed {
    width: 0;
    border-right: none;
  }

  .sidebar-header {
    height: 48px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #f2f3f5;
  }

  .sidebar-title {
    font-size: 13px;
    font-weight: 600;
    color: #4e5969;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .new-btn {
    width: 28px;
    height: 28px;
    border: none;
    background: #f2f3f5;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4e5969;
    transition: all 0.2s;
  }

  .new-btn:hover {
    background: #e5e6eb;
    color: #1f2329;
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }
</style>
