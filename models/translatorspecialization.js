'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TranslatorSpecialization extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TranslatorSpecialization.belongsTo(models.Translator, {foreignKey: "translatorId"});
      TranslatorSpecialization.belongsTo(models.Specialization, {foreignKey: "specializationId"});
    }
  }
  TranslatorSpecialization.init({
    translatorId: {type: DataTypes.INTEGER, allowNull: false},
    specializationId: {type: DataTypes.INTEGER, allowNull: false}
  }, {
    sequelize,
    modelName: 'TranslatorSpecialization',
  });
  return TranslatorSpecialization;
};