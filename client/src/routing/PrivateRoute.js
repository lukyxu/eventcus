import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({render: Render, user, ...rest}) => {
  if (!user) {
    return <Redirect to="/login" />
  }
  return <Route {...rest} render={props => Render(props)}/>
}

export default PrivateRoute;
