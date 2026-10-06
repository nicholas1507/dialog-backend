const { Op } = require('sequelize');
const createError = require('../utils/createError');
const {addDays} = require('../utils/date');
const PaymentService = require('../service/paymentService');
class ProjectService{
    constructor({Project,ProjectCandidate,ProjectDocument,User,Language,Specialization,Translator,Payment,sequelize}){
        this.Project = Project;
        this.ProjectCandidate = ProjectCandidate;
        this.ProjectDocument = ProjectDocument;
        this.User = User;
        this.Language = Language;
        this.Specialization = Specialization;
        this.Translator = Translator;
        this.sequelize = sequelize;
        this.paymentService = new PaymentService({Project,Payment,sequelize});
    }
    async fetchProjects({clientId,translatorId,limit,search,page}){
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;
        const whereCondition = {};
        if(search){
            whereCondition.title = {[Op.iLike]: `%${search}%`}
        }
        if(clientId !== null && clientId !== undefined){
            whereCondition.clientId = clientId
        }
        if(translatorId !== null && translatorId !== undefined){
            whereCondition.translatorId = translatorId
        }
        const projects = await this.Project.findAll({
            where: whereCondition,
            include: [
                {model: this.User, as:'client', attributes:['id','name','email']},
                {model: this.Translator, as:'translator'},
                {model: this.Language, as:'sourceLanguage', attributes:['id','name']},
                {model: this.Language, as:'targetLanguage', attributes:['id','name']},
                {model: this.Specialization, as:'specialization', attributes:['id','name']},
                {model: this.ProjectDocument, as: "projectDocument"}
            ],
            limit: limitNum,
            offset
        });
        const total = await this.Project.count({
            where: whereCondition
        });
        return {
            data: projects,
            pagination: {
                pageNum,
                limitNum,
                totalData: total,
                totalPage: Math.ceil(total/limitNum)
            }
        }
    }
    async availableProjects({page,limit,search,}){
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum-1) * limitNum;
        const whereCondition = {
            status: "OPEN",
            translatorId: null
        };
        if(search){
            whereCondition.title = {[Op.iLike]: `%${search}%`}
        }
        const projects = await this.Project.findAll({
            include: [
                { model: this.User, as: 'client', attributes: ['id', 'name', 'email'] },
                { model: this.Language, as: 'sourceLanguage', attributes: ['id', 'name'] },
                { model: this.Language, as: 'targetLanguage', attributes: ['id', 'name'] },
                { model: this.Specialization, as: 'specialization', attributes: ['id', 'name'] }
            ],
            where: whereCondition,
            limit: limitNum,
            offset,
            order: [['createdAt', 'DESC']]
        });
        const total = await this.Project.count({
            where: whereCondition
        });
        return{
            data: projects,
            pagination: {
                pageNum,
                limitNum,
                totalData: total,
                totalPage: Math.ceil(total/limitNum)
            }
        }
    }
    async createProject({clientId,title,description,sourceLanguageId,targetLanguageId,wordCount,specializationId,budget,durationDays,notes,fileData}){
        return await this.sequelize.transaction(async(t) => {
            if(sourceLanguageId === targetLanguageId){
                throw createError("Source and target language cannot be the same!",400);
            }
            const languages = await this.Language.findAll({where: {id: {[Op.in]: [sourceLanguageId,targetLanguageId]}}, transaction: t});
            if(languages.length !== 2){
                throw createError("Source or target language not found!",404);
            }
            const specialization = await this.Specialization.findByPk(specializationId,{transaction: t});
            if(!specialization){
                throw createError("Specialization not found!",404);
            }
            if(!fileData){
                throw createError("No file uploaded!",400);
            }
            const project = await this.Project.create({
                clientId,
                title,
                description,
                sourceLanguageId,
                targetLanguageId,
                wordCount,
                specializationId,
                budget,
                durationDays,
                status: "WAITING_PAYMENT"
            },{transaction: t});
            const projectDocument = await this.ProjectDocument.create({
                projectId: project.id,
                uploadedBy: clientId,
                type: "SOURCE",
                filePublicId: fileData.filePublicId,
                fileURL: fileData.fileURL,
                notes
            },{transaction: t});
            return {project,projectDocument}
        });
    }
    async approveCandidate({clientId,projectId,candidateId}){
        return await this.sequelize.transaction(async(t) => {
            const project = await this.Project.findByPk(projectId,{transaction: t});
            if(!project){
                throw createError("Project not found!",404);
            }
            if(project.clientId !== clientId){
                throw createError("Unauthorized",401);
            }
            if(project.status !== "OPEN"){
                throw createError("Project is not open!",400);
            }
            const candidate = await this.ProjectCandidate.findByPk(candidateId,{transaction: t});
            if(!candidate){
                throw createError("Project candidate not found!",404);
            }
            if(candidate.projectId !== Number(project.id)){
                throw createError("Invalid project candidate!",400);
            }
            if(candidate.status !== "PENDING" && candidate.status !== "ACCEPTED"){
                throw createError("Project candidate already processed!",400);
            }
            if(candidate.type === "APPLICATION"){
                await this.ProjectCandidate.update({status: "DECLINED"},{
                    where: {projectId,id: {[Op.ne]: candidate.id},status: "PENDING",type: "APPLICATION"},
                    transaction: t
                });
            }else if(candidate.type === "INVITATION"){
                await this.ProjectCandidate.update({status: "EXPIRED"}, {
                    where: {projectId,id: {[Op.ne]: candidate.id},status: "PENDING",type: "INVITATION"},
                    transaction: t
                });
                await this.ProjectCandidate.update({status: "DECLINED"},{
                    where: {projectId, id: {[Op.ne]: candidate.id},status: "ACCEPTED",type: "INVITATION"},
                    transaction: t
                });
            }
            candidate.status = "CONFIRMED";
            await candidate.save({transaction: t});
            const completionDays = addDays(new Date(),project.durationDays);
            project.completionDays = completionDays;
            project.translatorId = candidate.translatorId;
            project.status = "IN_PROGRESS"; 
            await project.save({transaction: t});
            return {project,candidate}
        });
    }
    async approveProject({projectId,clientId}){
        return await this.sequelize.transaction(async(t) => {
            const project = await this.Project.findByPk(projectId,{transaction: t});
            if(!project){
                throw createError("Project not found!",404);
            }
            if(project.status !== "WAITING_REVIEW"){
                throw createError("Project cant be approved!",400);
            }
            if(clientId !== Number(project.clientId)){
                throw createError("Unauthorized!",401);
            }
            project.status = "COMPLETED";
            await project.save({transaction: t});
            await this.paymentService.releasePayment({projectId,t})
            return {message: "Project approved & Payment released!"}
        })
    }
    async getProjectById(id){
        const project = await this.Project.findByPk(id,{
            include: [
                {model: this.User, as:'client', attributes:['id','name','email']},
                {model: this.Translator, as:'translator', include: [
                    {model: this.User, as: "user", attributes: ["id","name"]}
                ]},
                {model: this.Language, as:'sourceLanguage', attributes:['id','name']},
                {model: this.Language, as:'targetLanguage', attributes:['id','name']},
                {model: this.Specialization, as:'specialization', attributes:['id','name']},
                {model: this.ProjectDocument, as: "projectDocument"}
            ]
        });
        if(!project){
            throw createError("Project not found!",404);
        }
        return project;
    }
    async cancelProject(id,clientId){
        const project = await this.Project.findByPk(id);
        if(!project){
            throw createError("Project not found!",404);
        }
        if(project.status !== "WAITING_PAYMENT" && project.status !== "OPEN"){
            throw createError("Project cannot be cancelled!");
        }
        if(project.clientId !== clientId){
            throw createError("Project can only be cancelled by the owner of the project!",401);
        }
        project.status = "CANCELLED";
        await project.save();
        return {message: "Project has been successfully cancelled!"}
    }

}

module.exports = ProjectService;