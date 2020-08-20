import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import PrivateRoute from './routing/PrivateRoute'
import Create from './pages/create-event';
import Login from './pages/login';
import {isAuthenticated} from './services/authService'
import ReactLoading from 'react-loading';
import './styles.css';

function App() {
  useEffect(() => {
    console.log("ok")
    isAuthenticated((data) => {
      if (data.error){
        console.log(data.error)
      } else if (!data.isAuthenticated) {
        console.log("Not authenticated")
      } else {
        setUser(data.user)
      }
      setLoaded(true)
    })
  }, [])
  const [user, setUser] = useState(null)
  const [loaded, setLoaded] = useState(false)
  if (!loaded) {
    return <div style={{display: 'flex', alignItems: 'center', justifyContent:'center', height:'100vh'}}><ReactLoading type={"spinningBubbles"} color={"#5e99f1"}/></div>
  }
  console.log(setUser)
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
            <PrivateRoute exact user={user} path='/' setUser={setUser} render={(props) => <Dashboard setUser={setUser}/>} />
            <PrivateRoute exact user={user} path='/create-event' component={Create} />
            <Route exact path='/login' render={(props) => <Login setUser={setUser}/>}/>
        </Switch>
      </div>
    </Router>
  );
}

export default App;