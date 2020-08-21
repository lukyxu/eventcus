import React from 'react';
import { Link } from 'react-router-dom';
import Header from './../components/header.js'
import { logout } from '../services/authService'
import AllocateTickets from './../services/allocate.js';
import TicketReservationInfo from './../services/ticketReservationInfo.js';
import Button from '@material-ui/core/Button';

export default function Dashboard({ setUser }) {

    const pressAllocate = () => {
        const reqBody = {
            sheetId: '1rSQ4ZqxQz3qxyH9oUDJ2KYN4C2kCz2gQSZicq9ayO9E'
        }
        const res = AllocateTickets(reqBody);
    }

    const pressTicketResInfo = () => {
        const reqBody = {
            sheetId: '1rSQ4ZqxQz3qxyH9oUDJ2KYN4C2kCz2gQSZicq9ayO9E'
        }
        const res = TicketReservationInfo(reqBody);
    }

    return (
        <div>
            <Header title='Dashboard' />
            <div>
                <h2>Dashboard</h2>
                <p>this is the dashboard page</p>
                <Link to={'/create-event'} className="nav-link">Create Event</Link>
                <Link to={'/login'} onClick={() => { logout(() => { setUser(null) }) }} className="nav-link">Logout</Link>
                <p className='createNewEventButton'>Create a new event</p>

                <Button onClick={pressAllocate}> Allocate </Button>
                <Button onClick={pressTicketResInfo}> Ticket Reservation Info </Button>
            </div>
        </div>
    );
}