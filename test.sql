\c nc_games_test;

      SELECT reviews.*, COUNT(comments.review_id) ::INT AS comment_count
      FROM reviews 
      LEFT JOIN comments 
      ON reviews.review_id = comments.review_id
        WHERE reviews.category = 'children''s games' 
      GROUP BY reviews.review_id 
      ORDER BY created_at DESC
