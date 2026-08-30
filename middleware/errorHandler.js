module.exports = (err,req,res,next) => {
    console.error("ERROR LOG:", err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: statusCode >= 500 ? "Error": "Failed",
        message: err.message || "Internal server error"
    })
}