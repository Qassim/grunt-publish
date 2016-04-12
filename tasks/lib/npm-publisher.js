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

    // load npm
    npm.load({ loglevel: 'silent' }, function(err) {
        if (err) {
            return callback(err);
        }

        if (options.registry) {
            npm.config.set('registry', options.registry);
        }

        if (options.username) {
            npm.config.set('username', options.username);
        }

        if (options.password) {
            npm.config.set('password', options.password);
        }

        if (options.email) {
            npm.config.set('email', options.email);
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