const express = require("express");
const router = express.Router();             // creating new router object

const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js")
const{isLoggedIn, isOwner, validateListing} = require("../middleware.js")







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
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");   // populate for showing data of particular listing on screen for review tab and owner
    if(!listing){
        req.flash("success", "Listing you requested for does not exist! ")
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
router.get("/:id/edit",isLoggedIn, isOwner , wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist! ")
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {listing})
}));

//Update Route
router.put("/:id",isLoggedIn, isOwner ,validateListing, wrapAsync(async (req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id",isLoggedIn, isOwner ,wrapAsync(async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings")
}));

module.exports = router;          // exporting listing routes to app.js
