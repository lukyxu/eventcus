import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import PrivateRoute from './routing/PrivateRoute'
import Create from './pages/create-event';
import Login from './pages/login';
import {isAuthenticated} from './services/authService'
import ReactLoading from 'react-loading';
import './styles.css';
import TicketReservationInfo from './services/ticketReservationInfo.js';

function App() {

  const [user, setUser] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [events, setEvents] = useState([])

  useEffect(() => {
    console.log("ok")
    isAuthenticated( (data) => {
      if (data.error){
        console.log(data.error)
      } else if (!data.isAuthenticated) {
        console.log("Not authenticated")
        setLoaded(true)
      } else {
        setUser(data.user)
      }
    })
  }, [])

  useEffect(() => {
    async function fetchEvents() {
      let res = await fetch("/events", {credentials: "include"})
      let e = await res.json()
      let r = []

      e.forEach(async (event) => {

        const reqBody = {
          sheetId: event.sheetId
        }

        let tickets = await TicketReservationInfo(reqBody)
        let total;

        tickets.forEach((ticket, index, object) => {
          if (ticket.type === "total") {
            total = ticket;
            object.splice(index, 1)
          }
        })

        r.push({eventDate : event.eventDate, name : event.name, total : total, tickets : tickets})

      })


      setEvents(r)
      setLoaded(true)
    }
    fetchEvents()

  }, [user])

  if (!loaded) {
    return <div style={{display: 'flex', alignItems: 'center', justifyContent:'center', height:'100vh'}}><ReactLoading type={"spinningBubbles"} color={"#5e99f1"}/></div>
  }
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
            <PrivateRoute exact user={user} path='/' setUser={setUser} render={(props) => <Dashboard setUser={setUser} events={events}/>} />
            <PrivateRoute exact user={user} path='/create-event' component={Create} />
            <Route exact path='/login' render={(props) => <Login setUser={setUser}/>}/>
        </Switch>
      </div>
    </Router>
  );
}

export default App;