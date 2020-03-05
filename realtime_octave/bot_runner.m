function bot_runner(out_file, user_work_file)

    % Inputs
    % out_file -- full file path to the output diary text file
    % user_work_fille -- full file path to the users .mat workspace

    % Clear the diary if it exists already
    if exist(out_file, 'file')
        delete(out_file); 
    end

    % Load the workspace file if it exists
    if(exist(user_work_file, 'file'))
        load(user_work_file);
    end

    % start diary and try user code
    diary(out_file);
    try
        % Run the users code. Stored as a script file
        user_code;
        % Record the users graphic handle
        usergcf = hdl2struct(gcf);
        % Save their data to a workspace
        save_workspace;
    catch e % caught an error. display the error
        disp(e.message);
    end

    % Turn off the diary
    diary('off');

    % Check if anything was written to the diary.  Put a default message if not
    file_obj = dir(out_file);
    if(file_obj.bytes == 0)
        diary(out_file);
        disp('Command executed');
        diary('off');
    end

end