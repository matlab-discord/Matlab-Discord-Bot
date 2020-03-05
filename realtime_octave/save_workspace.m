% Script that handles the binary option needed when saving.
% assumes there is a variable called `user_work_file` in the workspace that points to the save location
save('-binary', user_work_file)