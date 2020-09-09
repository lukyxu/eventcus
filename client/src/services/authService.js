export var login = (user, cb) =>{
    return fetch('/api/login',{
        method : "post",
        body : JSON.stringify(user),
        headers : {
            'Content-Type' : 'application/json',
        },
        credentials: "include"
    }).then(res => {
        if(res.status !== 401)
            return res.json().then(data => cb(data));
        else
            return cb({ isAuthenticated : false});
    }).catch(error => cb({error}))
}
export var register = (user, cb) =>{
    console.log(user);
    return fetch('/api/register',{
        method : "post",
        body : JSON.stringify(user),
        headers : {
            'Content-Type' : 'application/json'
        },
        credentials: "include"
    }).then(res => res.json())
      .then(data => cb(data)).catch(error => cb({error}));
}
export var logout = (cb)=>{
    return fetch('/api/logout',
    {method : "post", credentials: "include"})
            .then(res => res.json())
            .then(data => cb(data)).catch(error => cb({error}));
}
export var isAuthenticated = (cb) =>{
    return fetch('/api/authenticate',
    {method: "post", credentials: "include"})
    .then(res=>{
        if(res.status !== 401){
          return res.json().then(data => cb(data));
        }
        else {
            return cb({ isAuthenticated : false });
        }
    }).catch((error) => cb({error}));
}