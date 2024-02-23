const express = require("express");
const router = express.Router({mergeParams: true});  // creates new router obj // mergeParams is for post review route , for recieving id of listing from app.use reviews

const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview} = require("../middleware.js");


//Reviews 
//POST review Route
router.post("/", validateReview, wrapAsync(async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created");

    res.redirect(`/listings/${listing._id}`);
}));

//Delete Review route
router.delete(("/:reviewId"),wrapAsync(async(req,res) =>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});   // take out(pull) reviewId from reviews for that id
    await Review.findByIdAndDelete(reviewId);  // as this line execute, review get deletes

    req.flash("success", "Review Deleted");

    res.redirect(`/listings/${id}`)
}));

module.exports = router;              // exporting review routes to app.js