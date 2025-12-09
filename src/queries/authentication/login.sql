SELECT *
FROM agents
WHERE username = $1
LIMIT 1