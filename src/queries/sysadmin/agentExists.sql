SELECT 1
FROM users
WHERE user_id = $1
    OR username = $2
LIMIT 1;