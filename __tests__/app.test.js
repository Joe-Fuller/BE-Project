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

describe("GET /api/users", () => {
  it("status:200, responds with an array of users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).toBeInstanceOf(Array);
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
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
            comment_count: "3",
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

describe("PATCH /api/reviews/:review_id", () => {
  it("status: 200, updates the votes on specified review and returns review", () => {
    return request(app)
      .patch("/api/reviews/1")
      .send({ inc_votes: 10 })
      .expect(200)
      .then(({ body: { review } }) => {
        expect(review).toEqual({
          review_id: 1,
          title: "Agricola",
          designer: "Uwe Rosenberg",
          owner: "mallionaire",
          review_img_url:
            "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
          review_body: "Farmyard fun!",
          category: "euro game",
          created_at: expect.any(String),
          votes: 11,
        });
      });
  });

  it("status: 400, Bad Request when no inc_votes on body", () => {
    return request(app)
      .patch("/api/reviews/1")
      .send({})
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  it("status: 400, Bad Request when invalid inc_votes value", () => {
    return request(app)
      .patch("/api/reviews/1")
      .send({ inc_votes: "cat" })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  it("status: 400, Bad Request when invalid inc_votes value", () => {
    return request(app)
      .patch("/api/reviews/1")
      .send({ inc_votes: "cat" })
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  it("status: 200, ignores extra keys on body", () => {
    return request(app)
      .patch("/api/reviews/1")
      .send({ inc_votes: 10, something_else: "aaaahhh" })
      .expect(200)
      .then(({ body: { review } }) => {
        expect(review).toEqual({
          review_id: 1,
          title: "Agricola",
          designer: "Uwe Rosenberg",
          owner: "mallionaire",
          review_img_url:
            "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
          review_body: "Farmyard fun!",
          category: "euro game",
          created_at: expect.any(String),
          votes: 11,
        });
      });
  });
});

describe("GET /api/reviews", () => {
  it("status: 200, responds with an array of reviews", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toBeInstanceOf(Array);
        expect(reviews).toHaveLength(13);
        reviews.forEach((review) => {
          expect(review).toEqual(
            expect.objectContaining({
              owner: expect.any(String),
              title: expect.any(String),
              review_id: expect.any(Number),
              category: expect.any(String),
              review_img_url: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              designer: expect.any(String),
              review_body: expect.any(String),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });

  it("sorted by 'created_at' in descending order by default", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then(({ body: { reviews } }) => {
        expect(reviews).toBeSortedBy("created_at", { descending: true });
      });
  });

  it("accepts optional 'category' query, filtering results to only results with the specified category", () => {
    return request(app)
      .get("/api/reviews?category=euro game")
      .expect(200)
      .then(({ body: { reviews } }) => {
        reviews.forEach((review) => {
          expect(review.category).toBe("euro game");
        });
      });
  });

  it("status: 400, category exists but has no reviews", () => {
    return request(app)
      .get("/api/reviews?category=children's games")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("No Reviews In That Category");
      });
  });

  it("status: 404, rejects invalid categories", () => {
    return request(app)
      .get("/api/reviews?category=bananas")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Category Not Found");
      });
  });
});

describe("GET /api/reviews/:review_id/comments", () => {
  it("status: 200, responds with an array of comments for the given review id", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeInstanceOf(Array);
        expect(comments).toHaveLength(3);
        comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              review_id: expect.any(Number),
            })
          );
        });
      });
  });

  it("status: 200, review has no comments", () => {
    return request(app)
      .get("/api/reviews/1/comments")
      .expect(200)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("No Comments Found For This Review");
      });
  });

  it("comments are sorted by most recent first", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy("created_at", { descending: true });
      });
  });

  it("status: 400, invalid review_id", () => {
    return request(app)
      .get("/api/reviews/bananas/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  it("status: 404, review_id not found", () => {
    return request(app)
      .get("/api/reviews/9999/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not Found");
      });
  });
});

describe("POST /api/reviews/:review_id/comments", () => {
  it("status: 201, posts a new comment and returns it", () => {
    return request(app)
      .post("/api/reviews/2/comments")
      .send({
        username: "bainesface",
        body: "it's not geology but it rocks",
      })
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toEqual({
          author: "bainesface",
          body: "it's not geology but it rocks",
          votes: 0,
          review_id: expect.any(Number),
          created_at: expect.any(String),
          comment_id: expect.any(Number),
        });
      });
  });

  it("status: 400, invalid review_id", () => {
    return request(app)
      .post("/api/reviews/bananas/comments")
      .send({})
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  it("status: 400, missing required fields on body", () => {
    return request(app)
      .post("/api/reviews/2/comments")
      .send({})
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad Request");
      });
  });

  it("status: 404, review_id not found", () => {
    return request(app)
      .post("/api/reviews/9999/comments")
      .send({ body: "waa", username: "wahoo" })
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
