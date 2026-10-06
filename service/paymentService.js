const { Op } = require("sequelize");
const createError = require('../utils/createError');

class PaymentService{
    constructor({Payment,Project,User,sequelize}){
        this.Payment = Payment;
        this.Project = Project;
        this.User = User;
        this.sequelize = sequelize
    }
    async getPayments({page,limit,search}){
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 10;
        const offset = (pageNum - 1) * limitNum;
        const payments = await this.Payment.findAll({
            include: [
                {model:this.Project,as:'project',where: search ? {title:{[Op.iLike]: `%${search}%`}} : undefined},
                {model:this.User,as:'verifier',attributes:['id','name','email']}
            ],
            limit: limitNum,
            offset
        });
        const total = await this.Payment.count({
            include: [
                {model:this.Project,as:'project',where: search ? {title:{[Op.iLike]: `%${search}%`}} : undefined}
            ],
        });
        return{
            data: payments,
            pagination: {
                pageNum,
                limitNum,
                totalData: total,
                totalPage: Math.ceil(total/limitNum)
            }
        }
    }
    async getPaymentById(id){
        const payment = await this.Payment.findByPk(id,{
            include: [
                {model: this.Project, as: "project"},
                {model: this.User, as: "verifier", attributes: ["id","name","email"]}
            ]
        });
        if(!payment){
            throw createError("Payment not found!",404);
        }
        return payment;
    }
    async createPayment({projectId,fileData,clientId}){
        if(!fileData){
            throw createError("Proof of payment required!",400);
        }
        const project = await this.Project.findByPk(projectId,{
            include: [
                {model: this.Payment, as:"payment"}
            ]
        });
        if(!project){
            throw createError("Project not found!",404);
        }
        if(project.status !== "WAITING_PAYMENT"){
            throw createError("Project already paid!",400);
        }
        if(project.clientId !== clientId){
            throw createError("Unauthorized!",401)
        }
        if(project.payment){
            throw createError("Payment already created, waiting review!",400);
        }
        const payment = await this.Payment.create({
            projectId,
            amount: Number(project.budget),
            proofURL: fileData,
            status: "PENDING"
        });
        return payment;
    }
    async verifyPayment({id,adminId}){
        return await this.sequelize.transaction(async(t) => {
            const payment = await this.Payment.findByPk(id,{
                include: [{model: this.Project, as: "project"}],
                transaction: t
            });
            if(!payment){
                throw createError("Payment not found!",404);
            }
            if(payment.status !== "PENDING"){
                throw createError("Payment already processed",400);
            }
            if(!payment.project){
                throw createError("Project not found!",404);
            }
            if(payment.project.status !== "WAITING_PAYMENT"){
                throw createError("Project is not in waiting payment status!",400);
            }
            payment.status = "VERIFIED";
            payment.verifiedBy = adminId;
            await payment.save({transaction: t});
            payment.project.status = "OPEN";
            await payment.project.save({transaction: t});
            return {payment,project:payment.project}
        })
    }
    async releasePayment({projectId,t}){
        const project = await this.Project.findByPk(projectId,{
            include: [
                {model: this.Payment, as: "payment"}
            ],
            transaction: t
        });
        if(!project){
            throw createError("Project not found!",404);
        }
        if(project.status !== "COMPLETED"){
            throw createError("Project has not been completed!",400);
        }
        if(!project.payment){
            throw createError("Project payment not found!",404)
        }
        if(project.payment.status !== "RELEASED"){
            throw createError("Project payment already released!",400);
        }
        if(project.payment.status !== "VERIFIED"){
            throw createError("Project payment isnt verified!",400);
        }
        project.payment.status = "RELEASED";
        await project.payment.save({transaction: t});
        return project.payment;
    }
}

module.exports = PaymentService;