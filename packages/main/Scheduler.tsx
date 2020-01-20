import * as React from 'react'
import * as types from 'shared/types'
import { loadScript, loadStyleSheet, removeScript, removeStyleSheet } from 'shared/utils'
import { useLocation } from 'react-router-dom'

const fetchConfig = (() => {
  let config: types.Config[] | null = null
  return async () => {
    if (!config) {
      try {
        const response = await fetch('./config.json')
        config = await response.json()
      } catch (error) {
        return []
      }
    }

    return config as types.Config[]
  }
})()

const Scheduler: React.FC = () => {
  const { pathname } = useLocation()

  React.useEffect(
    () => {
      let unmount: () => void | undefined = undefined

      const run = async () => {
        const config = await fetchConfig()
        const matched = config.find(item => pathname.startsWith(item.path))

        if (!matched) {
          return
        }
        for (const link of matched.styles) {
          await loadStyleSheet(link)
        }

        for (const script of matched.scripts) {
          await loadScript(script)
        }

        const app = window[matched.name] as { mount: () => void, unmount: () => void }

        app.mount()
        
        unmount = () => {
          app.unmount()
          for (const link of matched.styles) {
            removeStyleSheet(link)
          }
  
          for (const script of matched.scripts) {
            removeScript(script)
          }
        }
      }

      run()

      return () => {
        unmount && unmount()
      }
    },
    [pathname]
  )

  return (
    <div id="content"></div>
  )
}

export default Scheduler