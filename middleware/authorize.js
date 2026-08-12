module.exports = (...allowroles) => {
    return(req,res,next) => {
        if(!req.user){
            return res.status(401).json({error: `Unauthenticated!`});
        }
        if(!req.user.roles.some(role => allowroles.includes(role))){
            return res.status(403).json({error: "Forbidden!"});
        }
        next();
    }
}