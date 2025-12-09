SELECT 1
FROM agents
WHERE agent_id = $1
    OR username = $2
LIMIT 1;