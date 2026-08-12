'use strict';

const {Role} = require('../models');

module.exports = {
    async up(queryInterface, Sequelize) {
        await Role.bulkCreate([
            {
                name: 'Admin',
                description: 'Platform administrator'
            },
            {
                name: 'Client',
                description: 'Translation service client'
            },
            {
                name: 'Translator',
                description: 'Translation service provider'
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        await Role.destroy({
            where: {
                name: ['Admin', 'Client', 'Translator']
            }
        });
    }
};