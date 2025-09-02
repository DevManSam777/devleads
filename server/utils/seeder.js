const mongoose = require('mongoose');
const Form = require('../models/Form');
const Setting = require('../models/Setting');
const formSeeds = require('../data/formSeeds');



// checks if the forms seeder has already run based on a setting in the DB.
async function hasSeederRun() {
  try {
     if (mongoose.connection.readyState !== 1) {
         console.warn('⚠️ hasSeederRun: Database not connected.');
         return false;
     }
    const seederRun = await Setting.findOne({ key: 'seeder_forms_run', scope: 'global' });
    return !!seederRun;
  } catch (error) {
    console.error('❌ Error checking seeder status:', error);
    return false;
  }
}

// marks the seeder as having been run globally by creating/updating a setting
async function markSeederRun() {
  try {
    if (mongoose.connection.readyState !== 1) {
        console.warn('⚠️ markSeederRun: Database not connected. Skipping.');
        return;
    }
    await Setting.findOneAndUpdate(
      { key: 'seeder_forms_run', scope: 'global' },
      { value: true, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
    console.log('✅ Seeder status marked as completed');
  } catch (error) {
    console.error('❌ Error marking seeder as run:', error);
  }
}

// performs the action of resetting the seeder status flag in the DB
async function performStatusReset() {
  try {
    if (mongoose.connection.readyState !== 1) {
         console.warn('⚠️ performStatusReset: Database not connected. Skipping.');
         return false;
    }
    const result = await Setting.deleteOne({ key: 'seeder_forms_run', scope: 'global' });
     if (result.deletedCount > 0) {
         console.log(`
---------------------------------------------
🔄 SEEDER STATUS RESET 🔄

The seeder flag has been removed.
---------------------------------------------`);
     } else {
         console.log(`
---------------------------------------------
🔄 SEEDER STATUS ALREADY RESET 🔄

The seeder flag was not found. No action needed.
---------------------------------------------`);
     }
    return true;
  } catch (error) {
    console.error('❌ Error resetting seeder status:', error);
    return false;
  }
}

// processes raw form seed data by creating Mongoose documents and extracting variables
function processFormSeeds() {
  if (!Array.isArray(formSeeds)) {
      console.error('FATAL ERROR: formSeeds is not an array or is not loaded.');
      return [];
  }
  return formSeeds.map(seed => {
    try {
        if (seed === null || typeof seed !== 'object') {
             console.warn('⚠️ Skipping invalid seed data:', seed);
             return null;
        }
        const formDoc = new Form(seed);
        // assuming extractVariables is a method on your Form model instance
        if (formDoc.extractVariables && typeof formDoc.extractVariables === 'function') {
           formDoc.extractVariables();
        }
        // convert to plain object. Use { virtuals: true } if extractVariables populates virtuals you need saved
        return formDoc.toObject({ virtuals: true });
    } catch (error) {
        console.error(`❌ Error processing seed for form "${seed ? seed.title || 'Unnamed' : 'Invalid Seed'}":`, error); // use title in log
        return null;
    }
  }).filter(seed => seed !== null);
}


// seeds forms only if they don't already exist based on a unique field (e.g., title) and isTemplate=true.
async function seedFormsIfNotExists() {
  console.log('🌱 Starting "insert if not exists" seeding process for form templates...');
   if (mongoose.connection.readyState !== 1) {
      console.error('❌ seedFormsIfNotExists: Database not connected. Cannot seed.');
      return;
   }

  const processedSeeds = processFormSeeds();

  if (!processedSeeds || processedSeeds.length === 0) {
      console.warn('⚠️ No processed form seeds found to insert/update.');
      return;
  }

  let insertedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const seed of processedSeeds) {
    // ensure the seed object includes isTemplate: true
    const seedWithTemplateFlag = { ...seed, isTemplate: true };

    // we must have a title or some unique identifier to query against for upsert
    // assuming 'title' is the intended unique key for templates
    if (!seedWithTemplateFlag.title) {
        console.error(`❌ Skipping seed due to missing title:`, seed);
        errorCount++;
        continue;
    }

    try {
      // use updateOne with upsert: true to achieve "insert if not exists" based on title
      const updateResult = await Form.updateOne(
        { title: seedWithTemplateFlag.title, isTemplate: true },
        { $setOnInsert: seedWithTemplateFlag },
        { upsert: true }
      );

      if (updateResult.upsertedId) {
        insertedCount++;
      } else {
        skippedCount++;
      }

    } catch (error) {
      errorCount++;
      console.error(`❌ Error processing seed for form "${seedWithTemplateFlag.title || 'Unnamed Form'}":`, error);
    }
  }

  console.log(`✅ "Insert if not exists" seeding process completed.`);
  console.log(`   - Inserted ${insertedCount} new form templates.`);
  console.log(`   - Skipped ${skippedCount} existing form templates (based on title).`);
  if (errorCount > 0) {
      console.error(`   - Encountered ${errorCount} errors during processing.`);
  }
}


// seeds the database with forms only if this is detected as the first run (flag is absent and no templates exist)
async function seedFormsIfFirstRun() {
  console.log('🚀 Running seedFormsIfFirstRun logic...');
   if (mongoose.connection.readyState !== 1) {
      console.error('❌ seedFormsIfFirstRun: Database not connected. Cannot run.');
      return false;
   }

  try {
    const alreadyRun = await hasSeederRun();

    if (alreadyRun) {
      console.log('ℹ️  Forms have been seeded in a previous run. Skipping automatic seeding on startup.');
      return false;
    }

    console.log('🚀 First run detected (seeder flag is absent). Checking if templates need to be created...');

    const existingCount = await Form.countDocuments({ isTemplate: true });

    if (existingCount > 0) {
      console.log(`ℹ️  Database already has ${existingCount} form templates. Marking as seeded and skipping insert.`);
      await markSeederRun();
      return false;
    }

    console.log('🌱 No templates found. Seeding all form templates for the first time...');

    const processedSeeds = processFormSeeds();

     if (!processedSeeds || processedSeeds.length === 0) {
         console.warn('⚠️ No processed form seeds found to insert during first run seeding.');
         await markSeederRun();
         return false;
     }

    await Form.insertMany(processedSeeds);

    console.log(`✅ Successfully seeded ${formSeeds.length} form templates for the first time`);

    await markSeederRun();

    return true;
  } catch (error) {
    console.error('❌ Error in seedFormsIfFirstRun:', error);
    return false;
  }
}

// force reseeds all form templates, removing existing ones first
async function forceReseed() {
  console.log('🔄 Running forceReseed logic...');
   if (mongoose.connection.readyState !== 1) {
      console.error('❌ forceReseed: Database not connected. Cannot run.');
      return false;
   }
  try {
    console.log('🔄 Force reseeding form templates (deleting existing and inserting seeds)...');

    const deleteResult = await Form.deleteMany({ isTemplate: true });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing form templates`);

    const processedSeeds = processFormSeeds();

     if (!processedSeeds || processedSeeds.length === 0) {
         console.warn('⚠️ No processed form seeds found to insert during force reseed.');
         await markSeederRun();
         return false;
     }

    await Form.insertMany(processedSeeds);

    console.log(`✅ Successfully reseeded ${formSeeds.length} form templates`);

    await markSeederRun();

    console.log(`
---------------------------------------------
📋 TEMPLATE FORMS HAVE BEEN RESET (Existing deleted, seeds re-inserted) 📋

To force a reseed again in the future:
Use the CLI command: npm run seed:force
---------------------------------------------`);

    return true;
  } catch (error) {
    console.error('❌ Error force reseeding forms:', error);
    return false;
  }
}

module.exports = {
  hasSeederRun,
  markSeederRun,
  performStatusReset,
  seedFormsIfNotExists,
  seedFormsIfFirstRun,
  forceReseed,
};