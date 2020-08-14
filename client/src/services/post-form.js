export default function PostForm(formData) {
    console.log("here")
    return fetch('/createForm',{
        method : "post",
        body : JSON.stringify(formData),
        headers : {
            'Content-Type' : 'application/json',
        },
        credentials: "include"
    }).then(res => {
        console.log("here2")
        if(res.status !== 201) {
            return res.json().then(data => data);;
        }
    })
}