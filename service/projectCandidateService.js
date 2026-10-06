const { Op } = require('sequelize');
const createError = require('../utils/createError');
class ProjectCandidateService{
    constructor({User,ProjectCandidate, Project, Translator, sequelize}){
        this.User = User;
        this.ProjectCandidate = ProjectCandidate;
        this.Project = Project;
        this.Translator = Translator;
        this.sequelize = sequelize;
    }
    async getOpenProject(projectId,transaction){
        const project = await this.Project.findByPk(projectId,{transaction});
        if(!project){
            throw createError("Project not found!",404);
        }
        if(project.status !== "OPEN"){
            throw createError("Project is not open!",400);
        }
        return project;
    }
    async createApplication({userId,projectId,message}){
        return this.sequelize.transaction(async(t) => {
            const project = await this.getOpenProject(projectId,t);
            const translator = await this.Translator.findOne({
                where: {userId},
                transaction: t
            });
            if(!translator){
                throw createError("Translator not found!",404);
            }
            const existingCandidate = await this.ProjectCandidate.findOne({
                where: {translatorId: translator.id, projectId},
                transaction: t
            });
            if(existingCandidate){
                throw createError("You already apply to this project!",400);
            }
            const projectCandidate = await this.ProjectCandidate.create({
                projectId,
                translatorId: translator.id,
                type: "APPLICATION",
                status: "PENDING",
                message
            },{transaction: t});
            return projectCandidate;
        })
    }
    async createInvitation({userId,translatorId,projectId,message}){
        return this.sequelize.transaction(async(t) => {
            const project = await this.getOpenProject(projectId,t);
            if(!project){
                throw createError("Project not found!",404);
            }
            if(project.clientId !== userId){
                throw createError("Unauthorized!",401);
            }
            if(project.translatorId){
                throw createError("Project already has a translator!",400);
            }
            const translator = await this.Translator.findByPk(translatorId,{transaction: t});
            if(!translator){
                throw createError("Translator not found!",404);
            }
            const existingCandidate = await this.ProjectCandidate.findOne({
                where: {projectId,translatorId: translator.id},
                transaction: t
            });
            if(existingCandidate){
                throw createError("The translator already a candidate!",400);
            }
            const inviteCandidate = await this.ProjectCandidate.create({
                projectId,
                translatorId,
                type: "INVITATION",
                status: "PENDING",
                message
            },{transaction: t});
            return inviteCandidate;
        })
    }
    async getMyProjectCandidate({userId,projectId}){
        const project = await this.Project.findByPk(projectId);
        if(!project){
            throw createError("Project not found!",404);
        }
        if(project.clientId !== userId){
            throw createError("Unauthorized!",401);
        }
        const projectCandidate = await this.ProjectCandidate.findAll({
            include: [
                {model: this.Translator, as: "translator", include: [
                    {model: this.User, as: "user", attributes: ['id',"name"]}
                ]}
            ],
            where: {
                projectId,
                [Op.or]: [
                    {type: "APPLICATION", status: "PENDING"},
                    {type: "INVITATION", status: "ACCEPTED"}
                ]
            }
        });
        return projectCandidate;
    }
}
module.exports = ProjectCandidateService;