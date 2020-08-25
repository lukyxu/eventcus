import React from 'react';
import { Navbar, Dropdown, Nav, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function UserAvatar({user}) {
  // If a user avatar is available, return an img tag with the pic
  if (user.avatar) {
    return <img
      src={user.avatar} alt="user"
      className="rounded-circle align-self-center mr-2"
      style={{width: '32px'}}></img>;
  }

  // No avatar available, return a default icon
  return <i
    className="far fa-user-circle fa-lg rounded-circle align-self-center mr-2"
    style={{width: '32px'}}></i>;
}

function AuthNavItem({isAuthenticated, authButtonMethod, user}) {
  // If authenticated, return a dropdown with the user's info and a
  // sign out button
  if (isAuthenticated) {
    return (
      <Dropdown>
        <Dropdown.Toggle id="dropdown-basic">
          <UserAvatar user={user} />
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <h5 className="dropdown-item-text mb-0">{user.displayName}</h5>
          <p className="dropdown-item-text text-muted mb-0">{user.email}</p>
          <Dropdown.Divider />
          <Dropdown.Item onClick={authButtonMethod}>Sign Out</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  // Not authenticated, return a sign in link
  return (
    <Nav.Item>
      <Button
        onClick={authButtonMethod}
        className="btn-link nav-link border-0"
        color="link">Sign In</Button>
    </Nav.Item>
  );
}

export default function Header({ title, isAuthenticated, authButtonMethod, user}) {

  return (
    <div>
      <Navbar bg="primary" variant="dark" sticky="top">
        <Container>
          <Navbar.Brand>{title}</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              {isAuthenticated ?
                <Nav.Link as={Link} to="/send-email">Send Email</Nav.Link> : null
              }
            </Nav>
            <Nav className="justify-content-end">
              <Nav.Link href="https://developer.microsoft.com/graph/docs/concepts/overview" target="_blank">
                <i className="fas fa-external-link-alt mr-1"></i>
                Docs
              </Nav.Link>
              <AuthNavItem
                isAuthenticated={isAuthenticated}
                authButtonMethod={authButtonMethod}
                user={user} />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}