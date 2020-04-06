function print_user_gcf(user_work_file, printout_file)

    % Load the workspace file if it exists
    if(exist(user_work_file, 'file'))
        load_workspace;
    else
        % Just return if they dont have the work file already made...
        error('Can''t find user work space');
        return;
    end

    % Check if the user has a gcf in their workspace. print it if so
    if exist('usergcf', 'var')
        hand = struct2hdl(usergcf);
        saveas(hand, printout_file);
    else
        error('User doesn''t have a saved graphics handle.');

    end

end