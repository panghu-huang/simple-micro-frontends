const path = require('path')
const fs = require('fs')
const cheerio = require('cheerio')

const outputDir = path.join(process.cwd(), 'dist')

class MicroFrontendsPlugin {

  constructor(opts) {
    this.options = opts
  }

  apply(compilation) {
    compilation.hooks.done.tap('mfe', async stats => {
      const { outputPath } = stats.toJson()
      const builtHTMLPath = path.join(outputPath, 'index.html')
      const html = fs.readFileSync(builtHTMLPath, 'utf8')

      const styles = []
      const scripts = []
      const $ = cheerio.load(html)

      $('link').toArray().forEach(el => {
        const { href } = el.attribs
        if (/\.css$/.test(href)) {
          styles.push(href)
        }
      })

      $('script').toArray().forEach(el => {
        const { src } = el.attribs
        scripts.push(src)
      })
      
      // const config = {
      //   path: this.options.path,
      //   name: this.options.name,
      //   styles,
      //   scripts,
      // }
      const configPath = path.join(outputDir, 'config.json')
      if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, '[]')
      }
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

      const idx = config.findIndex(c => c.path === this.options.path)
      if (idx !== -1) {
        config.splice(idx, 1)
      }
      config.push({
        path: this.options.path,
        name: this.options.name,
        styles,
        scripts,
      })

      fs.writeFileSync(configPath, JSON.stringify(config))
    })
  }
}

module.exports = MicroFrontendsPlugin