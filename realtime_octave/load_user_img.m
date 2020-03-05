function load_user_img(user_work_file, image_file)

    % Load the workspace file if it exists
    if(exist(user_work_file, 'file'))
        load(user_work_file);
    end

    % Save the users uploaded image as variable `img`, then save the workspace
    img = imread(image_file);
    save_workspace;

end