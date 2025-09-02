require('dotenv').config({ path: '../.env' }); 

const mongoose = require('mongoose');
const seederLogic = require('../utils/seeder');
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in your .env file!');
  console.error('Expected .env location relative to this script:', '../.env');
  // since this is the entry point script, we must exit if MONGO_URI is missing
  process.exit(1);
}

// main function to run the seeder tasks based on command line flags
async function runSeederTasks() {
    console.log('Executing seeder tasks...');

    // ensure DB connection for this task
    if (mongoose.connection.readyState !== 1) { // 1 means connected
        try {
          console.log('Connecting to MongoDB...');
          await mongoose.connect(MONGO_URI); 
          console.log('Connected to MongoDB');
      } catch (error) {
          console.error('FATAL ERROR: Failed to connect to MongoDB:', error);
          process.exit(1); // exit if connection fails
      }
    } else {
        console.log('ℹ️ MongoDB already connected.');
    }

    try {
      // check for flags passed via command line (e.g., npm run seed:reset --force)
      const forceFlag = process.argv.includes('--force');
      // the `--reset-status` flag is used by the `npm run seed:reset` command in package.json
      const resetStatusFlag = process.argv.includes('--reset-status');

      // determine which action to perform based on flags
      if (forceFlag) {
        // Handle `npm run seed:force`: delete all templates, then insert seeds, mark seeded
        console.log('Detected --force flag. Running force reseed...');
        // call the function from utils/seeder.js via the imported object
        await seederLogic.forceReseed();

      } else if (resetStatusFlag) {
        // handle `npm run seed:reset`: Insert missing seeds but keep existing, and reset status flag.
        console.log('Detected --reset-status flag (from npm run seed:reset).');
        console.log('Action: Performing "insert if not exists" seeding and resetting seeder status...');
        // call the new function from utils/seeder.js via the imported object
        await seederLogic.seedFormsIfNotExists();
        // call the flag reset function from utils/seeder.js via the imported object
        await seederLogic.performStatusReset();

      } else {
        // default action when no specific flags are passed
        // this block would run if you just did `node scripts/seed.js` with no flags.
        console.log('No specific flags detected. No seeder task specified for direct execution.');
        console.log('Available flags: --force, --reset-status');
        // we still need to exit gracefully after printing options
         process.exit(0);
      }

    } catch (error) {
      console.error('❌ Seeder tasks execution error:', error);
      process.exit(1); // Exit on seeder logic error
    } finally {
      // disconnect when done, since this script initiated the connection
       if (mongoose.connection.readyState === 1) { // only disconnect if connected
          await mongoose.disconnect();
          console.log('Disconnected from MongoDB');
       }
    }
}

// execute the main tasks function only if this script is run directly from the command line
// this check prevents the tasks from running automatically if this script is required by another file
if (require.main === module) {
    runSeederTasks(); // start the main process
} else {
    console.log("scripts/seed.js initialized as a module. It should typically be run directly.");
}

// this script does not need to export anything as it's purely a command-line entry point.
// actual seeder logic functions are exported from ../utils/seeder.js.