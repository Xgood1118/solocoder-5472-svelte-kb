import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const renderer = new marked.Renderer()

renderer.code = function({ text, lang }) {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
  const highlighted = hljs.highlight(text, { language }).value
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
}

marked.use({
  renderer,
  breaks: true,
  gfm: true
})

export function renderMarkdown(content, options = {}) {
  if (!content) return ''

  let html = marked.parse(content)

  if (options.highlightKeywords) {
    html = highlightKeywords(html, options.highlightKeywords)
  }

  html = DOMPurify.sanitize(html, {
    ADD_TAGS: ['mark'],
    ADD_ATTR: ['class']
  })

  return html
}

function highlightKeywords(html, keywords) {
  if (!keywords || !keywords.length) return html

  const pattern = keywords.map(k => escapeRegExp(k)).join('|')
  const regex = new RegExp(`(${pattern})`, 'gi')

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  function walkNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent
      if (regex.test(text)) {
        const span = document.createElement('span')
        span.innerHTML = text.replace(regex, '<mark>$1</mark>')
        node.parentNode.replaceChild(span, node)
      }
      return
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase()
      if (tag === 'mark' || tag === 'code' || tag === 'pre') return

      const children = Array.from(node.childNodes)
      for (const child of children) {
        walkNodes(child)
      }
    }
  }

  walkNodes(tempDiv)
  return tempDiv.innerHTML
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function renderMath(text) {
  return text.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false })
    } catch {
      return match
    }
  }).replace(/\$([^$]+)\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false })
    } catch {
      return match
    }
  })
}

export function extractPlainText(markdown) {
  if (!markdown) return ''
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[-*+]\s/g, ' ')
    .replace(/\d+\.\s/g, ' ')
    .replace(/[#>*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
