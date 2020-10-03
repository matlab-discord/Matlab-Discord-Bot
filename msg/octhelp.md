**This bot has the ability to process Octave code in Discord, posting console outputs to the chat.**
> • Certain functions and operations have been restricted to work properly with discord.  
> • Each user has their own individual workspace, allowing you to save figures and variables.

**Related Functions:**
```
!oct <code> : Execute code and post console output to channel. (orun, octave)

!opr : Print users graphic figure to channel. (oprint, octaveprint)

!oup : Upload attached image file to users workspace. (oupload, octaveupload)
```

**Example use of in-chat Octave, type your commands as followed.**
> !oct\`\`\`matlab
>   foobar = 1:10; % my command
>   disp(foobar);
> \`\`\`

**This will create a formatted message that the bot can understand and execute.**
> !oct```matlab
>   foobar = 1:10; % my command
>   disp(foobar);
> ```