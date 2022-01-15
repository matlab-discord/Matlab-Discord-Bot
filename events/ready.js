const icoct = require('../src/inchat-octave');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		// Clear out octave workspaces on startup.  Fresh start!
		icoct.clearWorkspaces();

		console.log(`Ready! Logged in as ${client.user.tag}`);

		client.user.setActivity('MATLAB 2021b', {type: 'PLAYING'})

	},
};