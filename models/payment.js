'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Payment.belongsTo(models.Project, { as:"project",foreignKey: "projectId" });
      Payment.belongsTo(models.User, { foreignKey: "verifiedBy", as: "verifier" });
    }
  }
  Payment.init({
    projectId: {type: DataTypes.INTEGER, allowNull: false},
    amount: {type: DataTypes.DECIMAL(10,2), allowNull: false},
    proofURL: {type: DataTypes.STRING, allowNull: false},
    status: {type: DataTypes.ENUM("PENDING","VERIFIED","RELEASED","REFUNDED","REJECTED"), allowNull: false},
    verifiedBy: {type: DataTypes.INTEGER,allowNull: true}
  }, {
    sequelize,
    modelName: 'Payment',
  });
  return Payment;
};