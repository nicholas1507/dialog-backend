'use strict';

const {User,Role} = require('../models');

module.exports = {
async up(queryInterface, Sequelize) {
    const roleAdmin = await Role.findOne({
        where: {name: 'Admin'}
    });

    if(!roleAdmin) {
        throw new Error('Admin role not found!');
    }

    const existingAdmin = await User.findOne({
        where: {email: 'admin@gmail.com'}
    });

    if(existingAdmin) return;

    const admin = await User.create({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: 'business17'
    });

    await admin.setRoles([roleAdmin.id]);
},

async down(queryInterface, Sequelize) {
    const admin = await User.findOne({
        where: {email: 'admin@gmail.com'}
    });

    if(admin) {
        await admin.destroy();
    }
}
};