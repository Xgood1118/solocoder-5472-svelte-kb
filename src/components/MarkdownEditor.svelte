<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import { EditorState } from '@codemirror/state'
  import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine } from '@codemirror/view'
  import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
  import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
  import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
  import { javascript } from '@codemirror/lang-javascript'
  import { python } from '@codemirror/lang-python'
  import { java } from '@codemirror/lang-java'
  import { sql } from '@codemirror/lang-sql'

  const dispatch = createEventDispatcher()

  export let value = ''
  export let readOnly = false

  let editorEl
  let view
  let content = value

  const customTheme = EditorView.theme({
    '&': {
      height: '100%',
      fontSize: '14px',
      fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace"
    },
    '.cm-scroller': {
      overflow: 'auto',
      fontFamily: 'inherit'
    },
    '.cm-gutters': {
      background: '#f7f8fa',
      borderRight: '1px solid #e5e6eb',
      color: '#86909c'
    },
    '.cm-activeLineGutter': {
      background: '#f0f2f5'
    },
    '.cm-activeLine': {
      background: 'rgba(51, 112, 255, 0.05)'
    },
    '.cm-selectionBackground, ::selection': {
      background: 'rgba(51, 112, 255, 0.2) !important'
    },
    '.cm-cursor': {
      borderLeftColor: '#3370ff',
      borderLeftWidth: '2px'
    }
  }, { dark: false })

  onMount(() => {
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        content = update.state.doc.toString()
        dispatch('change', content)
      }
    })

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        history(),
        autocompletion(),
        customTheme,
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          ...completionKeymap
        ]),
        EditorView.lineWrapping,
        EditorView.editable.of(!readOnly),
        updateListener
      ]
    })

    view = new EditorView({
      state,
      parent: editorEl
    })
  })

  onDestroy(() => {
    if (view) {
      view.destroy()
    }
  })

  $: {
    if (view && value !== content) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value
        }
      })
      content = value
    }
  }

  $: {
    if (view) {
      view.dispatch({
        effects: EditorView.editable.of(!readOnly)
      })
    }
  }
</script>

<div class="markdown-editor" bind:this={editorEl}></div>

<style>
  .markdown-editor {
    height: 100%;
    width: 100%;
    border: 1px solid #e5e6eb;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
  }
</style>
