import React from 'react';
import { Link } from 'react-router-dom';
import Header from './../components/header.js'
import { logout } from '../services/authService'
import AllocateTickets from './../services/allocate.js';
import TicketReservationInfo from './../services/ticketReservationInfo.js';
import ChangePaymentStatus from './../services/changePaymentStatus.js';
import Button from '@material-ui/core/Button';

export default function Dashboard({ setUser }) {

    const pressAllocate = () => {
        const reqBody = {
            sheetId: '1-B59r_kFGsAebgBlmaW18i5SU9jsbVRNIx2PkbIr358'
        }
        const res = AllocateTickets(reqBody);
    }

    const pressTicketResInfo = () => {
        const reqBody = {
            sheetId: '1-B59r_kFGsAebgBlmaW18i5SU9jsbVRNIx2PkbIr358'
        }
        const res = TicketReservationInfo(reqBody);
    }

    const pressChangePaymentStatus = () => {
        const reqBody = {
            sheetId: '1-B59r_kFGsAebgBlmaW18i5SU9jsbVRNIx2PkbIr358',
            timestamp: '25/08/2020 07:35:04',
            fullName: 'Alex Liu',
        }
        const res = ChangePaymentStatus(reqBody);
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
                <Button onClick={pressChangePaymentStatus}> ChangePaymentStatus </Button>
            </div>
        </div>
    );
}