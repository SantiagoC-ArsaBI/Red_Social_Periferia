CREATE OR REPLACE FUNCTION sp_add_like_and_log(p_user_id BIGINT, p_post_id BIGINT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO "Like" ("userId", "postId", "createdAt")
  VALUES (p_user_id, p_post_id, NOW());

  INSERT INTO "AuditLog" (action, "userId", "postId", "createdAt")
  VALUES ('LIKE_POST', p_user_id, p_post_id, NOW());
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'LIKE_ALREADY_EXISTS';
  WHEN foreign_key_violation THEN
    RAISE EXCEPTION 'INVALID_USER_OR_POST';
END;
$$ LANGUAGE plpgsql;

