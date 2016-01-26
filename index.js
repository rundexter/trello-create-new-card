var trello = require('node-trello'),
    _ = require('lodash'),
    util = require('./util'),
    pickInputs = {
        name: 'name',
        due: 'due',
        idList: { key: 'idList', validate: { req: true, check: 'checkAlphanumeric' } },
        urlSource: { key: 'urlSource', validate: { req: true,  check: 'checkUrl' } },
        pos: 'pos',
        idLabels: 'idLabels',
        fileSource: 'fileSource',
        idMembers: 'idMembers'
    },
    pickOutputs = {
        id: 'id',
        name: 'name',
        idList: 'idList',
        url: 'url'
    };

module.exports = {
    authOptions: function (dexter) {
        if (!dexter.environment('trello_api_key') || !dexter.environment('trello_token')) {
            this.fail('A [trello_api_key] or [trello_token] environment variables are required for this module');
            return false;
        } else {
            return {
                api_key: dexter.environment('trello_api_key'),
                token: dexter.environment('trello_token')
            }
        }
    },
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var credentials = dexter.provider('trello').credentials(),
            t = new trello(_.get(credentials, 'consumer_key'), _.get(credentials, 'access_token')),
            inputs = util.pickInputs(step, pickInputs),
            validationErrors = util.checkValidateErrors(inputs, pickInputs);

        if (validationErrors)
            return this.fail(validationErrors);

        t.post("/1/cards", inputs, function(err, data) {
            if (!err) {
                this.complete(util.pickOutputs(data, pickOutputs));
            } else {
                this.fail(err);
            }
        }.bind(this));
    }
};
