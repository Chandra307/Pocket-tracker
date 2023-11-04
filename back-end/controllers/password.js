const User = require('../models/user');
const ForgotPasswordRequest = require('../models/password');

const Sib = require('sib-api-v3-sdk');

const bcrypt = require('bcryptjs');

const { v4: uuid4 } = require('uuid');

function isInputInvalid(value) {
    if (!value) {
        return true;
    } else {
        return false;
    }
}

exports.forgot = async (req, res, next) => {
    try {
        const { email } = req.body;

        if(isInputInvalid(email)){
            return res.status(400).json('Please enter your email!');
        }

        const user = await User.findOne({ where: { email: email } });
        const uuid = uuid4();
        console.log(uuid, 'uniques stuff');
        await user.createForgotPasswordRequest({
            id: uuid,
            isActive: true
        });

        const client = Sib.ApiClient.instance;
        const apiKey = client.authentications['api-key'];
        apiKey.apiKey = process.env.API_KEY;

        const tranEmailApi = new Sib.TransactionalEmailsApi();

        const sender = {
            email: 'chandra19151425@gmail.com',
            name: 'Expense Tracker'
        };
        const receivers = [
            {
                email: 'rc19151425@gmail.com'
            }
        ];
        const result = await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: `Confirmation mail to reset password`,
            htmlContent: `<p>Click below to reset password!</p><a href='http://13.48.13.12:3000/password/resetpassword/${uuid}'>RESET PASSWORD</a>`
        });
        
        console.log(result);
        res.send('<p>We have sent a mail to reset your password, please check your inbox!</p>');

    }
    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}

exports.resetPassword = async (req, res, next) => {
    try {

        const uuid = req.params.id;
        const request = await ForgotPasswordRequest.findOne({ where: { id: uuid } });

        if (request.isActive) {

            request.update({ isActive: false} );

            res.send(`<form>
            Enter new password<br><input type='password' name='newPassword' required/>
            <input type='hidden' name='uuid' value='${uuid}'/><button type='submit'>Submit</button></form>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.5.0/axios.min.js"></script>
            <script>document.querySelector('form').onsubmit=async (e) => {
                try{
                    e.preventDefault();
                    let obj={
                        newPassword: e.target.newPassword.value,
                        uuid: e.target.uuid.value
                    };
                    const {data} = await axios.post('http://13.48.13.12:3000/password/updatepassword',obj);
                    e.target.innerHTML = '<p>'+ data +'</p>';
                }catch(err){
                    console.log(err);
                    e.target.innerHTML = '<p>'+ err +'</p>';
                }
            }</script>`);
        }
        else {
            res.send(`<h2 style= 'color: red;text-align: center;'>Link expired!</h2>`);
        }
    }
    catch (err) {
        console.log(err, 'error in reset password');
        res.status(500).json(err);
    }
}

exports.updatePassword = async (req, res, next) => {
    try {
        const { newPassword, uuid } = req.body;
        console.log('form data', req.body);
        const request = await ForgotPasswordRequest.findOne({ where: { id: uuid } });
        const user = await User.findOne({ where: { id: request.userId } });
        if (user) {

            bcrypt.hash(newPassword, 10, async (err, hash) => {
                try {

                    if (err) {
                        console.log(err, 'error in hashing');
                    }
                    await user.update({ password: hash });
                    res.send('Password reset successfully, log in with your new password!');
                }
                catch (err) {
                    throw new Error(err);
                }
            })
        }
        else {
            res.status(404).json('No user exists');
        }
    }
    catch (err) {
        console.log(err, 'in updating password');
        res.status(500).json(err);
    }
}