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

describe("GET", () => {
  describe("/api", () => {
    describe("Functionality", () => {
      it("status: 200, returns JSON describing all endpoints of the api", () => {
        return request(app)
          .get("/api")
          .expect(200)
          .then(({ body: { api } }) => {
            expect(api).toBeInstanceOf(Object);
          });
      });
    });
  });

  describe("/api/categories", () => {
    describe("Functionality", () => {
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
  });

  describe("/api/users", () => {
    describe("Functionality", () => {
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
  });

  describe("/api/users/:username", () => {
    describe("Functionality", () => {
      it("status: 200, responds with the specified user object", () => {
        return request(app)
          .get("/api/users/bainesface")
          .expect(200)
          .then(({ body: { user } }) => {
            expect(user).toBeInstanceOf(Object);
            expect(user).toEqual({
              username: "bainesface",
              name: "sarah",
              avatar_url:
                "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
            });
          });
      });
    });
    describe("Error Handling", () => {
      it("status: 404, Not Found", () => {
        return request(app)
          .get("/api/users/mrfakename")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("User Not Found");
          });
      });
    });
  });

  describe.only("/api/reviews", () => {
    describe("Functionality", () => {
      it("status: 200, responds with an array of reviews", () => {
        return request(app)
          .get("/api/reviews")
          .expect(200)
          .then(({ body }) => {
            expect(body.total_count).toBe(13);
            const reviews = body.reviews;
            expect(reviews).toBeInstanceOf(Array);
            expect(reviews).toHaveLength(10);
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

      it("accepts query 'category', filtering results to only results with the specified category", () => {
        return request(app)
          .get("/api/reviews?category=euro%20game")
          .expect(200)
          .then(({ body: { reviews } }) => {
            reviews.forEach((review) => {
              expect(review.category).toBe("euro game");
            });
          });
      });

      it("accepts query 'sort_by', sorting by any valid column (defaulting to date)", () => {
        return request(app)
          .get("/api/reviews?sort_by=owner")
          .expect(200)
          .then(({ body: { reviews } }) => {
            expect(reviews).toBeSortedBy("owner", { descending: true });
          });
      });

      it("accepts query 'order', ordering in asc or desc (defaulting to desc)", () => {
        return request(app)
          .get("/api/reviews?order=asc")
          .expect(200)
          .then(({ body: { reviews } }) => {
            expect(reviews).toBeSortedBy("created_at", { ascending: true });
          });
      });

      it("handles several queries at once", () => {
        return request(app)
          .get(
            "/api/reviews?category=social%20deduction&sort_by=title&order=asc"
          )
          .expect(200)
          .then(({ body: { reviews } }) => {
            expect(reviews).toBeSortedBy("title", { ascending: true });
            reviews.forEach((review) => {
              expect(review.category).toBe("social deduction");
            });
          });
      });

      it("accepts query 'limit', which limits the number of responses (defaulting to 10)", () => {
        return request(app)
          .get("/api/reviews?limit=5")
          .expect(200)
          .then(({ body: { reviews } }) => {
            expect(reviews).toHaveLength(5);
          });
      });

      it("accepts query 'p', which determines page number to start at (defaulting to 1)", () => {
        return request(app)
          .get("/api/reviews?p=2")
          .expect(200)
          .then(({ body: { reviews } }) => {
            expect(reviews).toHaveLength(3);
          });
      });
    });

    describe("Error Handling", () => {
      it("status: 400, category exists but has no reviews", () => {
        return request(app)
          .get("/api/reviews?category=children's%20games")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("No Reviews Found");
          });
      });

      it("status: 404, rejects invalid category", () => {
        return request(app)
          .get("/api/reviews?category=bananas")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Category Not Found");
          });
      });

      it("status: 404, rejects invalid sort_by", () => {
        return request(app)
          .get("/api/reviews?sort_by=bananas")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Column Not Found");
          });
      });

      it("status: 400, rejects invalid order", () => {
        return request(app)
          .get("/api/reviews?order=bananas")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Order must be 'asc' or 'desc'");
          });
      });

      it("status: 400, rejects invalid limit", () => {
        return request(app)
          .get("/api/reviews?limit=-10")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Limit must be positive");
          });
      });

      it("status: 400, rejects invalid p", () => {
        return request(app)
          .get("/api/reviews?p=-10")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("p must be positive");
          });
      });
    });
  });

  describe("/api/reviews/:review_id", () => {
    describe("Functionality", () => {
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
    });

    describe("Error Handling", () => {
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
  });

  describe("/api/reviews/:review_id/comments", () => {
    describe("Functionality", () => {
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

      it("accepts query 'limit', which limits the number of responses (defaulting to 10)", () => {
        return request(app)
          .get("/api/reviews/2/comments?limit=5")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).toHaveLength(3);
          });
      });

      it("accepts query 'p', which determines page number to start at (defaulting to 1)", () => {
        return request(app)
          .get("/api/reviews/2/comments?limit=2&p=2")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).toHaveLength(1);
          });
      });
    });

    describe("Error Handling", () => {
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

      it("status: 400, rejects invalid limit", () => {
        return request(app)
          .get("/api/reviews/2/comments?limit=-10")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Limit must be positive");
          });
      });

      it("status: 400, rejects invalid p", () => {
        return request(app)
          .get("/api/reviews/2/comments?p=-10")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("p must be positive");
          });
      });
    });
  });
});

