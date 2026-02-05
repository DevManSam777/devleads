const Business = require("../models/Business");
const Hitlist = require("../models/Hitlist");

// get all businesses for a hitlist
exports.getBusinessesByHitlist = async (req, res) => {
  try {
    const businesses = await Business.find({
      hitlistId: req.params.hitlistId,
    }).sort({ lastModified: -1 });
    res.json(businesses);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// create business
exports.createBusiness = async (req, res) => {
  try {
    const business = new Business({
      ...req.body,
      hitlistId: req.params.hitlistId,
    });

    const savedBusiness = await business.save();

    // add business reference to hitlist and update the lastModified field
    await Hitlist.findByIdAndUpdate(req.params.hitlistId, {
      $push: { businesses: savedBusiness._id },
      $set: { lastModified: new Date() },
    });

    res.status(201).json(savedBusiness);
  } catch (error) {
    console.error("Error creating business:", error);
    res.status(400).json({ message: error.message });
  }
};

// Update business
exports.updateBusiness = async (req, res) => {
  try {
    // first, get the original business to ensure we have the correct hitlistId
    const originalBusiness = await Business.findById(req.params.id);
    if (!originalBusiness) {
      return res.status(404).json({ message: "Business not found" });
    }

    // store the hitlistId before updating the business
    const hitlistId = originalBusiness.hitlistId;

    // update the business
    const business = await Business.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    // update the lastModified field of the hitlist using the stored hitlistId
    await Hitlist.findByIdAndUpdate(hitlistId, {
      $set: { lastModified: new Date() },
    });

    res.json(business);
  } catch (error) {
    console.error("Error updating business:", error);
    res.status(400).json({ message: error.message });
  }
};

// move business to different hitlist
exports.moveBusiness = async (req, res) => {
  try {
    const { newHitlistId } = req.body;

    if (!newHitlistId) {
      return res.status(400).json({ message: "newHitlistId is required" });
    }

    // get the business
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // verify the new hitlist exists
    const newHitlist = await Hitlist.findById(newHitlistId);
    if (!newHitlist) {
      return res.status(404).json({ message: "Target hitlist not found" });
    }

    const oldHitlistId = business.hitlistId;

    // only move if moving to a different hitlist
    if (oldHitlistId.toString() === newHitlistId.toString()) {
      return res
        .status(400)
        .json({ message: "Business is already in this hitlist" });
    }

    // update the business with new hitlistId
    business.hitlistId = newHitlistId;
    const updatedBusiness = await business.save();

    // remove business reference from old hitlist
    await Hitlist.findByIdAndUpdate(oldHitlistId, {
      $pull: { businesses: req.params.id },
      $set: { lastModified: new Date() },
    });

    // add business reference to new hitlist
    await Hitlist.findByIdAndUpdate(newHitlistId, {
      $push: { businesses: req.params.id },
      $set: { lastModified: new Date() },
    });

    res.json(updatedBusiness);
  } catch (error) {
    console.error("Error moving business:", error);
    res.status(400).json({ message: error.message });
  }
};

// delete business
exports.deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // store the hitlistId before deleting the business
    const hitlistId = business.hitlistId;

    // remove business reference from hitlist
    await Hitlist.findByIdAndUpdate(hitlistId, {
      $pull: { businesses: req.params.id },
    });

    // update the lastModified field of the hitlist
    await Hitlist.findByIdAndUpdate(hitlistId, {
      $set: { lastModified: new Date() },
    });

    // delete the business
    await Business.deleteOne({ _id: req.params.id });

    res.json({ message: "Business deleted" });
  } catch (error) {
    console.error("Error deleting business:", error);
    res.status(500).json({ message: "Server Error" });
  }
};