const Expense = require('../models/expense');

const UserServices = require('../services/userservices');

const S3Service = require('../services/S3service');

const sequelize = require('../util/database');

function isInputInvalid(value) {
    if (!value) {
        return true;
    } else {
        return false;
    }
}

exports.addExpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { amount, description, category, date } = req.body;

        if (isInputInvalid(amount) || isInputInvalid(description) || isInputInvalid(category) || isInputInvalid(date)) {
            return res.status(400).json('Please fill all input fields!');
        }

        const total = Number(req.user.totalExpenses) + Number(amount);

        const expense = await req.user.createExpense({ amount, description, category, date }, { transaction: t });
        await req.user.update({ totalExpenses: total }, { transaction: t });
        await t.commit();
        res.json(expense);
    }
    catch (err) {
        console.log(err, 'transaction');
        await t.rollback();
        res.status(400).json(err);
    }
}

exports.getExpenses = async (req, res, next) => {
    try {
        const currentPage = Number(req.query.page);
        const limit = Number(req.query.number);
        const total = await Expense.count({ where: { userId: req.user.id } });

        const hasNextPage = (currentPage * limit) < total;
        console.log(hasNextPage, '!?', currentPage * limit, typeof (currentPage));
        const nextPage = Number(currentPage) + Number(hasNextPage);
        const pageData = {
            currentPage,
            lastPage: Math.ceil(total / limit),
            hasNextPage,
            previousPage: currentPage - 1,
            nextPage,
            limit
        }
        const expenses = await req.user.getExpenses({ offset: (currentPage - 1) * limit, limit: limit });
        console.log('check for premiumUser', req.user.isPremiumUser, req.user.isPremiumUser === true);
        res.json({ expenses, pageData });
    }
    catch (err) {
        console.log(err, 'in get expenses');
        res.status(404).json(err);
    }
}

exports.getExpense = async (req, res, next) => {
    try {
        const expenseId = req.params.id;
        const expenseArray = await req.user.getExpenses({ where: { id: expenseId } });
        res.json({ expense: expenseArray[0] });
    }
    catch (err) {
        res.status(500).json(err);
    }
}

exports.updateExpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const expenseId = req.params.id;
        const { amount, description, category, date } = req.body;

        const expenseArray = await req.user.getExpenses({ where: { id: expenseId } });

        const updatedTotal = Number(req.user.totalExpenses) + Number(amount) - Number(expenseArray[0].amount);
        expenseArray[0].amount = amount;
        expenseArray[0].description = description;
        expenseArray[0].category = category;
        expenseArray[0].date = date;

        await expenseArray[0].save({ transaction: t });
        await req.user.update({ totalExpenses: updatedTotal }, { transaction: t });
        await t.commit();
        res.json('Expense updated successfully');
    }
    catch (err) {
        await t.rollback();
        console.log(err, 'while updating expense');
        res.status(500).json(err);
    }
}

exports.deleteExpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const expenseId = req.params.id;

        if (isInputInvalid(expenseId)) {
            return res.status(400).json('Something went wrong!');
        }

        const expenses = await UserServices.getExpenses(req, { where: { id: expenseId } });
        if (expenses.length) {
            await expenses[0].destroy({ transaction: t });
            const updatedTotal = Number(req.user.totalExpenses) - Number(expenses[0].amount);
            await req.user.update({ totalExpenses: updatedTotal }, { transaction: t });
            await t.commit();
            return res.json('expense deleted');
        }

        res.status(404).json(`You can only delete your expenses!`);

    }
    catch (err) {
        console.log(err);
        await t.rollback();
        res.status(404).json(err);
    }
}

exports.downloadExpense = async (req, res, next) => {
    try {
        const expenses = await UserServices.getExpenses(req);
        const data = JSON.stringify(expenses);
        const fileName = `Expenses/${req.user.id}/${new Date().toString()}.txt`;
        const fileUrl = await S3Service.uploadtoS3(data, fileName);
        console.log(fileUrl, 's3response');
        await UserServices.saveFileUrl(req, fileUrl.Location);
        res.json(fileUrl.Location);
    }
    catch (err) {
        console.log(err, 'while upload');
        res.status(500).json(err);
    }
}