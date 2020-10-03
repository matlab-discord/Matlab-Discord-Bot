function load_user_data(user_work_file, data_file)

  % Load the data file, then save the workspace
  try
    % Load the workspace file if it exists
    if(exist(user_work_file, 'file'))
      load_workspace;
    end
    load(data_file);
    builtin('clear', 'data_file');
    save_workspace;
  catch e
	  disp e
  end

end
