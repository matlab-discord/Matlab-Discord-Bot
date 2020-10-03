**This bot has the ability to process MATLAB code in Discord, posting console outputs to the chat.**
> • Certain functions and operations have been restricted to work properly with discord.  
> • Each user has their own individual workspace, allowing you to save variables.

*Octave code is also able to be processed in chat.  See `!octhelp` for more instructions*

**Related Functions:**
```
!run <code> : Execute code and post console output to channel.

!print : Print current graphic figure to channel. The figure printed is associated with the last graphic figure generated among all users. 
```

**Example use of in-chat MATLAB, type your commands as followed.**
> !run\`\`\`matlab
>   foobar = 1:10; % my command
>   disp(foobar);
> \`\`\`

**This will create a formatted message that the bot can understand and execute.**
> !run```matlab
>   foobar = 1:10; % my command
>   disp(foobar);
> ```