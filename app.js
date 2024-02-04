const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js")             // required schema JOI for server side validarion
const Review = require("./models/review.js")

// router required for listing
const listings = require("./routes/listing.js");



const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
main().then(() => {
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
})
async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));



// Method for validate review using JOI (server side)
const validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,result.error);
    } else {
        next();
    }
};

app.use("/listings", listings)


//Reviews 
//POST review Route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

//Delete Review route
app.delete(("/listings/:id/reviews/:reviewId"),wrapAsync(async(req,res) =>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});   // take out(pull) reviewId from reviews for that id
    await Review.findByIdAndDelete(reviewId);  // as this line execute, review get deletes

    res.redirect(`/listings/${id}`)
}));




// app.get("/testListing", (req,res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });

//     sampleListing.save().then((res) => {
//         console.log(res);
//     }).catch((err) => {
//         console.log(err);
//     });

//     console.log("Sample was saved");
//     res.send("successful testing");
// });

app.all("*", (req,res,next) => {
    next(new ExpressError(404, "Page not found"));
});

//Middlewares
app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something went wrong"} = err;
    res.status(statusCode).render("error.ejs", {message});
    //res.status(statusCode).send(message);
});

app.get("/", (req,res) => {
    res.send("root");
});
app.listen(3000, () => {
    console.log("server is listening on port 8080")
});