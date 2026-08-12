'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProjectCandidate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProjectCandidate.belongsTo(models.Project, {as: "project",foreignKey: "projectId"});
      ProjectCandidate.belongsTo(models.Translator, {as: "translator",foreignKey: "translatorId"});
    }
  }
  ProjectCandidate.init({
    projectId: {type: DataTypes.INTEGER, allowNull: false},
    translatorId: {type: DataTypes.INTEGER, allowNull: false},
    type: {type: DataTypes.ENUM("APPLICATION","INVITATION"), allowNull: false},
    status: {type: DataTypes.ENUM("PENDING","ACCEPTED","DECLINED","CONFIRMED","CANCELLED","EXPIRED"), allowNull: false},
    message: {type: DataTypes.STRING,allowNull: true}
  }, {
    sequelize,
    modelName: 'ProjectCandidate',
  });
  return ProjectCandidate;
};