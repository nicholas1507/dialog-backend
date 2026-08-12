'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Language extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Language.hasMany(models.TranslatorLanguagePair, { foreignKey: "sourceLanguageId", as: "sourcePairs" });
      Language.hasMany(models.TranslatorLanguagePair, { foreignKey: "targetLanguageId", as: "targetPairs" });
      Language.hasMany(models.Project, { foreignKey: "sourceLanguageId", as: "sourceProjects" });
      Language.hasMany(models.Project, { foreignKey: "targetLanguageId", as: "targetProjects" });
    }
  }
  Language.init({
    name: {type: DataTypes.STRING,allowNull: false},
    code: {type: DataTypes.STRING,allowNull: false}
  }, {
    sequelize,
    modelName: 'Language',
  });
  return Language;
};