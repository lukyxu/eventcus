import React from 'react';

export default function ColourBar({data}) {
  // Data = [{name, value, colour}]
  // let data = [
  //   {name: "Normal", value: 50, colour:"#4ae575"},
  //   {name: "VIP", value: 50, colour:"#ffb800"},
  //   {name: "Committee", value: 50, colour:"#de5959"}
  // ]
  let totalValue = data.map(d => d.value).reduce((a,b) => a+b)
  console.log(totalValue)

  const render = () => {
    let first = true
    return data.map((d, i) => {
      let bl = "none"
      if (d.value !== 0 && first) {
        first = false
      } else if (d.value !== 0 && !first) {
        bl = "2px solid white"
      }
      return <div key={d.name} title={d.name + " " + d.value + "/" + totalValue} style={{borderLeft: bl,backgroundColor: d.colour, height: "100%", display: "inline-block", width: d.value/totalValue*100+"%" }}></div>
    })
  }

  return <div style={{overflow: "hidden", borderRadius:"12px", display:"flex", height:"30px"}}>
    {render()}
  </div>
}