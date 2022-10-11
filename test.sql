\c nc_games_test;

  INSERT INTO comments (body, author, review_id)
  VALUES ('aaa', 'bainesface', 3)
  RETURNING *;
