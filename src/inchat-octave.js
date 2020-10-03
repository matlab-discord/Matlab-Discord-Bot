let fs = require('fs');

// Function to clear out workspace `.mat` files 
async function clearWorkspaces() {
    // Directory location for the workspace files
    let workspace_location = './inchat_octave/workspaces';

    // Read the directory and look through each file.
    fs.readdir(workspace_location, (err, files) => {
      if (err) throw err;

      // Filter out any file that doesn't have `.mat` in its name
      files.filter(name => {
        var regexp = new RegExp('\.mat');
        return regexp.test(name);
      }).forEach( file => { // Delete each file (unlink)
        // Remove each .mat file we found in the workspace
        fs.unlink(`${workspace_location}/${file}`, (err) => {
          if (err) throw err;
            console.log(`${workspace_location}/${file} removed`);
          });
      });
  });
}


// Export functionss
module.exports = {
  clearWorkspaces
}