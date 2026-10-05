const { Op } = require("sequelize");

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
            limitNum,
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
}

module.exports = PaymentService;