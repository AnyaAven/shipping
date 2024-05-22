import { describe, test, expect, beforeAll, afterAll, vi }
  from "vitest";
import * as shipping from "../shipItApi.js";
import request from "supertest";
import app from "../app.js";

beforeAll(function () {
  // observe calls & make it possible to mock
  vi.spyOn(shipping, "shipViaShipIt");
});

afterAll(function () {
  vi.restoreAllMocks();
});

describe("POST /orders/:id/ship", function () {
  test("valid", async function () {
    //Forces tracking number to be 123
    shipping.shipViaShipIt.mockReturnValue(123);

    const resp = await request(app).post("/orders/123/ship").send({
      productId: 1000,
      name: "Test Tester",
      addr: "100 Test St",
      zip: "12345-6789",
    });

    expect(resp.body).toEqual({
      cost: expect.any(String),
      trackingId: 123,
      orderId: 123,
    });
  });

  test("throws error if empty request body", async function () {
    const resp = await request(app)
      .post("/orders/123/ship")
      .send();
    expect(resp.statusCode).toEqual(400);
  });

  test("throws error if required fields aren't sent", async function () {
    const resp = await request(app).post("/orders/123/ship").send({
      productId: 1000,
      name: "Test Tester",
      addr: "100 Test St",
    });

    expect(resp.body).toEqual({ "error": expect.any(Object) });
    expect(resp.statusCode).toEqual(400);
  });

  test("invalid with additional properties", async function () {
    const resp = await request(app).post("/orders/123/ship").send({
      productId: 1000,
      name: "Test Tester",
      addr: "100 Test St",
      zip: "12345-6789",
      unexpectedAdditionalProperty: "oh nooesss!!!"
    });

    expect(resp.body.error.message).toEqual(
      [`instance is not allowed to have the additional property ` +
      `"unexpectedAdditionalProperty"`])
    expect(resp.statusCode).toEqual(400);
  });

  test("invalid zipcode", async function () {
    const resp = await request(app).post("/orders/123/ship").send({
      productId: 1000,
      name: "Test Tester",
      addr: "100 Test St",
      zip: "123-333",
    });

    expect(resp.body.error.message[0])
      .toContain("instance.zip does not match pattern")

    expect(resp.statusCode).toEqual(400);
  });
});
