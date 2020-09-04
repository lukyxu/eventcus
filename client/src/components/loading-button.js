import React, { useState } from 'react';
import { Button, Spinner } from "react-bootstrap";

export default function LoadingButton({ title, loadingTitle, onClick }) {

  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <Button className="blueButton" type="button" disabled>
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
          style={{ marginRight: "5px", marginBottom: "2px" }}
        />
          {loadingTitle}
      </Button>);
  } else {
    return (
      <Button className="blueButton"
        onClick={async (e) => {
          setLoading(true);
          await onClick(e);
          setLoading(false);
        }}>
        {title}
      </Button>);
  }
}
