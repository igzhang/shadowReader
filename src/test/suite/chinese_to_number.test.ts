import * as assert from 'assert';
import { convertChineseToNumber } from '../../chinese_to_number';

suite('Extension Test Suite', () => {

	test('chinese to number test', () => {
		assert.strictEqual(1, convertChineseToNumber("一"));
		assert.strictEqual(11, convertChineseToNumber("十一"));
		assert.strictEqual(34, convertChineseToNumber("三十四"));
		assert.strictEqual(50, convertChineseToNumber("五十"));
		assert.strictEqual(101, convertChineseToNumber("一百零一"));
		assert.strictEqual(619, convertChineseToNumber("六百一十九"));
		assert.strictEqual(807, convertChineseToNumber("八百零七"));
		assert.strictEqual(2006, convertChineseToNumber("二千零六"));
		assert.strictEqual(12006, convertChineseToNumber("一万二千零六"));
		assert.strictEqual(12345, convertChineseToNumber("12345"));
		assert.strictEqual(134, convertChineseToNumber("一三四"));
	});
});
