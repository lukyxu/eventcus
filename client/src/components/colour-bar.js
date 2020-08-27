import React, { useState } from 'react';
import { Form, Col, Row, Button } from 'react-bootstrap';
import PostForm from './../services/post-form.js';

export default function ColourBar({data}) {
  // Data = [{name, value, colour}]
  // let data = [
  //   {name: "Normal", value: 50, colour:"#4ae575"},
  //   {name: "VIP", value: 50, colour:"#ffb800"},
  //   {name: "Committee", value: 50, colour:"#de5959"}
  // ]
  let totalValue = data.map(d => d.value).reduce((a,b) => a+b)
  console.log(totalValue)

  return <div style={{overflow: "hidden", borderRadius:"12px", display:"flex", height:"30px"}}>
    {data.map(d => {
      return <div key={d.name} title={d.name + " " + d.value + "/" + totalValue} style={{backgroundColor: d.colour, height: "100%", display: "inline-block", width: d.value/totalValue*100+"%" }}></div>
    })}
  </div>
}