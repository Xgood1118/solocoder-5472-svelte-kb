<script>
  import { ui } from '../stores/ui'
  import { currentUser } from '../stores/auth'
  import { mockCurrentUser } from '../mock'
  import RecentPanel from './RecentPanel.svelte'
  import DraftsPanel from './DraftsPanel.svelte'

  let searchQuery = ''
  let showRecent = false
  let showDrafts = false

  function handleSearch(e) {
    if (e.key === 'Enter' && searchQuery.trim()) {
      window.location.hash = `#/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  function toggleRecent() {
    showRecent = !showRecent
    showDrafts = false
  }

  function toggleDrafts() {
    showDrafts = !showDrafts
    showRecent = false
  }
</script>

<nav class="navbar">
  <div class="navbar-left">
    <button class="menu-btn" on:click={() => ui.toggleSidebar()}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>
    <div class="logo">
      <span class="logo-icon">📚</span>
      <span class="logo-text">团队知识库</span>
    </div>
  </div>

  <div class="navbar-center">
    <div class="search-box">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="text"
        placeholder="搜索文档..."
        bind:value={searchQuery}
        on:keydown={handleSearch}
      />
    </div>
  </div>

  <div class="navbar-right">
    <button class="nav-btn" title="最近浏览" on:click={toggleRecent} class:active={showRecent}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    </button>
    <button class="nav-btn" title="我的草稿" on:click={toggleDrafts} class:active={showDrafts}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    </button>
    <div class="user-info">
      <div class="avatar">{mockCurrentUser.name.charAt(0)}</div>
      <span class="username">{mockCurrentUser.name}</span>
    </div>
  </div>

  {#if showRecent}
    <RecentPanel on:close={() => showRecent = false} />
  {/if}
  {#if showDrafts}
    <DraftsPanel on:close={() => showDrafts = false} />
  {/if}
</nav>

<style>
  .navbar {
    height: 56px;
    background: #fff;
    border-bottom: 1px solid #e5e6eb;
    display: flex;
    align-items: center;
    padding: 0 16px;
    position: relative;
    z-index: 100;
  }

  .navbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 220px;
    flex-shrink: 0;
  }

  .menu-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4e5969;
    transition: all 0.2s;
  }

  .menu-btn:hover {
    background: #f2f3f5;
    color: #1f2329;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 16px;
    color: #1f2329;
  }

  .logo-icon {
    font-size: 22px;
  }

  .navbar-center {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .search-box {
    width: 100%;
    max-width: 480px;
    height: 36px;
    background: #f2f3f5;
    border-radius: 8px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    gap: 8px;
    color: #86909c;
    transition: all 0.2s;
  }

  .search-box:focus-within {
    background: #fff;
    box-shadow: 0 0 0 2px rgba(51, 112, 255, 0.2);
  }

  .search-box input {
    flex: 1;
    border: none;
    background: transparent;
    outline: none;
    font-size: 14px;
    color: #1f2329;
  }

  .search-box input::placeholder {
    color: #86909c;
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .nav-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4e5969;
    transition: all 0.2s;
    position: relative;
  }

  .nav-btn:hover, .nav-btn.active {
    background: #e8f3ff;
    color: #3370ff;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 8px;
    padding-left: 12px;
    border-left: 1px solid #e5e6eb;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 500;
  }

  .username {
    font-size: 13px;
    color: #4e5969;
  }
</style>
