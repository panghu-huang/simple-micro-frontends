import * as React from 'react'
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom'
import Home from './Home'
import Scheduler from './Scheduler'

const App: React.FC = () => {
  const linkStyle: any = { flex: 1, textAlign: 'center', padding: '12px 0' }
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', width: '100%' }}>
          <Link to='/' style={linkStyle}>Home</Link>
          <Link to='/react' style={linkStyle}>React</Link>
          <Link to='/vue' style={linkStyle}>Vue</Link>
        </div>
        <Switch>
          <Route path='/' exact={true} component={Home}/>
          <Route component={Scheduler}/>
        </Switch>
      </div>
    </BrowserRouter>
  )
}

export default App