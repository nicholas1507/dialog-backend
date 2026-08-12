'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Profile.belongsTo(models.User, {foreignKey: "userId"});
    }
  }
  Profile.init({
    userId: {type: DataTypes.INTEGER , allowNull:false, unique: true},
    phone: DataTypes.STRING,
    city: DataTypes.STRING,
    country: DataTypes.STRING,
    bio: DataTypes.TEXT,
    imageURL: DataTypes.STRING,
    imagePublicId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Profile',
  });
  return Profile;
};