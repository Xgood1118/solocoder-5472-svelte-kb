import { writable, derived } from 'svelte/store'

const STORAGE_KEY = 'kb_tree_expanded'

function loadExpanded() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function createTreeStore() {
  const { subscribe, set, update } = writable({
    nodes: [],
    loading: false,
    error: null,
    expanded: loadExpanded(),
    selectedId: null
  })

  return {
    subscribe,
    setNodes: (nodes) => update(state => ({ ...state, nodes, loading: false })),
    setLoading: (loading) => update(state => ({ ...state, loading })),
    setError: (error) => update(state => ({ ...state, error, loading: false })),
    setSelected: (id) => update(state => ({ ...state, selectedId: id })),
    toggleExpand: (id) => update(state => {
      const expanded = state.expanded.includes(id)
        ? state.expanded.filter(i => i !== id)
        : [...state.expanded, id]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expanded))
      return { ...state, expanded }
    }),
    expandAll: (ids) => update(state => {
      const expanded = [...new Set([...state.expanded, ...ids])]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expanded))
      return { ...state, expanded }
    }),
    expandToNode: (nodeId, nodes) => {
      const path = findPathToNode(nodes, nodeId)
      if (path.length > 1) {
        update(state => {
          const expanded = [...new Set([...state.expanded, ...path.slice(0, -1)])]
          localStorage.setItem(STORAGE_KEY, JSON.stringify(expanded))
          return { ...state, expanded }
        })
      }
    }
  }
}

function findPathToNode(nodes, targetId, path = []) {
  for (const node of nodes) {
    const currentPath = [...path, node.id]
    if (node.id === targetId) return currentPath
    if (node.children && node.children.length > 0) {
      const result = findPathToNode(node.children, targetId, currentPath)
      if (result) return result
    }
  }
  return null
}

export const tree = createTreeStore()

export const flatNodeList = derived(tree, $tree => {
  const result = []
  function flatten(nodes) {
    for (const node of nodes) {
      result.push(node)
      if (node.children) flatten(node.children)
    }
  }
  flatten($tree.nodes)
  return result
})
