document.querySelector('form').onsubmit = async (e) => {
    try{
        e.preventDefault();
        
        if(document.querySelector('#error')){
            document.querySelector('#error').remove();
        }
        
        let obj = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('mail').value,
            password: document.getElementById('password').value
        };
        e.target.reset();
        console.log(obj);
        const response = await axios.post('http://13.48.13.12:3000/user/signup', obj);
        if(response.status === 201){
            window.location.href = '../login/login.html';
        }
    }catch(err){
        console.log(err);
        document.querySelector('form').innerHTML += `<p id='error' style='color: red;'>${err.response.data}</p>`;
        
    }
}