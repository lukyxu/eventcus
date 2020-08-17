export default function PostForm(formData) {

    console.log(formData)
    return fetch('/createForm',{
        method : "post",
        body : JSON.stringify(formData),
        headers : {
            'Content-Type' : 'application/json',
        },
        credentials: "include"
    }).then(res => {
        if(res.status !== 201) {
            return res.json().then(data => data);;
        }
    })
}