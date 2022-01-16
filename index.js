"use strict";
require('dotenv').config();
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { initCronJobs } = require('./src/cronjobs');
require('./deploy-commands');

/*
Set bot intents.
 */
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES);

const client = new Client({ partials: ['CHANNEL'], intents: myIntents });

/*
Import in bot commands
 */
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

/*
Import in bot events
 */
const eventFiles = fs.readdirSync('./events').filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
        client.on(event.name, async (...args) => await event.execute(client, ...args));
    }
}

/*
Save bot channel ids
 */
client.help_channel_ids = JSON.parse(process.env.HELP_CHANNEL_IDS);
client.help_channel_names = JSON.parse(process.env.HELP_CHANNEL_NAMES);
client.help_channel_timers = Array(client.help_channel_ids.length).fill(null);

const clientCronJobs = () => initCronJobs(client);

client.login(process.env.BOT_TOKEN).then(clientCronJobs);

// // Define some universal constants
// const lengthMaxBotMessages = 1000; // max message length

// /*
//  * Router for all commands detected via regexp.
//  */
// const router = [
// 	{
// 		regexp: /^!run[\s`]/,
// 		use: function(msg, tokens) {
// 		  if(msg.guild === null) {
// 	              msg.channel.send("Use of in chat MATLAB is not allowed in DM's.  Please visit the main channel.");
// 	              return;
// 	          }
// 		}
// 	}, {

//         // Will take the last posted message and run any code found within a code block (wrapped in backticks ```)
//         regexp: /^!eval(?:uate)?$/,
//         use: function(msg) {
//             // Define the number of messages the eval call will search back
//             const MSG_SEARCH_LIM = 10;
//             msg.channel.fetchMessages({limit: MSG_SEARCH_LIM+1}) // +1 because we account for the message that called the eval...
//             .then(msgMap => {
//                 let _old_msgs = Array.from(msgMap.values());

//                 // Remove the first message (this is the message that called the eval)
//                 _old_msgs.splice(0,1);

//                 // Loop through the messages from newest to oldest, find a valid code block
//                 for(var i = 0; i < _old_msgs.length; i++) {

//                     let codeMsg = _old_msgs[i]; // check the message
//                     let codeSearchRegexp = /```(?:matlab)?(?:\nmatlab)?((\w|\s|\S)*)(?:```)/; // regexp to parse user code between code blocks
//                     let codeSearchTokens = codeMsg.content.match(codeSearchRegexp);
//                     // Couldn't find a match.  move onto the next message (if there is one) or break out with error message
//                     if(codeSearchTokens == null) { // couldn't find a match
//                         if(i == _old_msgs.length-1) { // end of loop
//                             msg.channel.send("Message doesn't contain a valid code formatting block. (Wrapped in \`\`\`)");
//                             return;
//                         }
//                         continue;
//                     }
//                     let codeToRun = codeSearchTokens[1];
//                     let run_command = util.format("!run```matlab\n%s```", codeToRun);
//                     // Run the code, then delete message immediately
//                     msg.channel.send(run_command).then(msg => msg.delete(20).catch(console.error));
//                     break; // break out of the loop since we found a valid message
//                 }
//             })
//             .catch(err => console.error(err));
//         }
//     },

// 	{
//     // Inchat octave (remove h for octhelp message)
//     regexp: /^!((?:oct(?=[^h]))|(?:opr)|(?:oup)|(?:orun))/,
//     use: function (msg, tokens) {

//         // Don't allow the use of this function in DM's
//         // if((msg.guild === null) && (msg.author.id != process.env.OWNER_ID)) {
//         if(msg.guild === null) {
//             msg.channel.send("Use of all Octave functions are not allowed in DM's.  Please visit the main channel.");
//             return;
//         }

//         // Figure out the workspace filename for this user
//         var user_id = util.format('%s#%d', msg.author.username, msg.author.discriminator);
//         var user_work_file  = util.format('%s/%s.mat', ic_octave_workspaces, user_id);

//         // Grab the octave operation that the user called
//         var operation = tokens[1];

//         // Control switch for different inchat octave operations
//         switch(operation) {

//             // Typical command.  Run/compute user code
//             case "oct":
//             case "octave":
//             case "orun":
//                 var oct_call_regexp = /!o\w+\s*(?:```matlab)?((?:[\s\S.])*[^`])(?:```)?$/;
//                 var oct_call_tokens = msg.content.match(oct_call_regexp);

//                 // Grab the users commands
//                 var code = oct_call_tokens[1];

