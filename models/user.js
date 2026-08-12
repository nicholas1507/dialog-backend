'use strict';
const {encryptPwd} = require('../utils/bcrypt');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsToMany(models.Role, {as:"roles", through: models.UserRole, foreignKey: "userId"});
      User.hasOne(models.Profile, {as: "profile",foreignKey: "userId"});
      User.hasOne(models.Translator, {as:"translator",foreignKey: "userId"});
      User.hasMany(models.Project, { foreignKey: "clientId", as: "ClientProjects" });
      User.hasMany(models.ProjectDocument, { foreignKey: "uploadedBy" });
      User.hasMany(models.Payment, { foreignKey: "verifiedBy", as: "VerifiedPayments" });
    }
  }
  User.init({
    name: {type: DataTypes.STRING, allowNull: false,
      validate: {
        notEmpty: {
          msg: "name cannot be empty!"
        }
      }
    },
    email: {type: DataTypes.STRING, allowNull: false,unique: true,
      validate: {
        isEmail: {
          msg: "Invalid email format!"
        }
      }
    },
    password: {type: DataTypes.STRING, allowNull: false,}
  }, {
    hooks :{
      beforeSave: (user,options)=>{
        if(user.changed("password")){
          user.password = encryptPwd(user.password);
        }
      }
    },
    sequelize,
    modelName: 'User',
  });
  return User;
};