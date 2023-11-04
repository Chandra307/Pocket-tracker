const Sequelize = require('sequelize');

const sequelize = new Sequelize('pocket', 'ravikovuri', 'Rav!1999', {
    dialect: 'mysql',
    host: 'database-1.clbchjxwqvbb.eu-north-1.rds.amazonaws.com'
})

module.exports = sequelize;