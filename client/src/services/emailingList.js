export default async function getEmails(reqBody) {
    try {
        let res = await fetch('/api/getEmailsAndTicketTypes', {
            method: "post",
            body: JSON.stringify(reqBody),
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: "include"
        })
        if (res.status === 401) {
            console.log(`ERROR ${res.status}`);
            return ({
                error: "User not authenticated"
            });
        }
        return await res.json();
    } catch (error) {
        return ({
            error
        });
    }
}