const Review = require("../models/review.js");
const Listing = require("../models/listing.js");


// POST route controller
module.exports.createReview = async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created");

    res.redirect(`/listings/${listing._id}`);
}

// DELETE route controller
module.exports.destroyReview = async(req,res) =>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});   // take out(pull) reviewId from reviews for that id
    await Review.findByIdAndDelete(reviewId);  // as this line execute, review get deletes

    req.flash("success", "Review Deleted");

    res.redirect(`/listings/${id}`)
}