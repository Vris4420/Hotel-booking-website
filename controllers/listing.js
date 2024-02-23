const Listing = require("../models/listing")

//index route controller
module.exports.index = async (req,res) => {       // .index variable
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", {allListings});
};

// new route controller
module.exports.renderNewForm = (req,res) => {
   
    res.render("listings/new.ejs");
}

// show route controller
module.exports.showListing = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");   // populate for showing data of particular listing on screen for review tab and owner
    if(!listing){
        req.flash("success", "Listing you requested for does not exist! ")
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
}

// create route controller
module.exports.createListing = async (req,res,next) => {
    
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // id of current user stored by passport
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
}

// Edit route controller
module.exports.renderEditForm = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist! ")
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {listing})
}

// Update route controller
module.exports.updateListing = async (req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
}

// Delete route controller
module.exports.destroyListing = async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings")
}