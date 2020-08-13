import React from 'react';
import { Link } from 'react-router-dom';

export default function Create() {
        return (
            <div>
                <h2>Create Event</h2>
                <p>this is the create event page</p>
                <Link to={'/'} className="nav-link"> Dashboard </Link>
            </div>
        );
    }