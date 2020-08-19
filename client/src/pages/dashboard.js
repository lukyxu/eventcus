import React from 'react';
import { Link } from 'react-router-dom';
import Header from './../components/header.js'
import {logout} from '../services/authService'

export default function Dashboard({setUser}) {
    return (
        <div>
            <Header title='Dashboard'/>
            <div>
                <h2>Dashboard</h2>
                <p>this is the dashboard page</p>
                <Link to={'/create-event'} className="nav-link">Create Event</Link>
                <Link to={'/login'} onClick={() => {logout(() => {setUser(null)})}} className="nav-link">Logout</Link>
            </div>
        </div>
    );
}