export interface FilePosition {
    offset: number;
    line: number;
    column: number;
}
export interface FileRange {
    start: FilePosition;
    end: FilePosition;
    source: string;
}
export interface LiteralExpectation {
    type: 'literal';
    text: string;
    ignoreCase: boolean;
}
export interface ClassParts extends Array<string | ClassParts> {
}
export interface ClassExpectation {
    type: 'class';
    parts: ClassParts;
    inverted: boolean;
    ignoreCase: boolean;
}
export interface AnyExpectation {
    type: 'any';
}
export interface EndExpectation {
    type: 'end';
}
export interface OtherExpectation {
    type: 'other';
    description: string;
}
export type Expectation = LiteralExpectation | ClassExpectation | AnyExpectation | EndExpectation | OtherExpectation;
export declare class PeggySyntaxError extends Error {
    static buildMessage(expected: Expectation[], found: string | null): string;
    message: string;
    expected: Expectation[];
    found: string | null;
    location: FileRange;
    name: string;
    constructor(message: string, expected: Expectation[], found: string | null, location: FileRange);
    format(sources: {
        grammarSource?: string;
        text: string;
    }[]): string;
}
export interface ParseOptions {
    filename?: string;
    startRule?: string;
    tracer?: any;
    [key: string]: any;
}
export type ParseFunction = (input: string, options?: ParseOptions) => any;
export declare const parse: ParseFunction;
