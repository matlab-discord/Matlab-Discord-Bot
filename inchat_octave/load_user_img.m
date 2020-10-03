function load_user_img(user_work_file, image_file)

    try
        % Load the workspace file if it exists
        if(exist(user_work_file, 'file'))
            load_workspace;
        end

        % Save the users uploaded image as variable `img`, then save the workspace
        img = imread(image_file);
        save_workspace;
    catch e
        disp e
    end

end