describe("POST", () => {
  describe("/api/categories", () => {
    describe("Functionality", () => {
      it("status: 201, adds a new category and returns it", () => {
        return request(app)
          .post("/api/categories")
          .send({
            slug: "roguelike",
            description: "The hardest board games you'll ever play",
          })
          .expect(201)
          .then(({ body: { category } }) => {
            expect(category).toEqual({
              slug: "roguelike",
              description: "The hardest board games you'll ever play",
            });
          });
      });
    });

    describe("Error Handling", () => {
      it("status: 400, missing required fields on body", () => {
        return request(app)
          .post("/api/categories")
          .send({})
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Missing Required Fields");
          });
      });
    });
  });

  describe("/api/reviews", () => {
    describe("Functionality", () => {
      it("status: 201, posts a new review and returns it", () => {
        return request(app)
          .post("/api/reviews")
          .send({
            owner: "mallionaire",
            title: "Blokus",
            review_body: "it's GOOD!",
            designer: "Bernard Tavitian",
            category: "euro game",
          })
          .expect(201)
          .then(({ body: { review } }) => {
            expect(review).toEqual({
              owner: "mallionaire",
              title: "Blokus",
              review_body: "it's GOOD!",
              designer: "Bernard Tavitian",
              category: "euro game",
              review_id: 14,
              review_img_url:
                "https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg",
              votes: 0,
              created_at: expect.any(String),
              //comment_count: 0,
            });
          });
      });
    });
    describe("Error Handling", () => {
      it("status: 400, missing required fields", () => {
        return request(app)
          .post("/api/reviews")
          .send({})
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Missing Required Fields");
          });
      });
      it("status: 400, invalid username", () => {
        return request(app)
          .post("/api/reviews")
          .send({
            owner: "joe",
            title: "Blokus",
            review_body: "it's GOOD!",
            designer: "Bernard Tavitian",
            category: "euro game",
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Invalid Username");
          });
      });
      it("status: 400, invalid category", () => {
        return request(app)
          .post("/api/reviews")
          .send({
            owner: "mallionaire",
            title: "Blokus",
            review_body: "it's GOOD!",
            designer: "Bernard Tavitian",
            category: "fakecategory",
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Invalid Category");
          });
      });
    });
  });

  describe("/api/reviews/:review_id/comments", () => {
    describe("Functionality", () => {
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
    });

    describe("Error Handling", () => {
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
  });
});

describe("PATCH", () => {
  describe("/api/comments/:comment_id", () => {
    describe("Functionality", () => {
      it("status: 200, updates the votes on specified comment and returns comment", () => {
        return request(app)
          .patch("/api/comments/1")
          .send({ inc_votes: 10 })
          .expect(200)
          .then(({ body: { comment } }) => {
            expect(comment).toEqual({
              comment_id: 1,
              body: "I loved this game too!",
              votes: 26,
              author: "bainesface",
              review_id: 2,
              created_at: expect.any(String),
            });
          });
      });
      it("status: 200, ignores extra keys on body", () => {
        return request(app)
          .patch("/api/comments/1")
          .send({ inc_votes: 10, something_else: "aaaahhh" })
          .expect(200)
          .then(({ body: { comment } }) => {
            expect(comment).toEqual({
              comment_id: 1,
              body: "I loved this game too!",
              votes: 26,
              author: "bainesface",
              review_id: 2,
              created_at: expect.any(String),
            });
          });
      });
    });

    describe("Error Handling", () => {
      it("status: 400, Bad Request when no inc_votes on body", () => {
        return request(app)
          .patch("/api/comments/1")
          .send({})
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Bad Request");
          });
      });

      it("status: 400, Bad Request when invalid inc_votes value", () => {
        return request(app)
          .patch("/api/comments/1")
          .send({ inc_votes: "cat" })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Bad Request");
          });
      });

      it("status: 400, invalid comment_id", () => {
        return request(app)
          .patch("/api/comments/cat")
          .send({ inc_votes: 10 })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Bad Request");
          });
      });

      it("status: 404, comment_id not found", () => {
        return request(app)
          .patch("/api/comments/99999")
          .send({ inc_votes: 10 })
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Comment Not Found");
          });
      });
    });
  });

  describe("/api/reviews/:review_id", () => {
    describe("Functionality", () => {
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

    describe("Error Handling", () => {
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
    });
  });
});

describe("DELETE", () => {
  describe("/api/comments/:comment_id", () => {
    describe("Functionality", () => {
      it("status: 204", () => {
        return request(app).delete("/api/comments/1").expect(204);
      });
    });

    describe("Error Handling", () => {
      it("status: 400, invalid comment_id", () => {
        return request(app)
          .delete("/api/comments/bananas")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Bad Request");
          });
      });

      it("status: 404, comment_id not found", () => {
        return request(app)
          .delete("/api/comments/999999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Comment Not Found");
          });
      });
    });
  });

  describe("/api/reviews/:review_id", () => {
    describe("Functionality", () => {
      it("status: 204", () => {
        return request(app).delete("/api/reviews/1").expect(204);
      });
    });

    describe("Error Handling", () => {
      it("status: 400, invalid review_id", () => {
        return request(app)
          .delete("/api/reviews/bananas")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Bad Request");
          });
      });

      it("status: 404, review_id not found", () => {
        return request(app)
          .delete("/api/reviews/999999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("Review Not Found");
          });
      });
    });
  });
});

describe("Error Handling", () => {
  it("status: 404, Not Found", () => {
    return request(app)
      .get("/api/bananas")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not Found");
      });
  });
});
