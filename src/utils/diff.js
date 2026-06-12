import { diffLines, diffWords } from 'diff'

export function parseMarkdownBlocks(content) {
  if (!content) return []

  const lines = content.split('\n')
  const blocks = []
  let currentBlock = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('```')) {
      if (currentBlock && currentBlock.type === 'code') {
        currentBlock.lines.push(line)
        currentBlock.content += '\n' + line
        blocks.push(currentBlock)
        currentBlock = null
      } else {
        if (currentBlock) blocks.push(currentBlock)
        currentBlock = {
          type: 'code',
          lang: line.slice(3).trim(),
          lines: [line],
          content: line,
          startLine: i
        }
      }
      continue
    }

    if (currentBlock && currentBlock.type === 'code') {
      currentBlock.lines.push(line)
      currentBlock.content += '\n' + line
      continue
    }

    if (line.startsWith('#') || line.startsWith('##') || line.startsWith('###')) {
      if (currentBlock) blocks.push(currentBlock)
      const level = line.match(/^#{1,6}/)[0].length
      currentBlock = {
        type: 'heading',
        level,
        lines: [line],
        content: line,
        startLine: i
      }
      continue
    }

    if (line.startsWith('|')) {
      if (currentBlock && currentBlock.type === 'table') {
        currentBlock.lines.push(line)
        currentBlock.content += '\n' + line
      } else {
        if (currentBlock) blocks.push(currentBlock)
        currentBlock = {
          type: 'table',
          lines: [line],
          content: line,
          startLine: i
        }
      }
      continue
    }

    if (line.match(/^[-*+]\s/) || line.match(/^\d+\.\s/)) {
      if (currentBlock && currentBlock.type === 'list') {
        currentBlock.lines.push(line)
        currentBlock.content += '\n' + line
      } else {
        if (currentBlock) blocks.push(currentBlock)
        currentBlock = {
          type: 'list',
          lines: [line],
          content: line,
          startLine: i
        }
      }
      continue
    }

    if (line.startsWith('>')) {
      if (currentBlock && currentBlock.type === 'blockquote') {
        currentBlock.lines.push(line)
        currentBlock.content += '\n' + line
      } else {
        if (currentBlock) blocks.push(currentBlock)
        currentBlock = {
          type: 'blockquote',
          lines: [line],
          content: line,
          startLine: i
        }
      }
      continue
    }

    if (line.trim() === '') {
      if (currentBlock) {
        blocks.push(currentBlock)
        currentBlock = null
      }
      continue
    }

    if (currentBlock && currentBlock.type === 'paragraph') {
      currentBlock.lines.push(line)
      currentBlock.content += '\n' + line
    } else {
      if (currentBlock) blocks.push(currentBlock)
      currentBlock = {
        type: 'paragraph',
        lines: [line],
        content: line,
        startLine: i
      }
    }
  }

  if (currentBlock) blocks.push(currentBlock)

  return blocks
}

export function blockDiff(oldContent, newContent) {
  const oldBlocks = parseMarkdownBlocks(oldContent)
  const newBlocks = parseMarkdownBlocks(newContent)

  const result = []
  let i = 0, j = 0

  while (i < oldBlocks.length || j < newBlocks.length) {
    const oldBlock = oldBlocks[i]
    const newBlock = newBlocks[j]

    if (oldBlock && newBlock && oldBlock.content === newBlock.content) {
      result.push({ type: 'unchanged', block: newBlock })
      i++
      j++
      continue
    }

    let foundMatch = false
    for (let lookAhead = 1; lookAhead < Math.min(5, oldBlocks.length - i, newBlocks.length - j); lookAhead++) {
      if (oldBlocks[i + lookAhead]?.content === newBlock?.content) {
        for (let k = 0; k < lookAhead; k++) {
          result.push({ type: 'removed', block: oldBlocks[i + k] })
        }
        i += lookAhead
        foundMatch = true
        break
      }
      if (newBlocks[j + lookAhead]?.content === oldBlock?.content) {
        for (let k = 0; k < lookAhead; k++) {
          result.push({ type: 'added', block: newBlocks[j + k] })
        }
        j += lookAhead
        foundMatch = true
        break
      }
    }

    if (foundMatch) continue

    if (oldBlock && newBlock && oldBlock.type === newBlock.type) {
      if (oldBlock.type === 'code' || oldBlock.type === 'table') {
        const lineDiff = diffLines(oldBlock.content, newBlock.content)
        result.push({
          type: 'modified',
          oldBlock,
          newBlock,
          lineDiff
        })
      } else {
        const wordDiff = diffWords(oldBlock.content, newBlock.content)
        result.push({
          type: 'modified',
          oldBlock,
          newBlock,
          wordDiff
        })
      }
      i++
      j++
    } else if (oldBlock) {
      result.push({ type: 'removed', block: oldBlock })
      i++
    } else if (newBlock) {
      result.push({ type: 'added', block: newBlock })
      j++
    }
  }

  return result
}
