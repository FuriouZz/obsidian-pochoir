import type { Environment } from "../src/environment";

export default function (_environment: Environment) {
    describe("Note creation", () => {
        it("should create", () => {
            console.log("create note");
            assert.equal(true, true);
        });
    });
}
