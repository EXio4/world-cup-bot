"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.StateTracker = undefined;

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var StateTracker = exports.StateTracker = function () {
    function StateTracker() {
        (0, _classCallCheck3.default)(this, StateTracker);

        this.track = [];
    }

    (0, _createClass3.default)(StateTracker, [{
        key: "addTracker",
        value: function addTracker(cb) {
            this.track.push(cb);
        }
    }, {
        key: "change",
        value: function change() {
            this.track.forEach(function (cb) {
                return cb();
            });
        }
    }]);
    return StateTracker;
}();