export default function TicketAllocations(data) {
    return fetch('/getTicketAllocations', {
        method: "post",
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include"
    }).then(res => {
      if (res.status === 401) {
        console.log(`ERROR: ${res.status}`)
        return null
      }
      return res.json().then(data => data);
    })
}