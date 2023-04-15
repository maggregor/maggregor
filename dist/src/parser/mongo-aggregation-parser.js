'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.PeggySyntaxError = void 0;
const index_1 = require("../core/pipeline/accumulators/index");
function peg$padEnd(str, targetLength, padString) {
    padString = padString || ' ';
    if (str.length > targetLength) {
        return str;
    }
    targetLength -= str.length;
    padString += padString.repeat(targetLength);
    return str + padString.slice(0, targetLength);
}
class PeggySyntaxError extends Error {
    static buildMessage(expected, found) {
        function hex(ch) {
            return ch.charCodeAt(0).toString(16).toUpperCase();
        }
        function literalEscape(s) {
            return s
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\0/g, '\\0')
                .replace(/\t/g, '\\t')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/[\x00-\x0F]/g, (ch) => '\\x0' + hex(ch))
                .replace(/[\x10-\x1F\x7F-\x9F]/g, (ch) => '\\x' + hex(ch));
        }
        function classEscape(s) {
            return s
                .replace(/\\/g, '\\\\')
                .replace(/\]/g, '\\]')
                .replace(/\^/g, '\\^')
                .replace(/-/g, '\\-')
                .replace(/\0/g, '\\0')
                .replace(/\t/g, '\\t')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/[\x00-\x0F]/g, (ch) => '\\x0' + hex(ch))
                .replace(/[\x10-\x1F\x7F-\x9F]/g, (ch) => '\\x' + hex(ch));
        }
        function describeExpectation(expectation) {
            switch (expectation.type) {
                case 'literal':
                    return '"' + literalEscape(expectation.text) + '"';
                case 'class':
                    const escapedParts = expectation.parts.map((part) => {
                        return Array.isArray(part)
                            ? classEscape(part[0]) +
                                '-' +
                                classEscape(part[1])
                            : classEscape(part);
                    });
                    return '[' + (expectation.inverted ? '^' : '') + escapedParts + ']';
                case 'any':
                    return 'any character';
                case 'end':
                    return 'end of input';
                case 'other':
                    return expectation.description;
            }
        }
        function describeExpected(expected1) {
            const descriptions = expected1.map(describeExpectation);
            let i;
            let j;
            descriptions.sort();
            if (descriptions.length > 0) {
                for (i = 1, j = 1; i < descriptions.length; i++) {
                    if (descriptions[i - 1] !== descriptions[i]) {
                        descriptions[j] = descriptions[i];
                        j++;
                    }
                }
                descriptions.length = j;
            }
            switch (descriptions.length) {
                case 1:
                    return descriptions[0];
                case 2:
                    return descriptions[0] + ' or ' + descriptions[1];
                default:
                    return (descriptions.slice(0, -1).join(', ') +
                        ', or ' +
                        descriptions[descriptions.length - 1]);
            }
        }
        function describeFound(found1) {
            return found1 ? '"' + literalEscape(found1) + '"' : 'end of input';
        }
        return ('Expected ' +
            describeExpected(expected) +
            ' but ' +
            describeFound(found) +
            ' found.');
    }
    constructor(message, expected, found, location) {
        super();
        this.message = message;
        this.expected = expected;
        this.found = found;
        this.location = location;
        this.name = 'PeggySyntaxError';
        if (typeof Object.setPrototypeOf === 'function') {
            Object.setPrototypeOf(this, PeggySyntaxError.prototype);
        }
        else {
            this.__proto__ = PeggySyntaxError.prototype;
        }
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, PeggySyntaxError);
        }
    }
    format(sources) {
        let str = 'Error: ' + this.message;
        if (this.location) {
            let src = null;
            let k;
            for (k = 0; k < sources.length; k++) {
                if (sources[k].grammarSource === this.location.source) {
                    src = sources[k].text.split(/\r\n|\n|\r/g);
                    break;
                }
            }
            let s = this.location.start;
            let loc = this.location.source + ':' + s.line + ':' + s.column;
            if (src) {
                let e = this.location.end;
                let filler = peg$padEnd('', s.line.toString().length, ' ');
                let line = src[s.line - 1];
                let last = s.line === e.line ? e.column : line.length + 1;
                str +=
                    '\n --> ' +
                        loc +
                        '\n' +
                        filler +
                        ' |\n' +
                        s.line +
                        ' | ' +
                        line +
                        '\n' +
                        filler +
                        ' | ' +
                        peg$padEnd('', s.column - 1, ' ') +
                        peg$padEnd('', last - s.column, '^');
            }
            else {
                str += '\n at ' + loc;
            }
        }
        return str;
    }
}
exports.PeggySyntaxError = PeggySyntaxError;
function peg$parse(input, options) {
    options = options !== undefined ? options : {};
    const peg$FAILED = {};
    const peg$source = options.grammarSource;
    const peg$startRuleFunctions = {
        start: peg$parsestart,
    };
    let peg$startRuleFunction = peg$parsestart;
    const peg$c0 = '[';
    const peg$c1 = peg$literalExpectation('[', false);
    const peg$c2 = ',';
    const peg$c3 = peg$literalExpectation(',', false);
    const peg$c4 = ']';
    const peg$c5 = peg$literalExpectation(']', false);
    const peg$c6 = function (stage) {
        return [stage];
    };
    const peg$c7 = '{';
    const peg$c8 = peg$literalExpectation('{', false);
    const peg$c9 = '$';
    const peg$c10 = peg$literalExpectation('$', false);
    const peg$c11 = 'group';
    const peg$c12 = peg$literalExpectation('group', true);
    const peg$c13 = ':';
    const peg$c14 = peg$literalExpectation(':', false);
    const peg$c15 = '}';
    const peg$c16 = peg$literalExpectation('}', false);
    const peg$c17 = function (type, stage) {
        return Object.assign({ type }, stage);
    };
    const peg$c18 = 'match';
    const peg$c19 = peg$literalExpectation('match', true);
    const peg$c20 = 'limit';
    const peg$c21 = peg$literalExpectation('limit', true);
    const peg$c22 = '_id';
    const peg$c23 = peg$literalExpectation('_id', false);
    const peg$c24 = function (groupExpr, accumulators) {
        return { groupExpr, accumulators };
    };
    const peg$c25 = function (outputFieldName, gr) {
        return (0, index_1.createBasicAccumulator)({
            outputFieldName,
            operator: gr.operator,
            expression: gr.expression,
        });
    };
    const peg$c26 = function (operator, expression) {
        return { operator, expression };
    };
    const peg$c27 = function (value, values) {
        return [value, ...values];
    };
    const peg$c28 = function (value) {
        return value;
    };
    const peg$c29 = 'addtoset';
    const peg$c30 = peg$literalExpectation('addToSet', true);
    const peg$c31 = 'avg';
    const peg$c32 = peg$literalExpectation('avg', true);
    const peg$c33 = 'first';
    const peg$c34 = peg$literalExpectation('first', true);
    const peg$c35 = 'last';
    const peg$c36 = peg$literalExpectation('last', true);
    const peg$c37 = 'max';
    const peg$c38 = peg$literalExpectation('max', true);
    const peg$c39 = 'min';
    const peg$c40 = peg$literalExpectation('min', true);
    const peg$c41 = 'push';
    const peg$c42 = peg$literalExpectation('push', true);
    const peg$c43 = 'sum';
    const peg$c44 = peg$literalExpectation('sum', true);
    const peg$c45 = function (conditionEnums) {
        return { conditions: conditionEnums.flat() };
    };
    const peg$c46 = 'and';
    const peg$c47 = peg$literalExpectation('and', true);
    const peg$c48 = 'or';
    const peg$c49 = peg$literalExpectation('or', true);
    const peg$c50 = 'not';
    const peg$c51 = peg$literalExpectation('not', true);
    const peg$c52 = function (operator, conditions) {
        return { operator, conditions };
    };
    const peg$c53 = function (condition, conditions) {
        return [condition, ...conditions];
    };
    const peg$c54 = function (condition) {
        return condition;
    };
    const peg$c55 = function (field, value) {
        return { operator: 'eq', value: [{ field }, { value }] };
    };
    const peg$c56 = function (limitValue) {
        return { limit: limitValue };
    };
    const peg$c57 = 'eq';
    const peg$c58 = peg$literalExpectation('eq', true);
    const peg$c59 = 'ne';
    const peg$c60 = peg$literalExpectation('ne', true);
    const peg$c61 = 'gt';
    const peg$c62 = peg$literalExpectation('gt', true);
    const peg$c63 = 'gte';
    const peg$c64 = peg$literalExpectation('gte', true);
    const peg$c65 = 'lt';
    const peg$c66 = peg$literalExpectation('lt', true);
    const peg$c67 = 'lte';
    const peg$c68 = peg$literalExpectation('lte', true);
    const peg$c69 = function (operator, value) {
        return { operator, value };
    };
    const peg$c70 = function (field, value) {
        return { field, value };
    };
    const peg$c71 = function (n) {
        return { value: n };
    };
    const peg$c72 = 'add';
    const peg$c73 = peg$literalExpectation('add', true);
    const peg$c74 = 'subtract';
    const peg$c75 = peg$literalExpectation('subtract', true);
    const peg$c76 = 'multiply';
    const peg$c77 = peg$literalExpectation('multiply', true);
    const peg$c78 = 'divide';
    const peg$c79 = peg$literalExpectation('divide', true);
    const peg$c80 = 'toupper';
    const peg$c81 = peg$literalExpectation('toUpper', true);
    const peg$c82 = 'tolower';
    const peg$c83 = peg$literalExpectation('toLower', true);
    const peg$c84 = 'cond';
    const peg$c85 = peg$literalExpectation('cond', true);
    const peg$c86 = '"$';
    const peg$c87 = peg$literalExpectation('"$', false);
    const peg$c88 = /^[^"]/;
    const peg$c89 = peg$classExpectation(['"'], true, false);
    const peg$c90 = '"';
    const peg$c91 = peg$literalExpectation('"', false);
    const peg$c92 = function (chars) {
        return { field: chars.join('') };
    };
    const peg$c93 = /^[a-zA-Z_]/;
    const peg$c94 = peg$classExpectation([['a', 'z'], ['A', 'Z'], '_'], false, false);
    const peg$c95 = /^[a-zA-Z0-9_.]/;
    const peg$c96 = peg$classExpectation([['a', 'z'], ['A', 'Z'], ['0', '9'], '_', '.'], false, false);
    const peg$c97 = function (firstLetter, restLetters) {
        return firstLetter + restLetters.join('');
    };
    const peg$c98 = /^[0-9]/;
    const peg$c99 = peg$classExpectation([['0', '9']], false, false);
    const peg$c100 = function () {
        return parseInt(text());
    };
    const peg$c101 = '-';
    const peg$c102 = peg$literalExpectation('-', false);
    const peg$c103 = '.';
    const peg$c104 = peg$literalExpectation('.', false);
    const peg$c105 = 'e';
    const peg$c106 = peg$literalExpectation('e', true);
    const peg$c107 = 'E';
    const peg$c108 = peg$literalExpectation('E', false);
    const peg$c109 = '+';
    const peg$c110 = peg$literalExpectation('+', false);
    const peg$c111 = function () {
        return parseFloat(text());
    };
    const peg$c112 = function (chars) {
        return chars.join('');
    };
    const peg$c113 = "'";
    const peg$c114 = peg$literalExpectation("'", false);
    const peg$c115 = /^[^']/;
    const peg$c116 = peg$classExpectation(["'"], true, false);
    const peg$c117 = 'true';
    const peg$c118 = peg$literalExpectation('true', true);
    const peg$c119 = function () {
        return true;
    };
    const peg$c120 = 'false';
    const peg$c121 = peg$literalExpectation('false', true);
    const peg$c122 = function () {
        return false;
    };
    const peg$c123 = 'null';
    const peg$c124 = peg$literalExpectation('null', true);
    const peg$c125 = function () {
        return null;
    };
    const peg$c126 = peg$otherExpectation('whitespace');
    const peg$c127 = /^[ \t\n\r]/;
    const peg$c128 = peg$classExpectation([' ', '\t', '\n', '\r'], false, false);
    let peg$currPos = 0;
    let peg$savedPos = 0;
    const peg$posDetailsCache = [{ line: 1, column: 1 }];
    let peg$maxFailPos = 0;
    let peg$maxFailExpected = [];
    let peg$silentFails = 0;
    let peg$result;
    if (options.startRule !== undefined) {
        if (!(options.startRule in peg$startRuleFunctions)) {
            throw new Error('Can\'t start parsing from rule "' + options.startRule + '".');
        }
        peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }
    function text() {
        return input.substring(peg$savedPos, peg$currPos);
    }
    function location() {
        return peg$computeLocation(peg$savedPos, peg$currPos);
    }
    function expected(description, location1) {
        location1 =
            location1 !== undefined
                ? location1
                : peg$computeLocation(peg$savedPos, peg$currPos);
        throw peg$buildStructuredError([peg$otherExpectation(description)], input.substring(peg$savedPos, peg$currPos), location1);
    }
    function error(message, location1) {
        location1 =
            location1 !== undefined
                ? location1
                : peg$computeLocation(peg$savedPos, peg$currPos);
        throw peg$buildSimpleError(message, location1);
    }
    function peg$literalExpectation(text1, ignoreCase) {
        return { type: 'literal', text: text1, ignoreCase: ignoreCase };
    }
    function peg$classExpectation(parts, inverted, ignoreCase) {
        return {
            type: 'class',
            parts: parts,
            inverted: inverted,
            ignoreCase: ignoreCase,
        };
    }
    function peg$anyExpectation() {
        return { type: 'any' };
    }
    function peg$endExpectation() {
        return { type: 'end' };
    }
    function peg$otherExpectation(description) {
        return { type: 'other', description: description };
    }
    function peg$computePosDetails(pos) {
        let details = peg$posDetailsCache[pos];
        let p;
        if (details) {
            return details;
        }
        else {
            p = pos - 1;
            while (!peg$posDetailsCache[p]) {
                p--;
            }
            details = peg$posDetailsCache[p];
            details = {
                line: details.line,
                column: details.column,
            };
            while (p < pos) {
                if (input.charCodeAt(p) === 10) {
                    details.line++;
                    details.column = 1;
                }
                else {
                    details.column++;
                }
                p++;
            }
            peg$posDetailsCache[pos] = details;
            return details;
        }
    }
    function peg$computeLocation(startPos, endPos) {
        const startPosDetails = peg$computePosDetails(startPos);
        const endPosDetails = peg$computePosDetails(endPos);
        return {
            source: peg$source,
            start: {
                offset: startPos,
                line: startPosDetails.line,
                column: startPosDetails.column,
            },
            end: {
                offset: endPos,
                line: endPosDetails.line,
                column: endPosDetails.column,
            },
        };
    }
    function peg$fail(expected1) {
        if (peg$currPos < peg$maxFailPos) {
            return;
        }
        if (peg$currPos > peg$maxFailPos) {
            peg$maxFailPos = peg$currPos;
            peg$maxFailExpected = [];
        }
        peg$maxFailExpected.push(expected1);
    }
    function peg$buildSimpleError(message, location1) {
        return new PeggySyntaxError(message, [], '', location1);
    }
    function peg$buildStructuredError(expected1, found, location1) {
        return new PeggySyntaxError(PeggySyntaxError.buildMessage(expected1, found), expected1, found, location1);
    }
    function peg$parsestart() {
        let s0;
        s0 = peg$parsepipeline();
        return s0;
    }
    function peg$parsepipeline() {
        let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 91) {
            s1 = peg$c0;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c1);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parsews();
            if (s2 !== peg$FAILED) {
                s3 = peg$parsestage();
                if (s3 !== peg$FAILED) {
                    s4 = [];
                    s5 = peg$currPos;
                    s6 = peg$parsews();
                    if (s6 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 44) {
                            s7 = peg$c2;
                            peg$currPos++;
                        }
                        else {
                            s7 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c3);
                            }
                        }
                        if (s7 !== peg$FAILED) {
                            s8 = peg$parsews();
                            if (s8 !== peg$FAILED) {
                                s9 = peg$parsestage();
                                if (s9 !== peg$FAILED) {
                                    s6 = [s6, s7, s8, s9];
                                    s5 = s6;
                                }
                                else {
                                    peg$currPos = s5;
                                    s5 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s5;
                                s5 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s5;
                            s5 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s5;
                        s5 = peg$FAILED;
                    }
                    while (s5 !== peg$FAILED) {
                        s4.push(s5);
                        s5 = peg$currPos;
                        s6 = peg$parsews();
                        if (s6 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 44) {
                                s7 = peg$c2;
                                peg$currPos++;
                            }
                            else {
                                s7 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c3);
                                }
                            }
                            if (s7 !== peg$FAILED) {
                                s8 = peg$parsews();
                                if (s8 !== peg$FAILED) {
                                    s9 = peg$parsestage();
                                    if (s9 !== peg$FAILED) {
                                        s6 = [s6, s7, s8, s9];
                                        s5 = s6;
                                    }
                                    else {
                                        peg$currPos = s5;
                                        s5 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s5;
                                    s5 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s5;
                                s5 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s5;
                            s5 = peg$FAILED;
                        }
                    }
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parsews();
                        if (s5 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 93) {
                                s6 = peg$c4;
                                peg$currPos++;
                            }
                            else {
                                s6 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c5);
                                }
                            }
                            if (s6 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$c6(s3);
                                s0 = s1;
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parsestage() {
        let s0;
        s0 = peg$parsegroupStage();
        if (s0 === peg$FAILED) {
            s0 = peg$parsematchStage();
            if (s0 === peg$FAILED) {
                s0 = peg$parselimitStage();
            }
        }
        return s0;
    }
    function peg$parsegroupStage() {
        let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
            s1 = peg$c7;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c8);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parsews();
            if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 36) {
                    s3 = peg$c9;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c10);
                    }
                }
                if (s3 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c11) {
                        s4 = input.substr(peg$currPos, 5);
                        peg$currPos += 5;
                    }
                    else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c12);
                        }
                    }
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parsews();
                        if (s5 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 58) {
                                s6 = peg$c13;
                                peg$currPos++;
                            }
                            else {
                                s6 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c14);
                                }
                            }
                            if (s6 !== peg$FAILED) {
                                s7 = peg$parsews();
                                if (s7 !== peg$FAILED) {
                                    s8 = peg$parsegroupStageContent();
                                    if (s8 !== peg$FAILED) {
                                        s9 = peg$parsews();
                                        if (s9 !== peg$FAILED) {
                                            if (input.charCodeAt(peg$currPos) === 125) {
                                                s10 = peg$c15;
                                                peg$currPos++;
                                            }
                                            else {
                                                s10 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                    peg$fail(peg$c16);
                                                }
                                            }
                                            if (s10 !== peg$FAILED) {
                                                peg$savedPos = s0;
                                                s1 = peg$c17(s4, s8);
                                                s0 = s1;
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parsematchStage() {
        let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
            s1 = peg$c7;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c8);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parsews();
            if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 36) {
                    s3 = peg$c9;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c10);
                    }
                }
                if (s3 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c18) {
                        s4 = input.substr(peg$currPos, 5);
                        peg$currPos += 5;
                    }
                    else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c19);
                        }
                    }
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parsews();
                        if (s5 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 58) {
                                s6 = peg$c13;
                                peg$currPos++;
                            }
                            else {
                                s6 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c14);
                                }
                            }
                            if (s6 !== peg$FAILED) {
                                s7 = peg$parsews();
                                if (s7 !== peg$FAILED) {
                                    s8 = peg$parsematchStageContent();
                                    if (s8 !== peg$FAILED) {
                                        s9 = peg$parsews();
                                        if (s9 !== peg$FAILED) {
                                            if (input.charCodeAt(peg$currPos) === 125) {
                                                s10 = peg$c15;
                                                peg$currPos++;
                                            }
                                            else {
                                                s10 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                    peg$fail(peg$c16);
                                                }
                                            }
                                            if (s10 !== peg$FAILED) {
                                                peg$savedPos = s0;
                                                s1 = peg$c17(s4, s8);
                                                s0 = s1;
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parselimitStage() {
        let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
            s1 = peg$c7;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c8);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parsews();
            if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 36) {
                    s3 = peg$c9;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c10);
                    }
                }
                if (s3 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c20) {
                        s4 = input.substr(peg$currPos, 5);
                        peg$currPos += 5;
                    }
                    else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c21);
                        }
                    }
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parsews();
                        if (s5 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 58) {
                                s6 = peg$c13;
                                peg$currPos++;
                            }
                            else {
                                s6 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c14);
                                }
                            }
                            if (s6 !== peg$FAILED) {
                                s7 = peg$parsews();
                                if (s7 !== peg$FAILED) {
                                    s8 = peg$parselimitStageContent();
                                    if (s8 !== peg$FAILED) {
                                        s9 = peg$parsews();
                                        if (s9 !== peg$FAILED) {
                                            if (input.charCodeAt(peg$currPos) === 125) {
                                                s10 = peg$c15;
                                                peg$currPos++;
                                            }
                                            else {
                                                s10 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                    peg$fail(peg$c16);
                                                }
                                            }
                                            if (s10 !== peg$FAILED) {
                                                peg$savedPos = s0;
                                                s1 = peg$c17(s4, s8);
                                                s0 = s1;
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parsegroupStageContent() {
        let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
            s1 = peg$c7;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c8);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parsews();
            if (s2 !== peg$FAILED) {
                if (input.substr(peg$currPos, 3) === peg$c22) {
                    s3 = peg$c22;
                    peg$currPos += 3;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c23);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s4 = peg$parsews();
                    if (s4 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 58) {
                            s5 = peg$c13;
                            peg$currPos++;
                        }
                        else {
                            s5 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c14);
                            }
                        }
                        if (s5 !== peg$FAILED) {
                            s6 = peg$parsews();
                            if (s6 !== peg$FAILED) {
                                s7 = peg$parseexpressionValue();
                                if (s7 !== peg$FAILED) {
                                    s8 = peg$parsews();
                                    if (s8 !== peg$FAILED) {
                                        s9 = [];
                                        s10 = peg$parsegroupAccumulator();
                                        while (s10 !== peg$FAILED) {
                                            s9.push(s10);
                                            s10 = peg$parsegroupAccumulator();
                                        }
                                        if (s9 !== peg$FAILED) {
                                            if (input.charCodeAt(peg$currPos) === 125) {
                                                s10 = peg$c15;
                                                peg$currPos++;
                                            }
                                            else {
                                                s10 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                    peg$fail(peg$c16);
                                                }
                                            }
                                            if (s10 !== peg$FAILED) {
                                                peg$savedPos = s0;
                                                s1 = peg$c24(s7, s9);
                                                s0 = s1;
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parsegroupAccumulator() {
        let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 44) {
            s1 = peg$c2;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c3);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parsews();
            if (s2 !== peg$FAILED) {
                s3 = peg$parseidentifier();
                if (s3 !== peg$FAILED) {
                    s4 = peg$parsews();
                    if (s4 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 58) {
                            s5 = peg$c13;
                            peg$currPos++;
                        }
                        else {
                            s5 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c14);
                            }
                        }
                        if (s5 !== peg$FAILED) {
                            s6 = peg$parsews();
                            if (s6 !== peg$FAILED) {
                                if (input.charCodeAt(peg$currPos) === 123) {
                                    s7 = peg$c7;
                                    peg$currPos++;
                                }
                                else {
                                    s7 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$c8);
                                    }
                                }
                                if (s7 !== peg$FAILED) {
                                    s8 = peg$parsews();
                                    if (s8 !== peg$FAILED) {
                                        s9 = peg$parsegroupExpression();
                                        if (s9 !== peg$FAILED) {
                                            s10 = peg$parsews();
                                            if (s10 !== peg$FAILED) {
                                                if (input.charCodeAt(peg$currPos) === 125) {
                                                    s11 = peg$c15;
                                                    peg$currPos++;
                                                }
                                                else {
                                                    s11 = peg$FAILED;
                                                    if (peg$silentFails === 0) {
                                                        peg$fail(peg$c16);
                                                    }
                                                }
                                                if (s11 !== peg$FAILED) {
                                                    s12 = peg$parsews();
                                                    if (s12 !== peg$FAILED) {
                                                        peg$savedPos = s0;
                                                        s1 = peg$c25(s3, s9);
                                                        s0 = s1;
                                                    }
                                                    else {
                                                        peg$currPos = s0;
                                                        s0 = peg$FAILED;
                                                    }
                                                }
                                                else {
                                                    peg$currPos = s0;
                                                    s0 = peg$FAILED;
                                                }
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parsegroupExpression() {
        let s0, s1, s2, s3, s4, s5, s6;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 36) {
            s1 = peg$c9;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c10);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parsegroupOperator();
            if (s2 !== peg$FAILED) {
                s3 = peg$parsews();
                if (s3 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 58) {
                        s4 = peg$c13;
                        peg$currPos++;
                    }
                    else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c14);
                        }
                    }
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parsews();
                        if (s5 !== peg$FAILED) {
                            s6 = peg$parseexpressionValueArray();
                            if (s6 === peg$FAILED) {
                                s6 = peg$parseexpressionValue();
                            }
                            if (s6 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$c26(s2, s6);
                                s0 = s1;
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseexpressionValueArray() {
        let s0, s1, s2, s3, s4, s5, s6, s7;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 91) {
            s1 = peg$c0;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c1);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parsews();
            if (s2 !== peg$FAILED) {
                s3 = peg$parseexpressionValue();
                if (s3 !== peg$FAILED) {
                    s4 = peg$parsews();
                    if (s4 !== peg$FAILED) {
                        s5 = [];
                        s6 = peg$parseexpressionValueSeparated();
                        while (s6 !== peg$FAILED) {
                            s5.push(s6);
                            s6 = peg$parseexpressionValueSeparated();
                        }
                        if (s5 !== peg$FAILED) {
                            s6 = peg$parsews();
                            if (s6 !== peg$FAILED) {
                                if (input.charCodeAt(peg$currPos) === 93) {
                                    s7 = peg$c4;
                                    peg$currPos++;
                                }
                                else {
                                    s7 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$c5);
                                    }
                                }
                                if (s7 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s1 = peg$c27(s3, s5);
                                    s0 = s1;
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseexpressionValueSeparated() {
        let s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        s1 = peg$parsews();
        if (s1 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 44) {
                s2 = peg$c2;
                peg$currPos++;
            }
            else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c3);
                }
            }
            if (s2 !== peg$FAILED) {
                s3 = peg$parsews();
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseexpressionValue();
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parsews();
                        if (s5 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$c28(s4);
                            s0 = s1;
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parsegroupOperator() {
        let s0;
        if (input.substr(peg$currPos, 8).toLowerCase() === peg$c29) {
            s0 = input.substr(peg$currPos, 8);
            peg$currPos += 8;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c30);
            }
        }
        if (s0 === peg$FAILED) {
            if (input.substr(peg$currPos, 3).toLowerCase() === peg$c31) {
                s0 = input.substr(peg$currPos, 3);
                peg$currPos += 3;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c32);
                }
            }
            if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 5).toLowerCase() === peg$c33) {
                    s0 = input.substr(peg$currPos, 5);
                    peg$currPos += 5;
                }
                else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c34);
                    }
                }
                if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c35) {
                        s0 = input.substr(peg$currPos, 4);
                        peg$currPos += 4;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c36);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 3).toLowerCase() === peg$c37) {
                            s0 = input.substr(peg$currPos, 3);
                            peg$currPos += 3;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c38);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 3).toLowerCase() === peg$c39) {
                                s0 = input.substr(peg$currPos, 3);
                                peg$currPos += 3;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c40);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 4).toLowerCase() === peg$c41) {
                                    s0 = input.substr(peg$currPos, 4);
                                    peg$currPos += 4;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$c42);
                                    }
                                }
                                if (s0 === peg$FAILED) {
                                    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c43) {
                                        s0 = input.substr(peg$currPos, 3);
                                        peg$currPos += 3;
                                    }
                                    else {
                                        s0 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$c44);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return s0;
    }
    function peg$parsematchStageContent() {
        let s0, s1, s2;
        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parsematchConditionEnumeration();
        while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parsematchConditionEnumeration();
        }
        if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c45(s1);
        }
        s0 = s1;
        return s0;
    }
    function peg$parselogicalOperatorCondition() {
        let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
            s1 = peg$c7;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c8);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parsews();
            if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 36) {
                    s3 = peg$c9;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c10);
                    }
                }
                if (s3 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c46) {
                        s4 = input.substr(peg$currPos, 3);
                        peg$currPos += 3;
                    }
                    else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c47);
                        }
                    }
                    if (s4 === peg$FAILED) {
                        if (input.substr(peg$currPos, 2).toLowerCase() === peg$c48) {
                            s4 = input.substr(peg$currPos, 2);
                            peg$currPos += 2;
                        }
                        else {
                            s4 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c49);
                            }
                        }
                        if (s4 === peg$FAILED) {
                            if (input.substr(peg$currPos, 3).toLowerCase() === peg$c50) {
                                s4 = input.substr(peg$currPos, 3);
                                peg$currPos += 3;
                            }
                            else {
                                s4 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c51);
                                }
                            }
                        }
                    }
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parsews();
                        if (s5 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 58) {
                                s6 = peg$c13;
                                peg$currPos++;
                            }
                            else {
                                s6 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c14);
                                }
                            }
                            if (s6 !== peg$FAILED) {
                                s7 = peg$parsews();
                                if (s7 !== peg$FAILED) {
                                    if (input.charCodeAt(peg$currPos) === 91) {
                                        s8 = peg$c0;
                                        peg$currPos++;
                                    }
                                    else {
                                        s8 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$c1);
                                        }
                                    }
                                    if (s8 !== peg$FAILED) {
                                        s9 = peg$parsews();
                                        if (s9 !== peg$FAILED) {
                                            s10 = [];
                                            s11 = peg$parsematchConditionEnumeration();
                                            while (s11 !== peg$FAILED) {
                                                s10.push(s11);
                                                s11 = peg$parsematchConditionEnumeration();
                                            }
                                            if (s10 !== peg$FAILED) {
                                                s11 = peg$parsews();
                                                if (s11 !== peg$FAILED) {
                                                    if (input.charCodeAt(peg$currPos) === 93) {
                                                        s12 = peg$c4;
                                                        peg$currPos++;
                                                    }
                                                    else {
                                                        s12 = peg$FAILED;
                                                        if (peg$silentFails === 0) {
                                                            peg$fail(peg$c5);
                                                        }
                                                    }
                                                    if (s12 !== peg$FAILED) {
                                                        s13 = peg$parsews();
                                                        if (s13 !== peg$FAILED) {
                                                            if (input.charCodeAt(peg$currPos) === 125) {
                                                                s14 = peg$c15;
                                                                peg$currPos++;
                                                            }
                                                            else {
                                                                s14 = peg$FAILED;
                                                                if (peg$silentFails === 0) {
                                                                    peg$fail(peg$c16);
                                                                }
                                                            }
                                                            if (s14 !== peg$FAILED) {
                                                                peg$savedPos = s0;
                                                                s1 = peg$c52(s4, s10);
                                                                s0 = s1;
                                                            }
                                                            else {
                                                                peg$currPos = s0;
                                                                s0 = peg$FAILED;
                                                            }
                                                        }
                                                        else {
                                                            peg$currPos = s0;
                                                            s0 = peg$FAILED;
                                                        }
                                                    }
                                                    else {
                                                        peg$currPos = s0;
                                                        s0 = peg$FAILED;
                                                    }
                                                }
                                                else {
                                                    peg$currPos = s0;
                                                    s0 = peg$FAILED;
                                                }
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parsematchConditionEnumeration() {
        let s0, s1, s2, s3, s4;
        s0 = peg$currPos;
        s1 = peg$parsematchCondition();
        if (s1 !== peg$FAILED) {
            s2 = peg$parsews();
            if (s2 !== peg$FAILED) {
                s3 = [];
                s4 = peg$parsematchConditionSeparated();
                while (s4 !== peg$FAILED) {
                    s3.push(s4);
                    s4 = peg$parsematchConditionSeparated();
                }
                if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c53(s1, s3);
                    s0 = s1;
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parselogicalOperatorCondition();
            if (s1 !== peg$FAILED) {
                s2 = peg$parsews();
                if (s2 !== peg$FAILED) {
                    s3 = [];
                    s4 = peg$parsematchConditionSeparated();
                    while (s4 !== peg$FAILED) {
                        s3.push(s4);
                        s4 = peg$parsematchConditionSeparated();
                    }
                    if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c53(s1, s3);
                        s0 = s1;
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        return s0;
    }
    function peg$parsematchConditionSeparated() {
        let s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        s1 = peg$parsews();
        if (s1 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 44) {
                s2 = peg$c2;
                peg$currPos++;
            }
            else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c3);
                }
            }
            if (s2 !== peg$FAILED) {
                s3 = peg$parsews();
                if (s3 !== peg$FAILED) {
                    s4 = peg$parsematchCondition();
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parsews();
                        if (s5 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$c54(s4);
                            s0 = s1;
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parsews();
            if (s1 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 44) {
                    s2 = peg$c2;
                    peg$currPos++;
                }
                else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c3);
                    }
                }
                if (s2 !== peg$FAILED) {
                    s3 = peg$parsews();
                    if (s3 !== peg$FAILED) {
                        s4 = peg$parselogicalOperatorCondition();
                        if (s4 !== peg$FAILED) {
                            s5 = peg$parsews();
                            if (s5 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$c54(s4);
                                s0 = s1;
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        return s0;
    }
    function peg$parsematchCondition() {
        let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
            s1 = peg$c7;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c8);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parsews();
            if (s2 !== peg$FAILED) {
                s3 = peg$parseidentifier();
                if (s3 !== peg$FAILED) {
                    s4 = peg$parsews();
                    if (s4 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 58) {
                            s5 = peg$c13;
                            peg$currPos++;
                        }
                        else {
                            s5 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c14);
                            }
                        }
                        if (s5 !== peg$FAILED) {
                            s6 = peg$parsews();
                            if (s6 !== peg$FAILED) {
                                s7 = peg$parselogicalOperatorCondition();
                                if (s7 === peg$FAILED) {
                                    s7 = peg$parsecomparisonOperator();
                                    if (s7 === peg$FAILED) {
                                        s7 = peg$parseexpressionValue();
                                    }
                                }
                                if (s7 !== peg$FAILED) {
                                    s8 = peg$parsews();
                                    if (s8 !== peg$FAILED) {
                                        if (input.charCodeAt(peg$currPos) === 125) {
                                            s9 = peg$c15;
                                            peg$currPos++;
                                        }
                                        else {
                                            s9 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$c16);
                                            }
                                        }
                                        if (s9 !== peg$FAILED) {
                                            peg$savedPos = s0;
                                            s1 = peg$c55(s3, s7);
                                            s0 = s1;
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parselimitStageContent() {
        let s0, s1, s2, s3;
        s0 = peg$currPos;
        s1 = peg$parsews();
        if (s1 !== peg$FAILED) {
            s2 = peg$parsepositiveInteger();
            if (s2 !== peg$FAILED) {
                s3 = peg$parsews();
                if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c56(s2);
                    s0 = s1;
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parsecomparisonOperator() {
        let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
            s1 = peg$c7;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c8);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parsews();
            if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 36) {
                    s3 = peg$c9;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c10);
                    }
                }
                if (s3 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 2).toLowerCase() === peg$c57) {
                        s4 = input.substr(peg$currPos, 2);
                        peg$currPos += 2;
                    }
                    else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c58);
                        }
                    }
                    if (s4 === peg$FAILED) {
                        if (input.substr(peg$currPos, 2).toLowerCase() === peg$c59) {
                            s4 = input.substr(peg$currPos, 2);
                            peg$currPos += 2;
                        }
                        else {
                            s4 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c60);
                            }
                        }
                        if (s4 === peg$FAILED) {
                            if (input.substr(peg$currPos, 2).toLowerCase() === peg$c61) {
                                s4 = input.substr(peg$currPos, 2);
                                peg$currPos += 2;
                            }
                            else {
                                s4 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c62);
                                }
                            }
                            if (s4 === peg$FAILED) {
                                if (input.substr(peg$currPos, 3).toLowerCase() === peg$c63) {
                                    s4 = input.substr(peg$currPos, 3);
                                    peg$currPos += 3;
                                }
                                else {
                                    s4 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$c64);
                                    }
                                }
                                if (s4 === peg$FAILED) {
                                    if (input.substr(peg$currPos, 2).toLowerCase() === peg$c65) {
                                        s4 = input.substr(peg$currPos, 2);
                                        peg$currPos += 2;
                                    }
                                    else {
                                        s4 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$c66);
                                        }
                                    }
                                    if (s4 === peg$FAILED) {
                                        if (input.substr(peg$currPos, 3).toLowerCase() === peg$c67) {
                                            s4 = input.substr(peg$currPos, 3);
                                            peg$currPos += 3;
                                        }
                                        else {
                                            s4 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$c68);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parsews();
                        if (s5 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 58) {
                                s6 = peg$c13;
                                peg$currPos++;
                            }
                            else {
                                s6 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c14);
                                }
                            }
                            if (s6 !== peg$FAILED) {
                                s7 = peg$parsews();
                                if (s7 !== peg$FAILED) {
                                    s8 = peg$parseexpressionValue();
                                    if (s8 !== peg$FAILED) {
                                        s9 = peg$parsews();
                                        if (s9 !== peg$FAILED) {
                                            if (input.charCodeAt(peg$currPos) === 125) {
                                                s10 = peg$c15;
                                                peg$currPos++;
                                            }
                                            else {
                                                s10 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                    peg$fail(peg$c16);
                                                }
                                            }
                                            if (s10 !== peg$FAILED) {
                                                peg$savedPos = s0;
                                                s1 = peg$c69(s4, s8);
                                                s0 = s1;
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseconditionSeparated() {
        let s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        s1 = peg$parsews();
        if (s1 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 44) {
                s2 = peg$c2;
                peg$currPos++;
            }
            else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c3);
                }
            }
            if (s2 !== peg$FAILED) {
                s3 = peg$parsews();
                if (s3 !== peg$FAILED) {
                    s4 = peg$parsecondition();
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parsews();
                        if (s5 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$c54(s4);
                            s0 = s1;
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parsecondition() {
        let s0, s1, s2, s3, s4, s5;
        s0 = peg$currPos;
        s1 = peg$parsefieldReference();
        if (s1 !== peg$FAILED) {
            s2 = peg$parsews();
            if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 58) {
                    s3 = peg$c13;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c14);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s4 = peg$parsews();
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parseexpressionValue();
                        if (s5 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$c70(s1, s5);
                            s0 = s1;
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseexpressionValue() {
        let s0, s1;
        s0 = peg$parsefieldReference();
        if (s0 === peg$FAILED) {
            s0 = peg$parseexpression();
            if (s0 === peg$FAILED) {
                s0 = peg$parsestring();
                if (s0 === peg$FAILED) {
                    s0 = peg$parseboolean();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parsenull();
                        if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            s1 = peg$parsenumber();
                            if (s1 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$c71(s1);
                            }
                            s0 = s1;
                            if (s0 === peg$FAILED) {
                                s0 = peg$parseexpressionValueArray();
                            }
                        }
                    }
                }
            }
        }
        return s0;
    }
    function peg$parseexpression() {
        let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
            s1 = peg$c7;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c8);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = peg$parsews();
            if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 36) {
                    s3 = peg$c9;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c10);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s4 = peg$parseexpressionOperator();
                    if (s4 !== peg$FAILED) {
                        s5 = peg$parsews();
                        if (s5 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 58) {
                                s6 = peg$c13;
                                peg$currPos++;
                            }
                            else {
                                s6 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c14);
                                }
                            }
                            if (s6 !== peg$FAILED) {
                                s7 = peg$parsews();
                                if (s7 !== peg$FAILED) {
                                    s8 = peg$parseexpressionValue();
                                    if (s8 !== peg$FAILED) {
                                        s9 = peg$parsews();
                                        if (s9 !== peg$FAILED) {
                                            if (input.charCodeAt(peg$currPos) === 125) {
                                                s10 = peg$c15;
                                                peg$currPos++;
                                            }
                                            else {
                                                s10 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                    peg$fail(peg$c16);
                                                }
                                            }
                                            if (s10 !== peg$FAILED) {
                                                peg$savedPos = s0;
                                                s1 = peg$c69(s4, s8);
                                                s0 = s1;
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseexpressionOperator() {
        let s0;
        if (input.substr(peg$currPos, 3).toLowerCase() === peg$c72) {
            s0 = input.substr(peg$currPos, 3);
            peg$currPos += 3;
        }
        else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c73);
            }
        }
        if (s0 === peg$FAILED) {
            if (input.substr(peg$currPos, 8).toLowerCase() === peg$c74) {
                s0 = input.substr(peg$currPos, 8);
                peg$currPos += 8;
            }
            else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c75);
                }
            }
            if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 8).toLowerCase() === peg$c76) {
                    s0 = input.substr(peg$currPos, 8);
                    peg$currPos += 8;
                }
                else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c77);
                    }
                }
                if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 6).toLowerCase() === peg$c78) {
                        s0 = input.substr(peg$currPos, 6);
                        peg$currPos += 6;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c79);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 7).toLowerCase() === peg$c80) {
                            s0 = input.substr(peg$currPos, 7);
                            peg$currPos += 7;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c81);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 7).toLowerCase() === peg$c82) {
                                s0 = input.substr(peg$currPos, 7);
                                peg$currPos += 7;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c83);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 4).toLowerCase() === peg$c84) {
                                    s0 = input.substr(peg$currPos, 4);
                                    peg$currPos += 4;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$c85);
                                    }
                                }
                                if (s0 === peg$FAILED) {
                                    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c63) {
                                        s0 = input.substr(peg$currPos, 3);
                                        peg$currPos += 3;
                                    }
                                    else {
                                        s0 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$c64);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return s0;
    }
    function peg$parsefieldReference() {
        let s0, s1, s2, s3;
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c86) {
            s1 = peg$c86;
            peg$currPos += 2;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c87);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = [];
            if (peg$c88.test(input.charAt(peg$currPos))) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
            }
            else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c89);
                }
            }
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                if (peg$c88.test(input.charAt(peg$currPos))) {
                    s3 = input.charAt(peg$currPos);
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c89);
                    }
                }
            }
            if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 34) {
                    s3 = peg$c90;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c91);
                    }
                }
                if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c92(s2);
                    s0 = s1;
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parseidentifier() {
        let s0, s1, s2, s3, s4;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 34) {
            s1 = peg$c90;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c91);
            }
        }
        if (s1 === peg$FAILED) {
            s1 = null;
        }
        if (s1 !== peg$FAILED) {
            if (peg$c93.test(input.charAt(peg$currPos))) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
            }
            else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c94);
                }
            }
            if (s2 !== peg$FAILED) {
                s3 = [];
                if (peg$c95.test(input.charAt(peg$currPos))) {
                    s4 = input.charAt(peg$currPos);
                    peg$currPos++;
                }
                else {
                    s4 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c96);
                    }
                }
                while (s4 !== peg$FAILED) {
                    s3.push(s4);
                    if (peg$c95.test(input.charAt(peg$currPos))) {
                        s4 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c96);
                        }
                    }
                }
                if (s3 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 34) {
                        s4 = peg$c90;
                        peg$currPos++;
                    }
                    else {
                        s4 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c91);
                        }
                    }
                    if (s4 === peg$FAILED) {
                        s4 = null;
                    }
                    if (s4 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c97(s2, s3);
                        s0 = s1;
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parsenumber() {
        let s0;
        s0 = peg$parseinteger();
        if (s0 === peg$FAILED) {
            s0 = peg$parsefloat();
        }
        return s0;
    }
    function peg$parsepositiveInteger() {
        let s0, s1, s2;
        s0 = peg$currPos;
        s1 = [];
        if (peg$c98.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
        }
        else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c99);
            }
        }
        if (s2 !== peg$FAILED) {
            while (s2 !== peg$FAILED) {
                s1.push(s2);
                if (peg$c98.test(input.charAt(peg$currPos))) {
                    s2 = input.charAt(peg$currPos);
                    peg$currPos++;
                }
                else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c99);
                    }
                }
            }
        }
        else {
            s1 = peg$FAILED;
        }
        if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c100();
        }
        s0 = s1;
        return s0;
    }
    function peg$parseinteger() {
        let s0, s1, s2, s3;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 45) {
            s1 = peg$c101;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c102);
            }
        }
        if (s1 === peg$FAILED) {
            s1 = null;
        }
        if (s1 !== peg$FAILED) {
            s2 = [];
            if (peg$c98.test(input.charAt(peg$currPos))) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
            }
            else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c99);
                }
            }
            if (s3 !== peg$FAILED) {
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    if (peg$c98.test(input.charAt(peg$currPos))) {
                        s3 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c99);
                        }
                    }
                }
            }
            else {
                s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c100();
                s0 = s1;
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parsefloat() {
        let s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 45) {
            s1 = peg$c101;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c102);
            }
        }
        if (s1 === peg$FAILED) {
            s1 = null;
        }
        if (s1 !== peg$FAILED) {
            s2 = [];
            if (peg$c98.test(input.charAt(peg$currPos))) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
            }
            else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c99);
                }
            }
            if (s3 !== peg$FAILED) {
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    if (peg$c98.test(input.charAt(peg$currPos))) {
                        s3 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c99);
                        }
                    }
                }
            }
            else {
                s2 = peg$FAILED;
            }
            if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 46) {
                    s3 = peg$c103;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c104);
                    }
                }
                if (s3 !== peg$FAILED) {
                    s4 = [];
                    if (peg$c98.test(input.charAt(peg$currPos))) {
                        s5 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c99);
                        }
                    }
                    if (s5 !== peg$FAILED) {
                        while (s5 !== peg$FAILED) {
                            s4.push(s5);
                            if (peg$c98.test(input.charAt(peg$currPos))) {
                                s5 = input.charAt(peg$currPos);
                                peg$currPos++;
                            }
                            else {
                                s5 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c99);
                                }
                            }
                        }
                    }
                    else {
                        s4 = peg$FAILED;
                    }
                    if (s4 !== peg$FAILED) {
                        s5 = peg$currPos;
                        if (input.substr(peg$currPos, 1).toLowerCase() === peg$c105) {
                            s6 = input.charAt(peg$currPos);
                            peg$currPos++;
                        }
                        else {
                            s6 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$c106);
                            }
                        }
                        if (s6 === peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 69) {
                                s6 = peg$c107;
                                peg$currPos++;
                            }
                            else {
                                s6 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c108);
                                }
                            }
                        }
                        if (s6 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 43) {
                                s7 = peg$c109;
                                peg$currPos++;
                            }
                            else {
                                s7 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$c110);
                                }
                            }
                            if (s7 === peg$FAILED) {
                                if (input.charCodeAt(peg$currPos) === 45) {
                                    s7 = peg$c101;
                                    peg$currPos++;
                                }
                                else {
                                    s7 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$c102);
                                    }
                                }
                            }
                            if (s7 === peg$FAILED) {
                                s7 = null;
                            }
                            if (s7 !== peg$FAILED) {
                                s8 = [];
                                if (peg$c98.test(input.charAt(peg$currPos))) {
                                    s9 = input.charAt(peg$currPos);
                                    peg$currPos++;
                                }
                                else {
                                    s9 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$c99);
                                    }
                                }
                                if (s9 !== peg$FAILED) {
                                    while (s9 !== peg$FAILED) {
                                        s8.push(s9);
                                        if (peg$c98.test(input.charAt(peg$currPos))) {
                                            s9 = input.charAt(peg$currPos);
                                            peg$currPos++;
                                        }
                                        else {
                                            s9 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$c99);
                                            }
                                        }
                                    }
                                }
                                else {
                                    s8 = peg$FAILED;
                                }
                                if (s8 !== peg$FAILED) {
                                    s6 = [s6, s7, s8];
                                    s5 = s6;
                                }
                                else {
                                    peg$currPos = s5;
                                    s5 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s5;
                                s5 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s5;
                            s5 = peg$FAILED;
                        }
                        if (s5 === peg$FAILED) {
                            s5 = null;
                        }
                        if (s5 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$c111();
                            s0 = s1;
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        return s0;
    }
    function peg$parsestring() {
        let s0, s1, s2, s3;
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 34) {
            s1 = peg$c90;
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c91);
            }
        }
        if (s1 !== peg$FAILED) {
            s2 = [];
            if (peg$c88.test(input.charAt(peg$currPos))) {
                s3 = input.charAt(peg$currPos);
                peg$currPos++;
            }
            else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c89);
                }
            }
            while (s3 !== peg$FAILED) {
                s2.push(s3);
                if (peg$c88.test(input.charAt(peg$currPos))) {
                    s3 = input.charAt(peg$currPos);
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c89);
                    }
                }
            }
            if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 34) {
                    s3 = peg$c90;
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c91);
                    }
                }
                if (s3 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c112(s2);
                    s0 = s1;
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        else {
            peg$currPos = s0;
            s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 39) {
                s1 = peg$c113;
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c114);
                }
            }
            if (s1 !== peg$FAILED) {
                s2 = [];
                if (peg$c115.test(input.charAt(peg$currPos))) {
                    s3 = input.charAt(peg$currPos);
                    peg$currPos++;
                }
                else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$c116);
                    }
                }
                while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    if (peg$c115.test(input.charAt(peg$currPos))) {
                        s3 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c116);
                        }
                    }
                }
                if (s2 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 39) {
                        s3 = peg$c113;
                        peg$currPos++;
                    }
                    else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$c114);
                        }
                    }
                    if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c112(s2);
                        s0 = s1;
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                }
                else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                }
            }
            else {
                peg$currPos = s0;
                s0 = peg$FAILED;
            }
        }
        return s0;
    }
    function peg$parseboolean() {
        let s0, s1;
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4).toLowerCase() === peg$c117) {
            s1 = input.substr(peg$currPos, 4);
            peg$currPos += 4;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c118);
            }
        }
        if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c119();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 5).toLowerCase() === peg$c120) {
                s1 = input.substr(peg$currPos, 5);
                peg$currPos += 5;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c121);
                }
            }
            if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c122();
            }
            s0 = s1;
        }
        return s0;
    }
    function peg$parsenull() {
        let s0, s1;
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 4).toLowerCase() === peg$c123) {
            s1 = input.substr(peg$currPos, 4);
            peg$currPos += 4;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c124);
            }
        }
        if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c125();
        }
        s0 = s1;
        return s0;
    }
    function peg$parsews() {
        let s0, s1;
        peg$silentFails++;
        s0 = [];
        if (peg$c127.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
        }
        else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c128);
            }
        }
        while (s1 !== peg$FAILED) {
            s0.push(s1);
            if (peg$c127.test(input.charAt(peg$currPos))) {
                s1 = input.charAt(peg$currPos);
                peg$currPos++;
            }
            else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                    peg$fail(peg$c128);
                }
            }
        }
        peg$silentFails--;
        if (s0 === peg$FAILED) {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
                peg$fail(peg$c126);
            }
        }
        return s0;
    }
    peg$result = peg$startRuleFunction();
    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
        return peg$result;
    }
    else {
        if (peg$result !== peg$FAILED && peg$currPos < input.length) {
            peg$fail(peg$endExpectation());
        }
        throw peg$buildStructuredError(peg$maxFailExpected, peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null, peg$maxFailPos < input.length
            ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
            : peg$computeLocation(peg$maxFailPos, peg$maxFailPos));
    }
}
exports.parse = peg$parse;
//# sourceMappingURL=mongo-aggregation-parser.js.map