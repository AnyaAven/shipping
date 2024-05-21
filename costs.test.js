import { test, beforeAll, afterAll, expect, vi } from "vitest";
import { getCost } from "./costs.js";
import * as discount from "./discounts.js"


beforeAll(function () {
  // observe calls & make it possible to mock
  vi.spyOn(discount, "getRandomDiscount");
});

afterAll(function () {
  vi.restoreAllMocks();
});

test("cheap product", function () {
  discount.getRandomDiscount.mockReturnValue(0.1)

  // cheap products have IDs between 1000-1999, and cost $100 * discount
  const cost = getCost(1200);
  expect(cost).toBe("90.00");
});

test("expensive product", function () {
  discount.getRandomDiscount.mockReturnValue(0.1)

  // expensive products have IDs greater than 2000, and cost $200 * discount
  const cost = getCost(2500);
  expect(cost).toBe("180.00");
});

test("only runs once", function(){
  discount.getRandomDiscount.mockClear();
  getCost(1000)
  expect(discount.getRandomDiscount).toHaveBeenCalledTimes(1);
})