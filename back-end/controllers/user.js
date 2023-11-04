const User = require('../models/user');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const { Op, fn, col } = require('sequelize');
// const sequelize = require('sequelize');
const Expense = require('../models/expense');

function generateJWT(id, name) {
    return jwt.sign({ userId: id, name: name }, process.env.JWT_KEY_SECRET);
}

function isInputInvalid(value) {
    if (!value) {
        return true;
    } else {
        return false;
    }
}

exports.addUser = async (req, res, next) => {
    try {
        let { name, email, phone, password } = req.body;

        if (isInputInvalid(name) || isInputInvalid(email) || isInputInvalid(phone) || isInputInvalid(password)) {
            return res.status(400).json('Error: Make sure you fill all input fields!');
        }

        const saltrounds = 10;
        bcrypt.hash(password, saltrounds, async (err, hash) => {
            try {
                console.log(err);
                password = hash;
                const outcome = await User.create({ name, email, phone, password });
                res.status(201).json(outcome);
            }
            catch (err) {
                console.log(err.name === 'SequelizeUniqueConstraintError');
                if (err.name === 'SequelizeUniqueConstraintError') {
                    console.log('eggjatly');
                    return res.status(403).json('Error: emailId already exists!');
                }
                res.status(500).json(err);
            }
        })
    }
    catch (err) {
        res.status(403).json(err);
    }
}

exports.getUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (isInputInvalid(email) || isInputInvalid(password)) {
            return res.status(400).json('Please make sure you fill all the input fields!');
        }
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return res.status(404).json(`User doesn't exist!`);
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                throw new Error(err);
            }
            if (result) {
                console.log('result = ', result);
                return res.json({ success: true, message: 'User logged in succesfully!', token: generateJWT(user.id, user.name) });
            }
            else {
                console.log(result, password, user.password, 'boolean');
                res.status(401).json(`Incorrect password!`);
            }
        })
    }
    catch (err) {
        res.status(500).json(err);
    }
}

exports.showLeaderboard = async (req, res, next) => {
    try {
        console.log(process.env.JWT_KEY_SECRET, 'environment variables');
        const users = await User.findAll({

            attributes: ['name', 'totalExpenses'],
            order: [['totalExpenses', 'DESC']]
        })
        res.json(users);
    }
    catch (err) {
        console.log(err);
        res.json('think again');
    }
}

exports.getDownloads = async (req, res, next) => {
    try {
        const files = await req.user.getDownloadedFiles();
        res.json({ files, premium: req.user.isPremiumUser });
    }
    catch (err) {
        res.status(500).json(err);
    }
}

exports.getDailyReport = async (req, res, next) => {
    try {
        let { date } = req.query;
        console.log(date, typeof (date), 'line 111-user');

        const promise1 = req.user.getExpenses({

            where: { date: date },
            attributes: ['amount', 'description', 'category']

        });
        const promise2 = req.user.getExpenses({

            where: { date: date } ,
            attributes: [[fn('sum', col('expense.amount')), 'total']]

        })
        const [expenses, amount] = await Promise.all([promise1, promise2]);
        res.json({ expenses, amount: amount[0] });
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}

exports.getMonthlyReport = async (req, res, next) => {
    try {
        let { month } = req.query;
        console.log(month, 'valid data');

        const promise1 = req.user.getExpenses({

            where: { date: { [Op.substring]: `${month}%` } },
            attributes: ['amount', 'description', 'category', 'date']

        });
        const promise2 = req.user.getExpenses({

            where: { date: { [Op.substring]: `${month}%` } },
            attributes: [[fn('sum', col('amount')), 'total']]

        })
        const [expenses, amount] = await Promise.all([promise1, promise2]);
        res.json({ expenses, amount: amount[0] });
    }
    catch (err) {
        res.status(500).json(err);
    }
}

exports.getWeeklyReport = async (req, res, next) => {
    try {
        let { start, end } = req.query;
        start = new Date(start);
        end = new Date(end);
        // end.setHours(end.getHours() + 24);

        const promise1 = req.user.getExpenses({

            where: { date: { [Op.between]: [start, end] } },
            attributes: ['amount', 'description', 'category', 'date']

        });
        const promise2 = req.user.getExpenses({

            where: { date: { [Op.between]: [start, end] } },
            attributes: [[fn('sum', col('amount')), 'total']]

        })
        const [expenses, amount] = await Promise.all([promise1, promise2]);
        res.json({ expenses, amount: amount[0] });
    }
    catch (err) {
        res.status(500).json(err);
    }
}

exports.getAnnualReport = async (req, res, next) => {
    try {
        const { year } = req.query;

        const promise1 = req.user.getExpenses({

            where: { date: { [Op.startsWith]: `${year}-` } },
            attributes: [[fn('sum', col('amount')), 'total'], [fn('month', col('date')), 'month']],
            group: ['month']

        })
        const promise2 = req.user.getExpenses({

            where: { date: { [Op.startsWith]: `${year}-` } },
            attributes: [[fn('sum', col('amount')), 'total']]

        })
        const [expenses, amount] = await Promise.all([promise1, promise2]);
        res.json({ expenses, amount: amount[0] });
    }
    catch (err) {
        console.log(err, 'while filming');
        res.status(500).json(err);
    }
}