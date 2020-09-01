import React, {useState, useEffect, useRef} from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import PrivateRoute from './routing/PrivateRoute'
import Create from './pages/create-event';
import Event from './pages/event';
import Login from './pages/login';
import {isAuthenticated} from './services/authService'
import ReactLoading from 'react-loading';
import TicketReservationInfo from './services/ticketReservationInfo.js';
import Send from './pages/send-email';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles.css';

function App() {

  const [user, setUser] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [events, setEvents] = useState([])
  const loadedRef = useRef(loaded)
  loadedRef.current = loaded;

  useEffect(() => {
    console.log("ok")
    const timer = setTimeout(() => {
      if (!loadedRef.current) {
        toast.error("Connection timeout, please refresh the page", {autoClose: false,closeOnClick: false, draggable: false})
      }
    }, 20000)

    isAuthenticated( (data) => {
      console.log(data)
      if (data.error){
        toast.error(`Error authenticating user: ${data.error}`)
      } else if (!data.isAuthenticated) {
        console.log("Not authenticated")
        setLoaded(true)
      } else {
        setUser(data.user)
      }
    })
    return () => clearTimeout(timer)
  }, [])

  const renderEvents = () => {
    setEvents([...events])
  }

  async function fetchEvents() {
    let r = []
    try {
      let res = await fetch("/events", {credentials: "include"})
      let e = await res.json()

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
    } catch(err) {
      toast.error(`Unable to fetch events: ${err}`)
    }

    console.log(r)
    // console.log(typeof r)
    r.sort((e1,e2) => new Date(e2.eventDate).getTime() - new Date(e1.eventDate).getTime())
    setEvents(r)
    setLoaded(true)
  }

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  if (!loaded) {
    return <div style={{display: 'flex', alignItems: 'center', justifyContent:'center', height:'100vh'}}>
      <ToastContainer
        limit={3}
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        transition={Slide}
      />
      <ReactLoading type={"spinningBubbles"} color={"#5e99f1"}/>
    </div>
  }

  return (
  <Router>
    <ToastContainer
      limit={3}
      position="top-center"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover={false}
      transition={Slide}
    />
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
            <PrivateRoute exact user={user} path='/create-event' render={(props) => <Create setUser={setUser} fetchEvents={fetchEvents}></Create>} />
            {/* <PrivateRoute exact user={user} path='/event' render={(props) => <Event setUser={setUser}></Event>} />
            <PrivateRoute exact user={user} path='/send-email' render={(props) => <Send setUser={setUser}></Send>} /> */}
            {events.map(e => <PrivateRoute exact key={e._id} user={user} path={`/event/${e._id}`} render={(props) => <Event setUser={setUser} event={e} />} />)}
            {events.map(e => <PrivateRoute exact key={e._id} user={user} path={`/event/${e._id}/email`} render={(props) => <Send setUser={setUser} event={e} />} />)}
            <Route exact path='/login' render={(props) => <Login setUser={setUser} setLoaded={setLoaded}/>}/>
            <Route render={() => <h1>404: page not found</h1>}></Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;