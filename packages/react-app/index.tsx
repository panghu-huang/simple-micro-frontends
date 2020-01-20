import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import App from './App'

export const mount = () => {
  render(
    <App/>,
    document.getElementById('content')
  )
}

export const unmount = () => {
  unmountComponentAtNode(
    document.getElementById('content')
  )
}