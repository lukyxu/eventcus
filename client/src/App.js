import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Create from './pages/create-event';

class App extends Component {
  render() {
    return (
    <Router>
        <div>
          {/* <h2>Welcome to React Router Tutorial</h2>
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <ul className="navbar-nav mr-auto">
            <li><Link to={'/'} className="nav-link"> Dashboard </Link></li>
            <li><Link to={'/create-event'} className="nav-link">Create Event</Link></li>
          </ul>
          </nav>
          <hr /> */}
          <Switch>
              <Route exact path='/' component={Dashboard} />
              <Route path='/create-event' component={Create} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;