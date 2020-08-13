import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Dashboard extends Component {
  render() {
    return (
        <div>
          <h2>Dashboard</h2>
          <p>this is the dashboard page</p>
          <Link to={'/create-event'} className="nav-link">Create Event</Link>
        </div>
    );
  }
}

export default Dashboard;