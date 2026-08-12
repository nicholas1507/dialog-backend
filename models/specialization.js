'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Specialization extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Specialization.hasMany(models.Project, { foreignKey: "specializationId" });
      Specialization.belongsToMany(models.Translator, {as: "translators", through: models.TranslatorSpecialization, foreignKey: "specializationId"});
    }
  }
  Specialization.init({
    name: {type: DataTypes.STRING, allowNull: false}
  }, {
    sequelize,
    modelName: 'Specialization',
  });
  return Specialization;
};