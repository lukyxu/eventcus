import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Header({ title }) {
    return <Navbar variant="dark" sticky="top">
        <Navbar.Brand>{title}</Navbar.Brand>
        <Nav className="mr-auto">
            {title === "Dashboard" ? null
                : <Nav.Link as={Link} to="/">Dashboard</Nav.Link> }
        </Nav>
        <Nav className="justify-content-end">
            <Button> Sign out</Button>
        </Nav>
    </Navbar>
    
}