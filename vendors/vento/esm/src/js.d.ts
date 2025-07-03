type breakpoints = "new-filter" | "open-bracket" | "close" | "unclosed";
type Visitor = (type: breakpoints, index: number) => false | void;
export default function analyze(source: string, visitor: Visitor): void;
export {};
//# sourceMappingURL=js.d.ts.map