const Hitlist = require('../models/Hitlist');
const Business = require('../models/Business');
const mongoose = require('mongoose');

// get all hitlists
exports.getHitlists = async (req, res) => {
  try {
    // Use aggregation to get hitlists with business counts efficiently
    const hitlists = await Hitlist.aggregate([
      {
        $lookup: {
          from: 'businesses',
          localField: '_id',
          foreignField: 'hitlistId',
          as: 'businessCount'
        }
      },
      {
        $addFields: {
          businessCount: { $size: '$businessCount' }
        }
      },
      {
        $sort: { lastModified: -1 }
      }
    ]);
    
    res.json(hitlists);
  } catch (error) {
    console.error('Error fetching hitlists:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// get specific hitlist
exports.getHitlistById = async (req, res) => {
  try {
    const hitlistData = await Hitlist.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: 'businesses',
          localField: '_id',
          foreignField: 'hitlistId',
          as: 'businessCount'
        }
      },
      {
        $addFields: {
          businessCount: { $size: '$businessCount' }
        }
      }
    ]);

    if (!hitlistData || hitlistData.length === 0) {
      return res.status(404).json({ message: 'Hitlist not found' });
    }

    res.json(hitlistData[0]);
  } catch (error) {
    console.error('Error fetching hitlist:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// create new hitlist
exports.createHitlist = async (req, res) => {
  try {
    const hitlist = new Hitlist({
      ...req.body,
      lastModified: new Date()  // explicitly set lastModified on creation
    });
    const savedHitlist = await hitlist.save();
    res.status(201).json(savedHitlist);
  } catch (error) {
    console.error('Error creating hitlist:', error);
    res.status(400).json({ message: error.message });
  }
};

// update hitlist
exports.updateHitlist = async (req, res) => {
  try {
    // add lastModified to the update data
    const updateData = {
      ...req.body,
      lastModified: new Date() // ensure lastModified is updated
    };
    
    const hitlist = await Hitlist.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!hitlist) {
      return res.status(404).json({ message: 'Hitlist not found' });
    }
    res.json(hitlist);
  } catch (error) {
    console.error('Error updating hitlist:', error);
    res.status(400).json({ message: error.message });
  }
};

// delete hitlist
exports.deleteHitlist = async (req, res) => {
  try {
    const hitlist = await Hitlist.findById(req.params.id);
    if (!hitlist) {
      return res.status(404).json({ message: 'Hitlist not found' });
    }
    
    // delete all businesses associated with this hitlist
    await Business.deleteMany({ hitlistId: req.params.id });
    
    // delete the hitlist
    await Hitlist.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Hitlist and associated businesses deleted' });
  } catch (error) {
    console.error('Error deleting hitlist:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Utility function to fix hitlist business count inconsistencies
exports.fixHitlistBusinessCounts = async (req, res) => {
  try {
    console.log('🔧 Fixing hitlist business count inconsistencies...');
    
    const hitlists = await Hitlist.find();
    let fixedCount = 0;
    
    for (const hitlist of hitlists) {
      // Find all businesses that belong to this hitlist
      const businesses = await Business.find({ hitlistId: hitlist._id });
      
      // Get the business IDs that should be in the hitlist
      const businessIds = businesses.map(business => business._id);
      
      // Update the hitlist's businesses array if needed
      if (businessIds.length !== hitlist.businesses.length) {
        await Hitlist.findByIdAndUpdate(hitlist._id, {
          $set: { 
            businesses: businessIds,
            lastModified: new Date()
          }
        });
        
        console.log(`✅ Fixed ${hitlist.name}: ${hitlist.businesses.length} → ${businessIds.length} businesses`);
        fixedCount++;
      }
    }
    
    if (fixedCount === 0) {
      console.log('✅ All hitlist business counts are already correct!');
    } else {
      console.log(`✅ Fixed ${fixedCount} hitlists with incorrect business counts`);
    }
    
    res.json({ 
      success: true, 
      message: `Fixed ${fixedCount} hitlists with incorrect business counts`,
      fixed: fixedCount, 
      total: hitlists.length 
    });
    
  } catch (error) {
    console.error('❌ Error fixing hitlist business counts:', error);
    res.status(500).json({ message: 'Server Error fixing business counts' });
  }
};