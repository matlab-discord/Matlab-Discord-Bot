% Script that handles the binary option needed when saving.
% assumes there is a variable called `user_work_file` in the workspace that points to the save location
save('-mat7-binary', user_work_file)
%'^(?!(user_work_file)$).'