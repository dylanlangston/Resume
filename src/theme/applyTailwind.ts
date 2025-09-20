import { type Element } from 'hast'
import type { Result } from 'hastscript';
import { visit } from 'unist-util-visit'
import * as tailwindcss from 'tailwindcss'

import tailwindcss_preflight from "tailwindcss/preflight.css" assert { type: 'text' };
import tailwindcss_index from "tailwindcss/index.css" assert { type: 'text' };
import tailwindcss_theme from "tailwindcss/theme.css" assert { type: 'text' };
import tailwindcss_utilities from "tailwindcss/utilities.css" assert { type: 'text' };

export async function applyTailwindToHast(tree: Result): Promise<Result> {
  const STYLE_TYPE = 'text/tailwindcss'

  let css = ''
  visit(tree, 'element', (node: Element) => {
    if (node.tagName === 'style' && node.properties?.type === STYLE_TYPE) {
      const textNode = node.children.find(c => c.type === 'text')
      if (textNode && textNode.type === 'text') {
        css += textNode.value + '\n'
      }
    }
  })

  if (!css.includes('@import')) {
    css = `@import "tailwindcss";\n${css}`
  }

  const compiler = await tailwindcss.compile(css, {
    base: '/',
    loadStylesheet,
    loadModule: async () => {
      throw new Error(`Plugins/config not supported in this build`)
    },
  })

  const classes = new Set<string>()
  visit(tree, 'element', (node: Element) => {
    const classProp = node.properties?.className
    if (Array.isArray(classProp)) {
      for (const c of classProp) {
        if (typeof c === 'string') classes.add(c)
      }
    } else if (typeof classProp === 'string') {
      classProp.split(/\s+/).forEach(c => classes.add(c))
    }
  })

  const cssOutput = compiler.build(Array.from(classes))

  let head = findElement(tree, 'head')
  if (!head) {
    head = { type: 'element', tagName: 'head', properties: {}, children: [] }
    if (tree.children[0]?.type === 'element' && tree.children[0].tagName === 'html') {
      tree.children[0].children.unshift(head)
    } else {
      tree.children.unshift(head)
    }
  }

  head.children.push({
    type: 'element',
    tagName: 'style',
    properties: {},
    children: [{ type: 'text', value: cssOutput }],
  })

  return tree
}

function findElement(tree: Result, tag: string): Element | undefined {
  let found: Element | undefined
  visit(tree, 'element', (node: Element) => {
    if (node.tagName === tag && !found) {
      found = node
    }
  })
  return found
}

async function loadStylesheet(id: string, base: string) {
  if (id === 'tailwindcss') {
    return {
      path: 'virtual:tailwindcss/index.css',
      base,
      content: tailwindcss_index,
    }
  } else if (
    id === 'tailwindcss/preflight' ||
    id === 'tailwindcss/preflight.css' ||
    id === './preflight.css'
  ) {
    return {
      path: 'virtual:tailwindcss/preflight.css',
      base,
      content: tailwindcss_preflight,
    }
  } else if (
    id === 'tailwindcss/theme' ||
    id === 'tailwindcss/theme.css' ||
    id === './theme.css'
  ) {
    return {
      path: 'virtual:tailwindcss/theme.css',
      base,
      content: tailwindcss_theme,
    }
  } else if (
    id === 'tailwindcss/utilities' ||
    id === 'tailwindcss/utilities.css' ||
    id === './utilities.css'
  ) {
    return {
      path: 'virtual:tailwindcss/utilities.css',
      base,
      content: tailwindcss_utilities,
    }
  }

  throw new Error(`Unsupported @import "${id}"`)
}
