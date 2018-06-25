'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _nodeTelegramBotApi = require('node-telegram-bot-api');

var _nodeTelegramBotApi2 = _interopRequireDefault(_nodeTelegramBotApi);

var _matches = require('./matches.js');

var _config = require('../config.json');

var _config2 = _interopRequireDefault(_config);

var _stateMgmt = require('./state-mgmt.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var matches = new _matches.Matches();
var bot = new _nodeTelegramBotApi2.default(_config2.default.token, { polling: true });

var msgs = [];
var state = new _stateMgmt.StateTracker(matches);

state.addTracker((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _ref2, _ref3, fifa_id, msg, match;

    return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
            switch (_context.prev = _context.next) {
                case 0:
                    _iteratorNormalCompletion = true;
                    _didIteratorError = false;
                    _iteratorError = undefined;
                    _context.prev = 3;
                    _iterator = msgs[Symbol.iterator]();

                case 5:
                    if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                        _context.next = 21;
                        break;
                    }

                    _ref2 = _step.value;
                    _ref3 = (0, _slicedToArray3.default)(_ref2, 2);
                    fifa_id = _ref3[0];
                    msg = _ref3[1];
                    _context.prev = 10;
                    match = matches.match(fifa_id);
                    _context.next = 14;
                    return bot.editMessageText(matches.convert(match), { message_id: msg.message_id, chat_id: msg.chat.id, parse_mode: 'Markdown' });

                case 14:
                    _context.next = 18;
                    break;

                case 16:
                    _context.prev = 16;
                    _context.t0 = _context['catch'](10);

                case 18:
                    _iteratorNormalCompletion = true;
                    _context.next = 5;
                    break;

                case 21:
                    _context.next = 27;
                    break;

                case 23:
                    _context.prev = 23;
                    _context.t1 = _context['catch'](3);
                    _didIteratorError = true;
                    _iteratorError = _context.t1;

                case 27:
                    _context.prev = 27;
                    _context.prev = 28;

                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }

                case 30:
                    _context.prev = 30;

                    if (!_didIteratorError) {
                        _context.next = 33;
                        break;
                    }

                    throw _iteratorError;

                case 33:
                    return _context.finish(30);

                case 34:
                    return _context.finish(27);

                case 35:
                case 'end':
                    return _context.stop();
            }
        }
    }, _callee, this, [[3, 23, 27, 35], [10, 16], [28,, 30, 34]]);
}))
// ¯\_(ツ)_/¯
);

bot.onText(/\/track[ ]+(.+)/, function () {
    var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(msg, param) {
        var chatId, fifa_id, match, cmsg;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        chatId = msg.chat.id;
                        fifa_id = param[1]; // the captured "whatever"
                        //matches.convert(matches.match(300331503)))

                        match = matches.match(fifa_id);

                        if (match) {
                            _context2.next = 6;
                            break;
                        }

                        bot.sendMessage(chatId, "Match not found, try /matches");
                        return _context2.abrupt('return');

                    case 6:
                        _context2.next = 8;
                        return bot.sendMessage(chatId, matches.convert(match), { parse_mode: 'Markdown' });

                    case 8:
                        cmsg = _context2.sent;

                        msgs.push([fifa_id, cmsg]);

                    case 10:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    }));

    return function (_x, _x2) {
        return _ref4.apply(this, arguments);
    };
}());
bot.onText(/\/matches[ ]*/, function () {
    var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(msg) {
        var s, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, match;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        s = "";
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context3.prev = 4;

                        for (_iterator2 = matches.list_matches()[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            match = _step2.value;

                            if (match.status == 'future') {
                                s += '[' + match.fifa_id + '] ' + (0, _matches.flag)(match.home_team.code) + ' ' + match.home_team.country + ' - ' + match.away_team.country + ' ' + (0, _matches.flag)(match.away_team.code) + '\n';
                            } else {
                                s += '[' + match.fifa_id + '] ' + (0, _matches.flag)(match.home_team.code) + ' ' + match.home_team.country + ' ' + match.home_team.goals + ' - ' + match.away_team.goals + ' ' + match.away_team.country + ' ' + (0, _matches.flag)(match.away_team.code) + '\n';
                            }
                        }
                        _context3.next = 12;
                        break;

                    case 8:
                        _context3.prev = 8;
                        _context3.t0 = _context3['catch'](4);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context3.t0;

                    case 12:
                        _context3.prev = 12;
                        _context3.prev = 13;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 15:
                        _context3.prev = 15;

                        if (!_didIteratorError2) {
                            _context3.next = 18;
                            break;
                        }

                        throw _iteratorError2;

                    case 18:
                        return _context3.finish(15);

                    case 19:
                        return _context3.finish(12);

                    case 20:
                        if (s === "") {
                            s = "Loading match info, try again later...";
                        }
                        _context3.next = 23;
                        return bot.sendMessage(msg.chat.id, s);

                    case 23:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[4, 8, 12, 20], [13,, 15, 19]]);
    }));

    return function (_x3) {
        return _ref5.apply(this, arguments);
    };
}());

matches.update();
setInterval((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
    return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
            switch (_context4.prev = _context4.next) {
                case 0:
                    _context4.next = 2;
                    return matches.update();

                case 2:
                    state.change();

                case 3:
                case 'end':
                    return _context4.stop();
            }
        }
    }, _callee4, this);
})), 30000);

console.log("Bot started");