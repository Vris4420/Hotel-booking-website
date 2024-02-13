const express = require("express");
const router = express.Router();             // creating new router object

const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../schema.js")             // required schema JOI for server side validarion
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js")



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
router.get("/new", (req,res) => {
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");   // populate for showing data on screen for review tab
    res.render("listings/show.ejs", {listing});
}));

//Create Route
router.post("/",validateListing, wrapAsync(async (req,res,next) => {
   // let {title, description, image, price, country, location} = req.body;
   // let listing = req.body.listing;

    //    if(!req.body.listing) {
    //     throw new ExpressError(400, "Send valid data for listing");
    //    }
    
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
}));

//Edit Route
router.get("/:id/edit", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing})
}));

//Update Route
router.put("/:id",validateListing, wrapAsync(async (req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", "Listing Updated");
    res.redirect("/listings");
}));

//Delete Route
router.delete("/:id",wrapAsync(async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings")
}));

module.exports = router;          // exporting listing routes to app.js
