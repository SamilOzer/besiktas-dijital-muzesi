// Run with node scripts/check-contribution-category.cjs; uses isolated in-memory storage.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const storage = new Map();
const source = fs.readFileSync(path.join(__dirname, '../lib/contribution-store.ts'), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
function loadStore() {
  const scope = {
    exports: {}, window: {}, console,
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  };
  vm.runInNewContext(outputText, scope);
  return scope.exports;
}
const store = loadStore();
const added = store.addContribution({
  type: 'ansiklopedi', submitterName: 'Test', submitterEmail: 'test@example.com',
  eventTitle: 'Deniz ulaşımı', eventCategory: 'diger', eventCategoryLabel: 'Denizcilik tarihi',
});
const freshStore = loadStore();
const restored = freshStore.getContributions().find(item => item.id === added.id);
assert.equal(restored.eventCategory, 'diger');
assert.equal(restored.eventCategoryLabel, 'Denizcilik tarihi');
assert.equal(restored.status, 'pending');
freshStore.updateContribution(added.id, { eventCategoryLabel: 'Deniz ulaşımı tarihi' });
assert.equal(loadStore().getContributions().find(item => item.id === added.id).eventCategoryLabel, 'Deniz ulaşımı tarihi');
console.log('PASS: custom category survives submission, reload and editor changes.');
