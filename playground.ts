import { getSupportInfo } from "npm:prettier@3.5.3";

export const getDefaultPrettierOptions = async (): Promise<unknown> => {
  return (await getSupportInfo()).options.reduce(
    (prev, curr) => {
      return curr.name === undefined
        ? prev
        : { ...prev, [curr.name]: curr.default };
    },
    {},
  );
};

import { expect } from "jsr:@std/expect@1";

Deno.test("getDefaultPrettierOptions", async () => {
  const actual = await getDefaultPrettierOptions();
  const expected = {
    arrowParens: "always",
    bracketSameLine: false,
    bracketSpacing: true,
    cursorOffset: -1,
    embeddedLanguageFormatting: "auto",
    endOfLine: "lf",
    experimentalOperatorPosition: "end",
    experimentalTernaries: false,
    filepath: undefined,
    htmlWhitespaceSensitivity: "css",
    insertPragma: false,
    jsxSingleQuote: false,
    objectWrap: "preserve",
    parser: undefined,
    plugins: [],
    printWidth: 80,
    proseWrap: "preserve",
    quoteProps: "as-needed",
    rangeEnd: Infinity,
    rangeStart: 0,
    requirePragma: false,
    semi: true,
    singleAttributePerLine: false,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "all",
    useTabs: false,
    vueIndentScriptAndStyle: false,
  };
  expect(actual).toStrictEqual(expected);
});
