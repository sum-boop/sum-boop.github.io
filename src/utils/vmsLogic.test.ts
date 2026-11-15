import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CORRIDOR_COORDS,
  computeNodeSeparation,
  resolveSiteFromName,
  resolveVmsModeForCategory,
} from './vmsLogic';

test('resolveVmsModeForCategory maps deployment categories to VMS views', () => {
  assert.equal(resolveVmsModeForCategory('Forensics'), 'playback');
  assert.equal(resolveVmsModeForCategory('Loss Prevention'), 'alarms');
  assert.equal(resolveVmsModeForCategory('Emergency'), 'alarms');
  assert.equal(resolveVmsModeForCategory('Perimeter'), 'smart-map');
  assert.equal(resolveVmsModeForCategory('All deployments'), 'live');
  assert.equal(resolveVmsModeForCategory('Surveillance'), 'live');
});

test('resolveSiteFromName distinguishes Flipkart and Ekart sites', () => {
  assert.equal(resolveSiteFromName('Flipkart Kalash Mega Hub'), 'flipkart');
  assert.equal(resolveSiteFromName('Ekart Logistics'), 'ekart');
});

test('corridor nodes have clear spatial separation without overlap', () => {
  const dist = computeNodeSeparation(CORRIDOR_COORDS.flipkart, CORRIDOR_COORDS.ekart);
  assert.ok(dist >= 25, `Expected node separation >= 25%, got ${dist}`);
});
