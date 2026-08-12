const {ProjectDocument, Project,Translator,sequelize} = require('../models');

class ProjectDocumentController{
    static async translatorProjectDocument(req,res){
        try{
            const result = await sequelize.transaction(async(t) => {
                const userId = req.user.id;
                const {note} = req.body;
                const {projectId} = req.params;
                const translator = await Translator.findOne({where: {userId},transaction:t});
                if(!translator){
                    throw new Error("You're not translator!");
                }
                const project = await Project.findByPk(projectId,{transaction: t});
                if(!project){
                    throw new Error("Project not found!");
                }
                if(project.translatorId !== translator.id){
                    throw new Error("The project isnt belong to you!");
                }
                if(!req.file){
                    throw new Error("No file uploaded!");
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
            console.error(error);
            res.status(500).json({
                error: error.message
            })
        }
    }
}

module.exports = ProjectDocumentController;