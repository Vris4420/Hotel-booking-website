const Listing = require("./models/listing");
const { listingSchema, reviewSchema } = require("./schema.js")   // required schema JOI for server side validarion           // required schema JOI for server side validarion
const ExpressError = require("./utils/ExpressError.js");

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

module.exports.isOwner = async (req,res,next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);

    if(!listing.owner._id.equals(res.locals.currUser._id)){   // for authorization
        req.flash("success", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`)
    }
    next()
}

// Method for validate listing using JOI (server side)
module.exports.validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,result.error);
    } else {
        next();
    }
};

// Method for validate review using JOI (server side)
module.exports.validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,result.error);
    } else {
        next();
    }
};