<script>
  import Router from 'svelte-spa-router'
  import Navbar from './components/Navbar.svelte'
  import Sidebar from './components/Sidebar.svelte'
  import Home from './views/Home.svelte'
  import ArticleView from './views/ArticleView.svelte'
  import ArticleEdit from './views/ArticleEdit.svelte'
  import SearchResult from './views/SearchResult.svelte'
  import VersionCompare from './views/VersionCompare.svelte'
  import NotFound from './views/NotFound.svelte'
  import { sidebarCollapsed } from './stores/ui'

  const routes = {
    '/': Home,
    '/article/:id': ArticleView,
    '/article/:id/edit': ArticleEdit,
    '/search': SearchResult,
    '/version/compare/:id': VersionCompare,
    '*': NotFound
  }
</script>

<div class="app-layout">
  <Navbar />
  <div class="main-content">
    <Sidebar />
    <main class="content-area" class:collapsed={$sidebarCollapsed}>
      <Router {routes} />
    </main>
  </div>
</div>

<style>
  .app-layout {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f6f8;
  }

  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .content-area {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    transition: all 0.25s ease;
  }

  .content-area.collapsed {
    margin-left: 0;
  }
</style>