//                 // Check for illegal command usage and warn against it...
//                 var found_illegal_match = code.match(illegal_use_regexp);
//                 if(found_illegal_match) {
//                     msg.channel.send("Someone was being naughty <@" + process.env.OWNER_ID + ">");
//                     return;
//                 }

//                 // Write the users code command to a file. continue execution if it works
//                 fs.writeFile(ic_octave_user_code, code, function(err) {

//                     // Check for a file write error
//                     if(err) {
//                         console.log('--------- FILE WRITE ERROR ----------------');
//                         console.log(err);
//                         msg.channel.send('Something went wrong. <@' + process.env.OWNER_ID + '>');
//                         return;
//                     }

//                     // Format system call for octave CLI
//                     var cmd_format = util.format(`addpath('%s'); bot_runner('%s', '%s')`, ic_octave_folder, ic_octave_out_file, user_work_file);
//                     var octave_call = util.format('octave --no-gui --eval "%s"', cmd_format);

//                     // Call async system octave call with a timeout.  error if it exceeds
//                     exec(octave_call, {timeout: ic_octave_timeout}, function(err, stdout, stderr) {
//                         if(err) { // if there was an error
//                             console.log(err); // log the error
//                             msg.channel.send("Your command timed out.");
//                         } else { // Read the output file
//                             fs.readFile(ic_octave_out_file, 'utf8', function(err, data) {
//                                 if (err) {
//                                     console.log('--------- FILE READ ERROR ----------------')
//                                     console.log(err);
//                                     console.log(ic_octave_out_file);
//                                     msg.channel.send('Something went wrong. <@' + process.env.OWNER_ID + '>');
//                                 } else { // Send the output file message

//                                     // Make sure it doesn't exceed the max message length before sending
//                                     var msg_out = util.format("```matlab\n%s```", data);
//                                     if(msg_out.length >= lengthMaxBotMessages) {
//                                         msg.channel.send("Command executed, but output is too long to display.");
//                                     } else {
//                                         if(operation === 'orun') { // special case to post non formatted
//                                             msg.channel.send(util.format("%s",data));
//                                         }
//                                         else {
//                                             msg.channel.send(util.format("```matlab\n%s```",data));
//                                         }
//                                     }
//                                 }
//                             });
//                         }
//                     });
//                 });
//                 break;

//             // Octave Print.  Print the current users graphic figure saved in the workspace to chat
//             case "opr":
//             case "oprint":
//             case "octaveprint":

//                 var cmd_format = util.format(`addpath('%s'); print_user_gcf('%s', '%s')`, ic_octave_folder, user_work_file, ic_octave_printout);
//                 var octave_call = util.format('octave --no-gui --eval "%s"', cmd_format);

//                 // Call async system octave call with a timeout.  error if it exceeds
//                 exec(octave_call, {timeout: 20000}, function(err, stdout, stderr) {
//                     if(err) { // if there was an error
//                         console.log(err); // log the error
//                         msg.channel.send("You don't have a graphics figure generated.");
//                     } else { // Read the output file
//                         msg.channel.send('', {files: [ic_octave_printout]});
//                     }
//                 });
//                 break;

//             // Octave upload.  Upload attached image to users workspace
//             case "oup":
//             case "oupload":
//             case "octaveupload":
//                 // Check if there were any attachments with this message
//                 if(msg.attachments.size == 0) {
//                     msg.channel.send("Nothing was uploaded.");
//                     return;
//                 }

//                 // Valid image type extensions
//                 var valid_filetypes_regexp = /.*\.((?:mat)|(?:png)|(?:jpe?g)|(?:gif)|(?:tif{1,2}))/;

//                 // Grab the message attachment
//                 var msg_attachment = msg.attachments.values().next().value;

//                 // Get the attachment filetype this user uploaded
//                 var attachment_filetype = msg_attachment.filename.match(valid_filetypes_regexp);

//                 // Check if the uploaded attachment is a valid image type
//                 if(attachment_filetype === null) {
//                     msg.channel.send("Invalid image type. Can't upload.");
//                     return;
//                 }
//                 switch(attachment_filetype[1]) {
//                     case "mat":
//                             filetype = "data";
//                         break;

//                     default:
//                             filetype = "image";
//                         break;
//                 }

//                 // Grab the variable name for the image uplaod
//                 var upload_filename = util.format('%s/user_upload.%s', ic_octave_folder, attachment_filetype[1]);

//                 // Download the image from discord URL, then read into octave and save to the users workspace
//                 download(msg_attachment.url, upload_filename, function(){
//                     var out_msg;
//                     switch(filetype) {
//                         case "data":
//                             var cmd_format = util.format(`addpath('%s'); load_user_data('%s', '%s')`, ic_octave_folder, user_work_file, upload_filename);
//                             out_msg = "Data uploaded to your workspace.";
//                             break;

