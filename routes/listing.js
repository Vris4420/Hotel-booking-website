const express = require("express");
const router = express.Router();             // creating new router object

const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../schema.js")             // required schema JOI for server side validarion
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js")
const{isLoggedIn} = require("../middleware.js")




// Method for validate listing using JOI (server side)
const validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,result.error);
    } else {
        next();
    }
};


//Index Route
router.get("/", wrapAsync(async (req,res) => {
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", {allListings});
}));

//New Listing
router.get("/new",isLoggedIn, (req,res) => {
   
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");   // populate for showing data of particular listing on screen for review tab and owner
    if(!listing){
        req.flash("error", "Listing you requested for does not exist! ")
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
}));

//Create Route
router.post("/",isLoggedIn,validateListing, wrapAsync(async (req,res,next) => {
    
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // id of current user stored by passport
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
}));

//Edit Route
router.get("/:id/edit",isLoggedIn, wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist! ")
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {listing})
}));

//Update Route
router.put("/:id",isLoggedIn,validateListing, wrapAsync(async (req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", "Listing Updated");
    res.redirect("/listings");
}));

//Delete Route
router.delete("/:id",isLoggedIn,wrapAsync(async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings")
}));

module.exports = router;          // exporting listing routes to app.js
