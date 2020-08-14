import React from 'react';
import './../styles.css';
import { Navbar } from 'react-bootstrap';

export default function Header(props) {
    return <Navbar>
        <Navbar.Brand>{props.title}</Navbar.Brand>
    </Navbar>
    
}