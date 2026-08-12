'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Project.belongsTo(models.User, { foreignKey: "clientId", as: "client" });
      Project.belongsTo(models.Translator, { foreignKey: "translatorId", as: "translator" });
      Project.belongsTo(models.Language, { foreignKey: "sourceLanguageId", as: "sourceLanguage" });
      Project.belongsTo(models.Language, { foreignKey: "targetLanguageId", as: "targetLanguage" });
      Project.belongsTo(models.Specialization, { foreignKey: "specializationId", as: "specialization" });

      Project.hasMany(models.ProjectDocument, { as:"projectDocument",foreignKey: "projectId" });
      Project.hasOne(models.Payment, { as:"payment", foreignKey: "projectId" });
      Project.hasMany(models.ProjectCandidate, {foreignKey: "projectId"});
    }
  }
  Project.init({
    clientId: {type: DataTypes.INTEGER, allowNull: false},
    translatorId: {type: DataTypes.INTEGER, allowNull: true},
    title: {type: DataTypes.STRING, allowNull: false},
    description: DataTypes.TEXT,
    sourceLanguageId: {type: DataTypes.INTEGER, allowNull: false},
    targetLanguageId: {type: DataTypes.INTEGER, allowNull: false},
    wordCount: {type: DataTypes.INTEGER, allowNull: false},
    specializationId: {type: DataTypes.INTEGER, allowNull: false},
    budget: {type: DataTypes.DECIMAL(10,2), allowNull: false},
    durationDays: {type: DataTypes.INTEGER, allowNull: false},
    completionDeadline: {type: DataTypes.DATE, allowNull: true},
    status: {type: DataTypes.ENUM("WAITING_PAYMENT","OPEN","IN_PROGRESS","OVERDUE","WAITING_REVIEW","COMPLETED","CANCELLED","FAILED"), allowNull: false}
  }, {
    sequelize,
    modelName: 'Project',
  });
  return Project;
};