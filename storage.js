const key = 'userData';

function loadUserData(){
    const data = localStorage.getItem(key);
    const result = data ? JSON.parse(data) : null;
    return result;
}

function saveUserData(userData){
    if(!userData){ return; }
    localStorage.setItem(key, JSON.stringify(userData));
}

function deleteUserData(){
    localStorage.removeItem(key);
}