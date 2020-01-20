export function loadScript(url: string, attrs?: Record<string, string>) {
  return new Promise((resolve, reject) => {
    const matched = Array.prototype.find.call(document.scripts, (script: HTMLScriptElement) => {
      return script.src === url || script.getAttribute('src') === url
    })
    if (matched) {
      return resolve()
    }
    const script = document.createElement('script')
    if (attrs) {
      Object.keys(attrs).forEach(name => {
        script.setAttribute(name, attrs[name])
      })
    }
    script.type = 'text/javascript'
    script.src = url
    script.onload = resolve
    script.onerror = reject
    document.body.appendChild(script)
  })
}

export function removeScript(url: string) {
  const matched: HTMLScriptElement = Array.prototype.find.call(document.scripts, (script: HTMLScriptElement) => {
    return script.src === url || script.getAttribute('src') === url
  })
  if (matched && matched.parentNode) {
    return matched.parentNode.removeChild(matched)
  }
}

export function removeStyleSheet(url: string) {
  const matched: HTMLLinkElement = Array.prototype.find.call(document.styleSheets, (link: HTMLLinkElement) => {
    return link.href === url || link.getAttribute('href') === url
  })
  if (matched && matched.parentNode) {
    return matched.parentNode.removeChild(matched)
  }
}

export function loadStyleSheet(url: string, attrs?: Record<string, string>) {
  return new Promise((resolve, reject) => {
    const matched = Array.prototype.find.call(document.styleSheets, (link: HTMLLinkElement) => {
      return link.href === url || link.getAttribute('href') === url
    })
    if (matched) {
      return resolve()
    }
    const link = document.createElement('link')
    if (attrs) {
      Object.keys(attrs).forEach(name => {
        link.setAttribute(name, attrs[name])
      })
    }
    link.rel = 'stylesheet'
    link.href = url
    link.onload = resolve
    link.onerror = reject
    document.body.appendChild(link)
  })
}