CREATE OR REPLACE FUNCTION sp_get_user_feed(p_user_id BIGINT)
RETURNS TABLE (
  post_id INTEGER,
  author_id INTEGER,
  message TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE,
  likes_count INTEGER,
  author_first_name TEXT,
  author_last_name TEXT,
  author_alias TEXT,
  liked_by_me BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id AS post_id,
    p."authorId" AS author_id,
    p.message,
    p."createdAt" AS created_at,
    COALESCE(lc.cnt, 0)::INTEGER AS likes_count,
    u."firstName" AS author_first_name,
    u."lastName" AS author_last_name,
    u."alias" AS author_alias,
    EXISTS (SELECT 1 FROM "Like" l WHERE l."postId" = p.id AND l."userId" = p_user_id) AS liked_by_me
  FROM "Post" p
  JOIN "User" u ON u.id = p."authorId"
  LEFT JOIN (
    SELECT "postId", COUNT(*) AS cnt
    FROM "Like"
    GROUP BY "postId"
  ) lc ON lc."postId" = p.id
  ORDER BY p."createdAt" DESC;
END;
$$ LANGUAGE plpgsql;
