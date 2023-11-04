const passwordInput = document.querySelector("#password");
const eye = document.querySelector("#eye");

document.querySelector('form').onsubmit = async (e) => {
    try {
        e.preventDefault();

        if (document.querySelector('#error')) {
            document.querySelector('#error').remove();
        }

        let obj = {
            email: e.target.email.value,
            password: e.target.password.value
        };
        e.target.reset();
        console.log(obj);
        const response = await axios.post('http://13.48.13.12:3000/user/login', obj);
        console.log(response.data, response.data.message);
        alert(response.data.message);
        localStorage.setItem('token', response.data.token);
        console.log(localStorage.getItem('token'));
        window.location.href = '../expense/index.htm';
        
    }
    catch (err) {
        console.log(err);
        document.querySelector('form').innerHTML += `<p id='error' style='color: red;'>${err.response.data}</p>`;
    }
}

document.getElementById('forgot').onclick = () => {

    document.querySelector('form').innerHTML = `
    <label for='email'>Enter your registered email</label>
    <input type='email' id='email' name='mailId' required/><button>Submit</button>`;

    document.querySelector('form').onsubmit = async (e) => {
        try {
            e.preventDefault();
            console.log(e.target.email, e.target.mailId);
            const email = e.target.email.value;
            const response = await axios.post('http://13.48.13.12:3000/password/forgotpassword', { email });
            console.log(response.data);
            e.target.innerHTML += response.data;
        }
        catch (err) {
            console.log(err);
        }
    }
}
eye.onclick = (e) => {
    console.log(this, e.target);
    e.target.classList.toggle("fa-eye-slash");
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
}
