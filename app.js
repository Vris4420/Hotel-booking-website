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

//Index Route
app.get("/listings", wrapAsync(async (req,res) => {
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", {allListings});
}));

//New Listing
app.get("/listings/new", (req,res) => {
    res.render("listings/new.ejs");
});

//Show Route
app.get("/listing/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");   // populate for showing data on screen for review tab
    res.render("listings/show.ejs", {listing});
}));

//Create Route
app.post("/listings",validateListing, wrapAsync(async (req,res,next) => {
   // let {title, description, image, price, country, location} = req.body;
   // let listing = req.body.listing;

//    if(!req.body.listing) {
//     throw new ExpressError(400, "Send valid data for listing");
//    }
    
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing})
}));

//Update Route
app.put("/listings/:id",validateListing, wrapAsync(async (req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect("/listings");
}));

//Delete Route
app.delete("/listings/:id",wrapAsync(async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings")
}));

//Reviews 
//POST Route
app.post("/listing/:id/reviews", validateReview, wrapAsync(async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listing/${listing._id}`);
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