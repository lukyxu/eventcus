import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { logout } from '../services/authService'
import { useHistory } from "react-router-dom";
import { toast } from 'react-toastify';

export default function Header({ title, setUser }) {
  const history = useHistory();
  return <Navbar variant="dark" sticky="top">
      <Navbar.Brand>{title}</Navbar.Brand>
      <Nav className="mr-auto">
          {title === "Dashboard" ? null
              : <Nav.Link as={Link} to="/">Dashboard</Nav.Link> }
      </Nav>
      <Nav className="justify-content-end">
          <Button onClick={() => { logout((res) => { 
            if (res.error) {
              toast.error(`Error with logout: ${res.error}`)
            }
            setUser(null); history.push('/login') 
            })}}> Sign out</Button>
      </Nav>
  </Navbar>
    
}