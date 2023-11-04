const ul = document.getElementById('expenses');
const token = localStorage.getItem('token');
const pages = document.getElementById('pages');
const select = document.getElementById('per-page');
let putId;

select.oninput = () => {
    localStorage.setItem("number", select.value);
    sendGetRequest(1);
    console.log(select.value, localStorage.getItem('number'));
}

async function sendGetRequest(page) {
    try {

        let number = 5;
        if (localStorage.getItem('number')) {
            number = localStorage.getItem('number');
        }
        const { data: { expenses, pageData } } = await axios.get(`http://13.48.13.12:3000/expense/getexpenses?page=${page}&number=${number}`, { headers: { "Authorization": token } });

        ul.innerHTML = `<h2>Expenses</h2>`;
        expenses.forEach((expense, index) => {
            displayExpenses(expense, index, pageData.limit, pageData.currentPage);
        });

        pages.innerHTML = '';
        if (pageData.previousPage > 0) {

            if (+pageData.previousPage - 1 === 1) {
                pages.innerHTML = `<button class='btn' id='page1' onclick='sendGetRequest(1)'>1</button>`;
            }
            else if (pageData.previousPage - 1 > 1) {
                pages.innerHTML = `<button class='btn' id='page1' onclick='sendGetRequest(1)'>1</button>.. `;
            }
            pages.innerHTML += `<button class='btn' id='page${pageData.previousPage}' onclick='sendGetRequest(${pageData.previousPage})'>${pageData.previousPage}</button>`;
        }

        pages.innerHTML += `<button class='btn' id='page${pageData.currentPage}' onclick='sendGetRequest(${pageData.currentPage})'>${pageData.currentPage}</button>`;
        document.getElementById(`page${page}`).className = 'active';

        if (pageData.hasNextPage) {

            pages.innerHTML += `<button class='btn' id='page${pageData.nextPage}' onclick='sendGetRequest(${pageData.nextPage})'>${pageData.nextPage}</button>`;

            if (pageData.nextPage + 1 === pageData.lastPage) {
                pages.innerHTML += `<button class='btn' id='page${pageData.lastPage}' onclick='sendGetRequest(${pageData.lastPage})'>${pageData.lastPage}</button>`;
            }
            else if (pageData.nextPage + 1 < pageData.lastPage) {
                pages.innerHTML += `.. <button class='btn' id='page${pageData.lastPage}' onclick='sendGetRequest(${pageData.lastPage})'>${pageData.lastPage}</button>`;
            }
        }
    }
    catch (err) {
        console.log(err);
    }
}

document.querySelector('form').onsubmit = async (e) => {
    try {
        e.preventDefault();

        document.getElementById('error').textContent = '';

        const expenseDetails = {
            amount: e.target.amount.value,
            description: e.target.description.value,
            category: e.target.category.value,
            date: e.target.date.value
        };
        e.target.reset();

        if(!putId){
            await axios.post('http://13.48.13.12:3000/expense/addexpense', expenseDetails, { headers: { "Authorization": token } });
            sendGetRequest(1);
            document.querySelector('dialog').close();
        }
        else {
            await axios.put(`http://13.48.13.12:3000/expense/editexpense/${putId}`, expenseDetails, { headers: { "Authorization": token } });
            document.getElementById('submit').textContent = 'Add Expense';
            sendGetRequest(1);
            document.querySelector('dialog').close();
            putId = '';
        }
    }
    catch (err) {
        document.querySelector('#error').textContent = `${err}`;
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    try {
        if(!token){
            window.location = '../login/login.html';
        }
        console.log(token);
        document.getElementById('error').textContent = '';

        const page = 1;
        sendGetRequest(page);

        if (localStorage.getItem('number')) {
            select.value = localStorage.getItem('number');
        }

        const { data: { files, premium } } = await axios.get('http://13.48.13.12:3000/user/downloads', { headers: { "Authorization": token } });
        if (premium) {

            showLeaderboard();
            document.getElementById('premium').remove();
            document.querySelector('.premium').textContent = 'Premium User';
        }
        else {
            document.getElementById('premium').removeAttribute('style');
            document.getElementById('premium').style.marginLeft = '1rem';

        }
        if (files.length) {

            files.forEach(file => {
                document.querySelector('#downloads').innerHTML += `<li><a href='${file.fileUrl}'>${new Date(file.createdAt).toLocaleString()}</a></li>`;
            })
        }
    }
    catch (err) {
        console.log(err);
        // if(err.response.status === 401){
        //     alert('You are logged out!!');
        //     window.location = '../login_page/login.html';
        // }
        document.querySelector('#error').textContent = `${err}`
    }
})

