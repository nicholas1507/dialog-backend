'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Translator extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Translator.belongsTo(models.User, { as: "user", foreignKey: "userId" });
      Translator.hasMany(models.TranslatorLanguagePair, { as: "languagePairs",foreignKey: "translatorId" });
      Translator.hasMany(models.Project, { as:"projects",foreignKey: "translatorId" });
      Translator.hasMany(models.ProjectCandidate, {as:"projectCandidates",foreignKey: "translatorId"});
      Translator.belongsToMany(models.Specialization, {as: "specializations", through: models.TranslatorSpecialization,foreignKey: "translatorId"})
    }
  }
  Translator.init({
    userId: {type: DataTypes.INTEGER,allowNull: false},
    experience: {type: DataTypes.TEXT,allowNull: false},
    ratePerProject: {type: DataTypes.DECIMAL},
    cvURL: {type: DataTypes.STRING,allowNull: false}
  }, {
    sequelize,
    modelName: 'Translator',
  });
  return Translator;
};