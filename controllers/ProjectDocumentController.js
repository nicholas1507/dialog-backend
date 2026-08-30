const {ProjectDocument, Project,Translator,sequelize} = require('../models');
const createError = require('../utils/createError');

class ProjectDocumentController{
    static async translatorProjectDocument(req,res,next){
        try{
            const result = await sequelize.transaction(async(t) => {
                const userId = req.user.id;
                const {note} = req.body;
                const {projectId} = req.params;
                const translator = await Translator.findOne({where: {userId},transaction:t});
                if(!translator){
                    throw createError("You're not translator!",401);
                }
                const project = await Project.findByPk(projectId,{transaction: t});
                if(!project){
                    throw createError("Project not found!",404);
                }
                if(project.translatorId !== translator.id){
                    throw createError("The project isnt belong to you!",400);
                }
                if(!req.file){
                    throw createError("No file uploaded!",400);
                }
                const filePublicId = req.file.filename;
                const fileURL = req.file.path;
                const projectDocument = await ProjectDocument.create({
                    projectId: projectId,
                    uploadedBy: translator.id,
                    type: "RESULT",
                    filePublicId,
                    fileURL,
                    note
                },{transaction: t});
                project.status = "WAITING_REVIEW";
                await project.save({transaction: t});
                return {projectDocument,project}
            });
            res.status(201).json(result);
        }catch(error){
            next(error);
        }
    }
}

module.exports = ProjectDocumentController;