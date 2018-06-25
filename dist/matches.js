'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Matches = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

exports.flag = flag;

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _countryCodeEmoji = require('country-code-emoji');

var _countryCodeInfo = require('country-code-info');

var _countryCodeInfo2 = _interopRequireDefault(_countryCodeInfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function flag(fifa_country_code) {
    var cnt = _countryCodeInfo2.default.findCountry({ 'fifa': fifa_country_code });
    if (!cnt) return "🏴";else return (0, _countryCodeEmoji.flag)(cnt.a2);
}

function timeToArray(x) {
    var r = x.match(/^([0-9]+)'(?:\+([0-9]+)'|)/);
    return [r[1], r[2]];
}

function events(match) {
    var evs = [];
    if (!match) return evs;
    if (!match.home_team_events) return evs;
    function process(team, events) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = events[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var ev = _step.value;

                evs.push({ team: team, type: ev.type_of_event, player: ev.player, time: ev.time });
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }

    process(match.home_team, match.home_team_events);
    process(match.away_team, match.away_team_events);

    evs.sort(function (a_, b_) {
        var a = timeToArray(a_.time);
        var b = timeToArray(b_.time);
        if (a[0] - b[0] === 0) {
            return (a[1] == null ? 0 : a[1]) - (b[1] == null ? 0 : b[1]);
        }
        return a[0] - b[0];
    });

    return evs;
}

function details(match) {
    var header = '\n\u2796\u2796\u2796\u2796\u2796\u2796\n';
    var scores = [0, 0];
    var flags = [flag(match.home_team.code), flag(match.away_team.code)];
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = events(match)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var ev = _step2.value;

            var concept = '`' + ev.time + '`';
            var country = '**' + ev.team.country + '** ' + flag(ev.team.code);
            if (ev.type == 'goal') {
                if (ev.team.code == match.home_team.code) {
                    scores[0]++;
                } else {
                    scores[1]++;
                }
                concept += ' \u26BD\uFE0F GOAL! ' + country + ' - ' + ev.player + ' (' + flags[0] + ' ' + scores[0] + ' - ' + scores[1] + ' ' + flags[1] + ')';
            } else if (ev.type == 'yellow-card') {
                concept += '\u26A0\uFE0F Yellow Card! ' + ev.player + ' - ' + country;
            } else if (ev.type == 'red-card') {
                concept += '\u203C\uFE0F RED CARD! ' + ev.player + ' - ' + country;
            } else if (ev.type == 'substitution-in') {
                concept += '\uD83D\uDD39 ' + ev.player + ' - ' + country;
            } else if (ev.type == 'substitution-out') {
                concept += '\uD83D\uDD3B ' + ev.player + ' - ' + country;
            } else {
                concept += ev.type + ' ' + ev.player + ' ' + country;
            }

            header += concept + '\n';
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    return header;
}

var Matches = exports.Matches = function () {
    function Matches() {
        (0, _classCallCheck3.default)(this, Matches);

        this.curr_data = [];
        //        console.log(this.curr_data[40]);
    }

    (0, _createClass3.default)(Matches, [{
        key: 'update',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var matches;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                console.log("updating...");
                                _context.next = 3;
                                return (0, _nodeFetch2.default)('https://worldcup.sfg.io/matches');

                            case 3:
                                matches = _context.sent;
                                _context.next = 6;
                                return matches.json();

                            case 6:
                                this.curr_data = _context.sent;

                            case 7:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function update() {
                return _ref.apply(this, arguments);
            }

            return update;
        }()
    }, {
        key: 'list_matches',
        value: function list_matches() {
            return this.curr_data;
        }
    }, {
        key: 'match',
        value: function match(fifa_id) {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.curr_data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var match = _step3.value;

                    if (match.fifa_id == fifa_id) {
                        return match;
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            return null;
        }
    }, {
        key: 'convert',
        value: function convert(match) {
            if (!match || !match.status) {
                return "Invalid match";
            }
            if (match.status === "completed" || match.status == "in progress") {
                return flag(match.home_team.code) + ' **' + match.home_team.country + '** ' + match.home_team.goals + ' - ' + match.away_team.goals + ' **' + match.away_team.country + '** ' + flag(match.away_team.code) + ' ' + match.time + '\n' + details(match);
            } else if (match.status === "future") {
                return 'To be played on ' + match.datetime + '\n' + flag(match.home_team.code) + ' **' + match.home_team.country + '** - **' + match.away_team.country + '** ' + flag(match.away_team.code);
            }
            return "???";
        }
    }]);
    return Matches;
}();

;