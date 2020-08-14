import React from 'react';
import { Link } from 'react-router-dom';
import Header from './../components/header.js'

export default function Dashboard() {
    return (

        <div>
            <Header title='Dashboard'/>
            <div>
                <h2>Dashboard</h2>
                <p>this is the dashboard page</p>
                <Link to={'/create-event'} className="nav-link">Create Event</Link>
            </div>
        </div>
    );
}