const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const request = require('request');

const lengthMaxBotMessages = 1000; // max message length

// Define the path variables for inchat octave
const ic_octave_folder = './inchat_octave';
const ic_octave_workspaces = util.format('%s/workspaces', ic_octave_folder);
const ic_octave_out_file = util.format('%s/bot_out.txt', ic_octave_folder);
const ic_octave_user_code = util.format('%s/user_code.m', ic_octave_folder);
const ic_octave_printout = util.format('%s/user_printout.png', ic_octave_folder);
const ic_octave_timeout = 5000; // time in ms

// Load in illegal use functions for inchat octave and compile them as a regexp
const illegal_read = fs.readFileSync(util.format('%s/illegal_phrases', ic_octave_folder), 'utf8');
const illegal_use_regexp = new RegExp(`(${illegal_read.replace(/\n/g, ')|(')})`);

const download = function (uri, filename, callback) {
    request.head(uri, (err, res, body) => {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

function octaveRun(msg, operation) {
    // Figure out the workspace filename for this user
    const user_id = `${msg.author.username}#${msg.author.discriminator}`;
    const user_work_file = `${ic_octave_workspaces}/${user_id}.mat`;

    const oct_call_regexp = /!o\w+\s*(?:```matlab)?([\s\S.]*[^`])(?:```)?$/;
    const oct_call_tokens = msg.content.match(oct_call_regexp);

    // Grab the users commands
    const code = oct_call_tokens[1];

    // Check for illegal command usage and warn against it...
    const found_illegal_match = code.match(illegal_use_regexp);
    if (found_illegal_match) {
        msg.channel.send(`Someone was being naughty <@${process.env.OWNER_ID}>`);
        return;
    }

    // Write the users code command to a file. continue execution if it works
    fs.writeFile(ic_octave_user_code, code, (err) => {
    // Check for a file write error
        if (err) {
            console.log('--------- FILE WRITE ERROR ----------------');
            console.log(err);
            msg.channel.send(`Something went wrong. <@${process.env.OWNER_ID}>`);
            return;
        }

        // Format system call for octave CLI
        const cmd_format = util.format('addpath(\'%s\'); bot_runner(\'%s\', \'%s\')', ic_octave_folder, ic_octave_out_file, user_work_file);
        const octave_call = util.format('octave --no-gui --eval "%s"', cmd_format);

        // Call async system octave call with a timeout.  error if it exceeds
        exec(octave_call, { timeout: ic_octave_timeout }, (err, stdout, stderr) => {
            if (err) { // if there was an error
                console.log(err); // log the error
                msg.channel.send('Your command timed out.');
            } else { // Read the output file
                fs.readFile(ic_octave_out_file, 'utf8', (err, data) => {
                    if (err) {
                        console.log('--------- FILE READ ERROR ----------------');
                        console.log(err);
                        console.log(ic_octave_out_file);
                        msg.channel.send(`Something went wrong. <@${process.env.OWNER_ID}>`);
                    } else { // Send the output file message
                        // Make sure it doesn't exceed the max message length before sending
                        const msg_out = util.format('```matlab\n%s```', data);
                        if (msg_out.length >= lengthMaxBotMessages) {
                            msg.channel.send('Command executed, but output is too long to display.');
                        } else if (operation === 'orun') { // special case to post non formatted
                            msg.channel.send(util.format('%s', data));
                        } else {
                            msg.channel.send(util.format('```matlab\n%s```', data));
                        }
                    }
                });
            }
        });
    });
}

function octavePrint(msg) {
    // Figure out the workspace filename for this user
    const user_id = `${msg.author.username}#${msg.author.discriminator}`;
    const user_work_file = `${ic_octave_workspaces}/${user_id}.mat`;

    const cmd_format = util.format('addpath(\'%s\'); print_user_gcf(\'%s\', \'%s\')', ic_octave_folder, user_work_file, ic_octave_printout);
    const octave_call = util.format('octave --no-gui --eval "%s"', cmd_format);

    // Call async system octave call with a timeout.  error if it exceeds
    exec(octave_call, { timeout: 20000 }, (err, stdout, stderr) => {
        if (err) { // if there was an error
            console.log(err); // log the error
            msg.channel.send('You don\'t have a graphics figure generated.');
        } else { // Read the output file
            msg.channel.send('', { files: [ic_octave_printout] });
        }
    });
}

function octaveUpload(msg) {
    // Figure out the workspace filename for this user
    const user_id = `${msg.author.username}#${msg.author.discriminator}`;
    const user_work_file = `${ic_octave_workspaces}/${user_id}.mat`;

    // Check if there were any attachments with this message
    if (msg.attachments.size === 0) {
        msg.channel.send('Nothing was uploaded.');
        return;
    }

    // Valid image type extensions
    const valid_filetypes_regexp = /.*\.(mat|png|jpe?g|gif|tif{1,2})/;

    // Grab the message attachment
    const msg_attachment = msg.attachments.values().next().value;

    // Get the attachment filetype this user uploaded
    const attachment_filetype = msg_attachment.filename.match(valid_filetypes_regexp);

    // Check if the uploaded attachment is a valid image type
    if (attachment_filetype === null) {
        msg.channel.send('Invalid image type. Can\'t upload.');
        return;
    }
    let filetype;
    switch (attachment_filetype[1]) {
    case 'mat':
        filetype = 'data';
        break;

    default:
        filetype = 'image';
        break;
    }

    // Grab the variable name for the image upload
    const upload_filename = util.format('%s/user_upload.%s', ic_octave_folder, attachment_filetype[1]);

    // Download the image from discord URL, then read into octave and save to the users workspace
    download(msg_attachment.url, upload_filename, () => {
        let out_msg;
        let cmd_format;
        switch (filetype) {
        case 'data':
            cmd_format = util.format('addpath(\'%s\'); load_user_data(\'%s\', \'%s\')', ic_octave_folder, user_work_file, upload_filename);
            out_msg = 'Data uploaded to your workspace.';
            break;

        case 'image':
            cmd_format = util.format('addpath(\'%s\'); load_user_img(\'%s\', \'%s\')', ic_octave_folder, user_work_file, upload_filename);
            out_msg = 'Image saved to your workspace as variable `img`.';
            break;
        }
        // var cmd_format = util.format(`addpath('%s'); load_user_img('%s', '%s')`, ic_octave_folder, user_work_file, upload_filename);
        const octave_call = util.format('octave --no-gui --eval "%s"', cmd_format);

        // Call async system octave call with a timeout.  error if it exceeds
        exec(octave_call, { timeout: 20000 }, (err, stdout, stderr) => {
            if (err) { // if there was an error
                console.log(err); // log the error
                msg.channel.send(`Something went wrong. <@${process.env.OWNER_ID}>`);
            } else { // Read the output file
                msg.channel.send(out_msg);
            }
        });
    });
}

function octaveExecute(msg, tokens) {
    // Don't allow the use of this function in DM's
    // if((msg.guild === null) && (msg.author.id != process.env.OWNER_ID)) {
    if (!msg.inGuild()) {
        msg.channel.send('Use of all Octave functions are not allowed in DM\'s.  Please visit the main channel.');
        return;
    }

    // Grab the octave operation that the user called
    const operation = tokens[1];

    // Control switch for different inchat octave operations
    switch (operation) {
    // Typical command.  Run/compute user code
    case 'oct':
    case 'octave':
    case 'orun':
        octaveRun(msg, operation);
        break;

        // Octave Print.  Print the current users graphic figure saved in the workspace to chat
    case 'opr':
    case 'oprint':
    case 'octaveprint':
        octavePrint(msg);
        break;

        // Octave upload.  Upload attached image to users workspace
    case 'oup':
    case 'oupload':
    case 'octaveupload':
        octaveUpload(msg);
        break;

    default:
        // nothing
        break;
    }
}

// Function to clear out workspace `.mat` files
async function clearWorkspaces() {
    // Directory location for the workspace files
    const workspace_location = './inchat_octave/workspaces';

    // Read the directory and look through each file.
    fs.readdir(workspace_location, (err, files) => {
        if (err) throw err;

        // Filter out any file that doesn't have `.mat` in its name
        files.filter((name) => {
            const regexp = new RegExp('\.mat');
            return regexp.test(name);
        }).forEach((file) => { // Delete each file (unlink)
            // Remove each .mat file we found in the workspace
            fs.unlink(`${workspace_location}/${file}`, (err) => {
                if (err) throw err;
                console.log(`${workspace_location}/${file} removed`);
            });
        });
    });
}

module.exports = {
    octaveExecute,
    clearWorkspaces,
};
