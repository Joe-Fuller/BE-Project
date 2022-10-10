\c nc_games;

SELECT reviews.*, COUNT(reviews.review_id)
FROM reviews 
JOIN comments 
ON reviews.review_id = comments.review_id
WHERE reviews.review_id=1;
