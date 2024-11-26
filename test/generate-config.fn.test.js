"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions_1 = require("../lib/functions");
describe('GenerateConfig FN', () => {
    it('should generate a config', async () => {
        expect((0, functions_1.generateConfig)({})).not.toEqual({});
    });
    it('should generate a configs', async () => {
        expect((0, functions_1.generateConfig)({
            wp: {
                path: 'test/fixtures/plugin-with-assets',
            },
        })).not.toEqual({});
    });
});
//# sourceMappingURL=generate-config.fn.test.js.map