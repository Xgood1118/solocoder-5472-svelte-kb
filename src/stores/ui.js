import { writable, derived } from 'svelte/store'

function createUiStore() {
  const collapsed = localStorage.getItem('kb_sidebar_collapsed') === 'true'

  const { subscribe, set, update } = writable({
    sidebarCollapsed: collapsed,
    showRecent: false,
    showDrafts: false
  })

  return {
    subscribe,
    toggleSidebar: () => update(state => {
      const collapsed = !state.sidebarCollapsed
      localStorage.setItem('kb_sidebar_collapsed', String(collapsed))
      return { ...state, sidebarCollapsed: collapsed }
    }),
    setSidebarCollapsed: (collapsed) => update(state => {
      localStorage.setItem('kb_sidebar_collapsed', String(collapsed))
      return { ...state, sidebarCollapsed: collapsed }
    }),
    toggleRecent: () => update(state => ({ ...state, showRecent: !state.showRecent })),
    toggleDrafts: () => update(state => ({ ...state, showDrafts: !state.showDrafts }))
  }
}

export const ui = createUiStore()
export const sidebarCollapsed = derivedFromStore(ui, 'sidebarCollapsed')

function derivedFromStore(store, key) {
  return {
    subscribe(fn) {
      return store.subscribe(s => fn(s[key]))
    }
  }
}
