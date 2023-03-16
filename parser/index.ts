import tspegjs from "https://esm.sh/ts-pegjs@3.1.0";
import peggy from "https://esm.sh/peggy@3.0.1";

// import * as mod from "https://deno.land/std@0.170.0/node/path.ts";

interface Group {
  _id: string;
  field: string;
  aggregation: string;
}

class GroupParser {
  private parser: any;

  constructor() {
    this.parser = peggy.generate(
      `
      start
        = group

      group
        = "{" _ "$group:" _ "{" _ "_id:" identifier "," identifierNoQuote":" _ "{" aggregation "}" _ "}" _ "}" 

      identifier
        = _ "\\"$" key:[a-zA-Z0-9]+ "\\"" _ { return key.join(''); }

      identifierNoQuote
        = _ key:[a-zA-Z0-9]+ _ { return key.join(''); }

      aggregation
        = _ "$sum:" id:identifier { return { type: 'sum', field: id }}
        / _ "$avg:" id:identifier { return { type: 'avg', field: id }}
        / _ "$first:" id:identifier { return { type: 'first', field: id }}
        / _ "$last:" id:identifier { return { type: 'last', field: id }}
        / _ "$max:" id:identifier { return { type: 'max', field: id }}
        / _ "$min:" id:identifier { return { type: 'min', field: id }}
        / _ "$push:" id:identifier { return { type: 'push', field: id }}
        / _ "$addToSet:" id:identifier { return { type: 'addToSet', field: id }}

      _ "whitespace"
      = [ \\t\\n\\r]* { return null }
    `,
      {
        output: "source",
        format: "commonjs",
        plugins: [tspegjs],
      }
    );
    console.log(this.parser);
  }

  public parse(input: string): unknown {
    return this.parser.parse(input);
  }
}

console.log(new GroupParser());

export default GroupParser;
