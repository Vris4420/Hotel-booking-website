
module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.flash("success", "You must be logged in to create listing!");
        return res.redirect("/login")
    }
    next();
}