var spawn = require('child_process').spawn;

var command;

switch(process.platform) {
    case 'darwin':
        command = 'open';
        break;
    case 'win32':
        command = 'explorer.exe';
        break;
    case 'linux':
        command = 'xdg-open';
        break;
    default:
        throw new Error('Unsupported platform: ' + process.platform);
}

function open(url, callback) {
    var child = spawn(command, [url]);
		child.on('exit', function (exitCode) {
			if (callback && exitCode !== 0) callback(new Error(`Bad Exit Code: ${exitCode}`))
		})
}

exports.open = open;
