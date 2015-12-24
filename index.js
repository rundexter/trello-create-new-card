var trello = require('node-trello'),
    _ = require('lodash'),
    util = require('./util'),
    pickInputs = {
        name: 'name',
        due: "due",
        idList: "idList",
        urlSource: "urlSource",
        pos: "pos",
        idLabels: "idLabels",
        fileSource: "fileSource",
        idMembers: "idMembers"
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
        var auth = this.authOptions(dexter);

        if (!auth) return;

        var t = new trello(auth.api_key, auth.token);
        var inputs = util.pickStringInputs(step, pickInputs);

        if (_.isEmpty(inputs.idList))
            return this.fail('A [idList] variable is required for this module ');

        if (!_.isEmpty(inputs.urlSource) && !util.checkUrl(inputs.urlSource))
            return this.fail('Source URL is not valid');

        if (!util.checkAlphanumeric(inputs.idList))
            return this.fail("List id is not valid");

        t.post("/1/cards", inputs, function(err, data) {
            if (!err) {
                this.complete(util.pickResult(data, pickOutputs));
            } else {
                this.fail(err);
            }
        }.bind(this));
    }
};