//                         case "image":
//                             var cmd_format = util.format(`addpath('%s'); load_user_img('%s', '%s')`, ic_octave_folder, user_work_file, upload_filename);
//                             out_msg = "Image saved to your workspace as variable `img`.";
//                             break;
//                     }
//                     // var cmd_format = util.format(`addpath('%s'); load_user_img('%s', '%s')`, ic_octave_folder, user_work_file, upload_filename);
//                     var octave_call = util.format('octave --no-gui --eval "%s"', cmd_format);

//                     // Call async system octave call with a timeout.  error if it exceeds
//                     exec(octave_call, {timeout: 20000}, function(err, stdout, stderr) {
//                         if(err) { // if there was an error
//                             console.log(err); // log the error
//                             msg.channel.send('Something went wrong. <@' + process.env.OWNER_ID + '>');
//                         } else { // Read the output file
//                             msg.channel.send(out_msg);
//                         }
//                     });
//                 });
//                 break;

//             default:
//                 //nothing
//                 break;
//         }

//     } // end function
// }, {
//     regexp: /!(m|doc) (.+?)(\s.*)?$/, // E.g. if "!m interp1" or "!doc interp1"
//     use: function (msg, tokens) {
//         const query = tokens[2].trim();
//         searchDocs(query)
//             .then((result) => {
//                 result.toolbox = (result.product.toLowerCase() !== 'matlab') ? ` from ${result.product}` : '';
//                 render(msg, 'doc.md', {result, query});
//             })
//             .catch((error) => {
//                 if (error) {
//                     render(msg, 'doc_error.md', {error, query});
//                 }
//             });
//     }
// }, {
// 	regexp: /((''')|('''matlab))[\S\s.]*'''/,
// 	use: function(msg) {
// 		var opts = {files: ['./img/backtick_highlight.png']};
//         	render(msg, 'code.md', {query: 'code'}, opts, false);
// 	}
// {
//     regexp: /!cronjob/,
//     use: function (msg) {
//         let result = [];
//         for (let cronjob of cronjobs) {
//             let hours = Math.round((new Date() - cronjob.last_checked) / (3600 * 1e3) * 100) / 100;
//             let interval = Math.round(cronjob.interval / (3600 * 1e3) * 100) / 100;
//             result.push(`${cronjob.name} : Last checked: ${hours} hours ago, Interval: ${interval} hours, Errors: ${cronjob.errors.length}`);
//         }
//         result = result.join('\n\n');
//         render(msg, 'cronjobs.md', {result});
//     }
// }, {
//     regexp: /^!(done|close|finish|answered|exit)/, // allow users to clear the busy status of help channels
//     use: function(msg) {

//         // check if the channel is a help channel first
//         if(help_channel_ids.includes(msg.channel.id)) {
//             var chan = msg.channel;
//             var chan_ind = help_channel_ids.indexOf(chan.id);

//             // If the help channel is busy, clear its busy status
//             if(help_channel_timers[chan_ind] != null) {
//                 clearTimeout(help_channel_timers[chan_ind]);
//                 help_channel_timers[chan_ind] = null;
//                 chan.setName(help_channel_names[chan_ind]);
//                 msg.channel.send("Channel is available for another question.")
//                 msg.delete(20).catch(console.error);
//             }
//             else {
//                 // The user executed the command in a question channel that isn't busy
//                 msg.channel.send("Channel is available for another question.")
//                 msg.delete(20).catch(console.error);
//             }

//         }
//         else {
//             msg.channel.send("Use this command in a help-channel to clear its busy status once a question is complete.")
//         }
//     }
// }, {
//     regexp: /^!(.+?)( .*)?$/, // E.g. any other message, pass-through (like help.md => "!help", "!help interp1", ...)
//     use: function (msg, tokens) {
//         const command = tokens[1];

//         // For an extra layer of configurability, some pass-through messages can have options (dont delete message, add file)
//         var opts = {};
//         var delete_msg = true;
//         switch(command)  {
//             case 'code':
//                 // Send keyboard image with code command
//                 opts = {files: ['./img/backtick_highlight.png']};
//                 break;

//             case 'jobs':
//             case 'help':
//             case 'mathelp':
//             case 'octhelp':
//                 // Preferablly keep the message on to see who is looking at jobs
//                 delete_msg = false;
//             default:
//                 // do nothing
//         } // end switch

//         // Render the message with arguments
//         render(msg, command + '.md', {query: command}, opts, delete_msg);
//     }
// }
// }];
