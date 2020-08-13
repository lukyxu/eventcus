import React from 'react';
import { Link } from 'react-router-dom';
import './styles.css';
import {Navbar} from 'react-bootstrap';

export default function Dashboard() {
    return (

        <div>
            <Navbar fixed='top' variant='dark'>
                Dashboard
            </Navbar>
            <div>
                <h2>Dashboard</h2>
                <p>this is the dashboard page</p>
                <Link to={'/create-event'} className="nav-link">Create Event</Link>
            </div>
        </div>
    );
}