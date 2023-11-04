const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const ForgotPasswordRequest = sequelize.define('ForgotPasswordRequest', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
    },
    isActive:Sequelize.BOOLEAN
})

module.exports = ForgotPasswordRequest;