const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    phone: Sequelize.STRING,
    password: Sequelize.STRING,
    isPremiumUser: Sequelize.BOOLEAN,
    totalExpenses: Sequelize.INTEGER
})

module.exports = User;