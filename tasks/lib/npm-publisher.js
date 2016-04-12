var npm = require('npm'),
    path = require('path'),
    fs = require('fs');

/**
 * Created by leiko on 07/03/14.
 */
module.exports = function(filepath, options, callback) {
    if (!callback) {
        callback = options;
        options = {};
    }
    console.log(options.registry);
    // load npm
    npm.load(null, function(err) {
        if (err) {
            return callback(err);
        }
        var auth = {
            username: options.username,
            password: options.password,
            email: options.email,
            alwaysAuth: true
        };
        var addUserParams = {
            auth: auth
        };

        npm.registry.adduser(options.registry, addUserParams, function(addUserError, data, raw, res) {

            if (addUserError) {
                return callback(addUserError);

            }
            var metadata = require(path.join(filepath, 'package.json'));

            npm.commands.pack([], function(packError) {

                if (packError) {
                    return callback(packError);
                }

                var fileName = metadata.name + '-' + metadata.version + '.tgz';
                var bodyPath = require.resolve(path.join(filepath, fileName));
                var body = fs.createReadStream(bodyPath);
                var publishParams = {
                    metadata: metadata,
                    access: 'public',
                    body: body,
                    auth: auth
                };
                npm.registry.publish(options.registry, publishParams, function(publishError, resp) {

                    if (publishError) {
                        return callback(publishError);
                    }
                    console.log("Publish succesful: " + JSON.stringify(resp));
                    return callback();
                });
            });
        });
    });
};