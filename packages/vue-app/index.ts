import Vue from 'vue'
import App from './App.vue'

let vue = null

const target = document.createElement('div')

export const mount = () => {
  const container = document.getElementById('content')
  vue = new Vue({
    render: h => h(App)
  })

  container.appendChild(target)
  vue.$mount(target)

}

export const unmount = () => {
  if (vue) {
    vue.$destroy()
    while (target.firstChild) {
      target.removeChild(
        target.firstChild
      )
    }
  }
}