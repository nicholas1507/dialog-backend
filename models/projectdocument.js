'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProjectDocument extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProjectDocument.belongsTo(models.Project, { foreignKey: "projectId" });
      ProjectDocument.belongsTo(models.User, { foreignKey: "uploadedBy", as: "Uploader" });
    }
  }
  ProjectDocument.init({
    projectId: {type: DataTypes.INTEGER, allowNull: false},
    uploadedBy: {type: DataTypes.INTEGER, allowNull: false},
    type: {type: DataTypes.ENUM("SOURCE","RESULT"), allowNull: false},
    filePublicId: {type: DataTypes.STRING, allowNull: false},
    fileURL: {type: DataTypes.STRING, allowNull: false},
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'ProjectDocument',
  });
  return ProjectDocument;
};