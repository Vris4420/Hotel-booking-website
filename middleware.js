
module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;   // req.original has original id or address of listing , .redirectUrl is variable
        req.flash("success", "You must be logged in to create listing!");
        return res.redirect("/login")
    }
    next();
}

module.exports.saveRedirectUrl = (req,res,next) => {   // middleware for opening page after login like create new listing
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl; // as req.session gets reset due  to postcard so saved it on locals
    }
    next();
}