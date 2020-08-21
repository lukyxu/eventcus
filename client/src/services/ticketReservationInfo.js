export default function TicketReservationInfo(data) {
    console.log(data)
    return fetch('/ticketReservationInfo', {
        method: "post",
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include"
    }).then(res => {
        if (res.status !== 201) {
            return res.json().then(data => data);;
        }
    })
}