document.getElementById('premium').onclick = async (e) => {
    try {
        const response = await axios.get('http://13.48.13.12:3000/premium/purchase', { headers: { "Authorization": token } });
        var options = {
            "key": response.data.key_id,
            "name": "Pocket Tracker",
            "description": "Test Transaction",
            "order_id": response.data.order.id,
            "theme": {
                "color": "#3399cc"
            },
            "handler": async function (result) {
                try {
                    await axios.post('http://13.48.13.12:3000/premium/updateStatus', {
                        order_id: options.order_id,
                        payment_id: result.razorpay_payment_id
                    }, { headers: { "Authorization": token } });

                    alert('You are a premium user now!');
                    document.getElementById('premium').remove();
                    showLeaderboard();
                    document.querySelector('.premium').textContent = 'Premium User';
                }
                catch (err) {
                    console.log(err);
                }
            }
        }
        const rzp1 = new Razorpay(options);
        rzp1.open();
        e.preventDefault();

        rzp1.on('payment.failed', async function ({ error: { metadata } }) {
            // console.log(metadata, 'failure it is');
            try {
                await axios.post('http://13.48.13.12:3000/premium/updateStatus', {
                    status: "failed",
                    order_id: options.order_id,
                    payment_id: metadata.payment_id
                }, { headers: { "Authorization": token } });
                alert('Sorry, payment failed!');
            }
            catch (err) {
                console.log(err);
            }
        })
    }
    catch (err) {
        console.log(err);
    }
}

function displayExpenses(obj, index, limit, page) {

    if (limit && page) {
        number = ((page - 1) * limit) + index + 1;
    }
    ul.innerHTML += `<li id='${obj.id}' class='list-group-item'><div>${number}. ₹${obj.amount} - ${obj.description} - ${obj.category}</div>
                    <button class='btn btn-outline-danger' onclick='deleteExpense(${obj.id})' title='Delete'>
                    <span class='del-icon'>X</span></button>
                    <button class='btn btn-outline-success' onclick='editExpense(${obj.id})' title='Edit'>
                    <span class='glyphicon'>&#x270f;</span></button></li>`;
}

function showLeaderboard() {

    document.getElementById('leader').removeAttribute('style');

    document.querySelector('#leader').onclick = async (e) => {
        try {
            document.getElementById('leaderboard').innerHTML = `<h2 style='font-family: arial;'>Leaderboard</h2>`;

            const response = await axios.get('http://13.48.13.12:3000/premium/leaderboard');
            response.data.forEach(detail => {
                document.getElementById('leaderboard').innerHTML += `<li id='${detail.name}' style='font-size: 1.1rem;'>${detail.name} - Total expenses: ₹${Number(detail.totalExpenses)}</li>`;
            });
        }
        catch (err) {
            console.log(err);
        }
    }
}

async function deleteExpense(id) {
    try {

        if (document.querySelector('#error')) {
            document.querySelector('#error').remove();
        }

        const token = localStorage.getItem('token');
        if (confirm('Delete this expense?')) {

            await axios.delete(`http://13.48.13.12:3000/expense/delete-expense/${id}`, { headers: { "Authorization": token } });
            document.getElementById(id).remove();        
        }
    }
    catch (err) {
        console.log(err);
        ul.innerHTML += `<h3 id='error' style='color: red; font-family: sans-serif;'>${err.response.data}</h3>`;
    }
}

async function editExpense(id) {
    try {
        const li = document.getElementById('id');
        const { data: { expense } } = await axios.get(`http://13.48.13.12:3000/expense/getexpense/${id}`, { headers: { "Authorization": token } });
        
        document.querySelector('dialog').showModal();
        document.getElementById('amount').focus();
        document.getElementById('amount').value = expense.amount;
        document.getElementById('desc').value = expense.description;
        document.getElementById('category').value = expense.category;
        document.getElementById('date').value = expense.date;
        document.getElementById('submit').textContent = 'Update Expense';
        putId = id;
    }
    catch (err) {
        console.log(err);
    }
}

document.getElementById('plus').onclick = () => {
    document.querySelector('dialog').showModal();
    document.getElementById('amount').focus();
}

document.querySelector('#close').onclick = () => {
    console.log('close dialog');
    document.querySelector('dialog').close();
}