/** Return type for {@linkcode Extractor}. */
export type Extract<T> = {
    frontMatter: string;
    body: string;
    attrs: T;
};
/** Function return type for {@linkcode createExtractor}. */
export type Extractor = <T = Record<string, unknown>>(str: string) => Extract<T>;
/** Parser function type used alongside {@linkcode createExtractor}. */
export type Parser = <T = Record<string, unknown>>(str: string) => T;
/**
 * Factory that creates a function that extracts front matter from a string with the given parsers.
 * Supports YAML, TOML and JSON.
 *
 * @param formats A descriptor containing Format-parser pairs to use for each format.
 * @returns A function that extracts front matter from a string with the given parsers.
 *
 * ```ts
 * import { createExtractor, Parser } from "https://deno.land/std@$STD_VERSION/front_matter/mod.ts";
 * import { assertEquals } from "https://deno.land/std@$STD_VERSION/assert/assert_equals.ts";
 * import { parse as parseYAML } from "https://deno.land/std@$STD_VERSION/yaml/parse.ts";
 * import { parse as parseTOML } from "https://deno.land/std@$STD_VERSION/toml/parse.ts";
 * const extractYAML = createExtractor({ yaml: parseYAML as Parser });
 * const extractTOML = createExtractor({ toml: parseTOML as Parser });
 * const extractJSON = createExtractor({ json: JSON.parse as Parser });
 * const extractYAMLOrJSON = createExtractor({
 *     yaml: parseYAML as Parser,
 *     json: JSON.parse as Parser,
 * });
 *
 * let { attrs, body, frontMatter } = extractYAML<{ title: string }>("---\ntitle: Three dashes marks the spot\n---\nferret");
 * assertEquals(attrs.title, "Three dashes marks the spot");
 * assertEquals(body, "ferret");
 * assertEquals(frontMatter, "title: Three dashes marks the spot");
 *
 * ({ attrs, body, frontMatter } = extractTOML<{ title: string }>("---toml\ntitle = 'Three dashes followed by format marks the spot'\n---\n"));
 * assertEquals(attrs.title, "Three dashes followed by format marks the spot");
 * assertEquals(body, "");
 * assertEquals(frontMatter, "title = 'Three dashes followed by format marks the spot'");
 *
 * ({ attrs, body, frontMatter } = extractJSON<{ title: string }>("---json\n{\"title\": \"Three dashes followed by format marks the spot\"}\n---\ngoat"));
 * assertEquals(attrs.title, "Three dashes followed by format marks the spot");
 * assertEquals(body, "goat");
 * assertEquals(frontMatter, "{\"title\": \"Three dashes followed by format marks the spot\"}");
 *
 * ({ attrs, body, frontMatter } = extractYAMLOrJSON<{ title: string }>("---\ntitle: Three dashes marks the spot\n---\nferret"));
 * assertEquals(attrs.title, "Three dashes marks the spot");
 * assertEquals(body, "ferret");
 * assertEquals(frontMatter, "title: Three dashes marks the spot");
 *
 * ({ attrs, body, frontMatter } = extractYAMLOrJSON<{ title: string }>("---json\n{\"title\": \"Three dashes followed by format marks the spot\"}\n---\ngoat"));
 * assertEquals(attrs.title, "Three dashes followed by format marks the spot");
 * assertEquals(body, "goat");
 * assertEquals(frontMatter, "{\"title\": \"Three dashes followed by format marks the spot\"}");
 * ```
 */
export declare function createExtractor(formats: Partial<Record<"yaml" | "toml" | "json" | "unknown", Parser>>): Extractor;
//# sourceMappingURL=create_extractor.d.ts.map