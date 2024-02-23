const express = require("express");
const router = express.Router({mergeParams: true});  // creates new router obj // mergeParams is for post review route , for recieving id of listing from app.use reviews

const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js")


//Reviews 
//POST review Route
router.post("/",isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//Delete Review route
router.delete(("/:reviewId"), isLoggedIn , isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports = router;              // exporting review routes to app.js