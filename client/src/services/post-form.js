export default async function PostForm(formData) {
  console.log(formData)
    let res = await fetch('/createForm',{
        method : "post",
        body : JSON.stringify(formData),
        headers : {
            'Content-Type' : 'application/json',
        },
        credentials: "include"
    })
    if(res.status === 201) {
        console.log(`ERROR ${res.status}`)
        return null
    }
    return await res.json();
}