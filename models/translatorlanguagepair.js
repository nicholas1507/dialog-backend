'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TranslatorLanguagePair extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TranslatorLanguagePair.belongsTo(models.Translator, { foreignKey: "translatorId" });
      TranslatorLanguagePair.belongsTo(models.Language, { foreignKey: "sourceLanguageId", as: "sourceLanguage" });
      TranslatorLanguagePair.belongsTo(models.Language, { foreignKey: "targetLanguageId", as: "targetLanguage" });
    }
  }
  TranslatorLanguagePair.init({
    translatorId: {type: DataTypes.INTEGER, allowNull: false},
    sourceLanguageId: {type: DataTypes.INTEGER, allowNull: false},
    targetLanguageId: {type: DataTypes.INTEGER, allowNull: false}
  }, {
    sequelize,
    modelName: 'TranslatorLanguagePair',
  });
  return TranslatorLanguagePair;
};