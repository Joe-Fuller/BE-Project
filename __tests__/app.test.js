const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");

afterAll(() => {
  if (db.end) db.end();
});

beforeEach(() => {
  return seed(data);
});

describe("GET /api/categories", () => {
  it("status: 200, responds with an array of categories", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then(({ body: { categories } }) => {
        expect(categories).toBeInstanceOf(Array);
        expect(categories).toHaveLength(4);
        categories.forEach((category) => {
          expect(category).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });
});

describe("GET /api/reviews/:review_id", () => {
  it("status: 200, responds with a review object", () => {
    return request(app)
      .get("/api/reviews/2")
      .expect(200)
      .then(({ body: { review } }) => {
        expect(review).toBeInstanceOf(Object);
        expect(review).toEqual(
          expect.objectContaining({
            review_id: 2,
            title: "Jenga",
            designer: "Leslie Scott",
            owner: "philippaclaire9",
            review_img_url:
              "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
            review_body: "Fiddly fun for all the family",
            category: "dexterity",
            created_at: expect.any(String),
            votes: 5,
          })
        );
      });
  });

  it("status: 400, Bad Request", () => {
    return request(app)
      .get("/api/reviews/bananas")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  it("status: 404, Not Found", () => {
    return request(app)
      .get("/api/reviews/99999")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not Found");
      });
  });
});

describe("Errors", () => {
  it("status: 404, Not Found", () => {
    return request(app)
      .get("/api/bananas")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not Found");
      });
  });
});
