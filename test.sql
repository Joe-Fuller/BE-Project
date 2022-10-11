\c nc_games_test;

    SELECT reviews.*, COUNT(comments.review_id)
    FROM reviews 
    LEFT JOIN comments 
    ON reviews.review_id = comments.review_id
    GROUP BY reviews.review_id
    ORDER BY created_at DESC;
