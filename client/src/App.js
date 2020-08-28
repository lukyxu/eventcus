import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import PrivateRoute from './routing/PrivateRoute'
import Create from './pages/create-event';
import Event from './pages/event';
import Login from './pages/login';
import {isAuthenticated} from './services/authService'
import ReactLoading from 'react-loading';
import './styles.css';
import TicketReservationInfo from './services/ticketReservationInfo.js';
import Send from './pages/send-email';

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

  const renderEvents = () => {
    setEvents([...events])
  }

  async function fetchEvents() {
    let res = await fetch("/events", {credentials: "include"})
    let e = await res.json()
    let r = []

    await Promise.all(e.map(async (event) => {
      console.log(event)
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
      r.push({_id: event._id, eventDate : event.eventDate, dropTime:event.dropTime, name : event.name, total : total, tickets : tickets, sheetId: event.sheetId, dashboardDrop: false})
    }))

    console.log(r)
    // console.log(typeof r)
    r.sort((e1,e2) => new Date(e2.eventDate).getTime() - new Date(e1.eventDate).getTime())
    setEvents(r)
    setLoaded(true)
  }

  useEffect(() => {
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
            <PrivateRoute exact user={user} path='/' setUser={setUser} render={(props) => <Dashboard setUser={setUser} events={events} fetchEvents={fetchEvents} renderEvents={renderEvents}/>} />
            <PrivateRoute exact user={user} path='/create-event' render={(props) => <Create fetchEvents={fetchEvents}></Create>} />
            <PrivateRoute exact user={user} path='/event' render={(props) => <Event></Event>} />
            <PrivateRoute exact user={user} path='/send-email' render={(props) => <Send></Send>} />
            {events.map(e => <PrivateRoute exact user={user} path={`/event/${e._id}`} render={(props) => <Event event={e}></Event>} />)}
            <Route exact path='/login' render={(props) => <Login setUser={setUser} setLoaded={setLoaded}/>}/>
            <Route render={() => <h1>404: page not found</h1>}></Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;