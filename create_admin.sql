-- Create admin with password: admin123
DELETE FROM admin WHERE email = 'test@dailyedge.com';
INSERT INTO admin (username, email, password) 
VALUES ('testadmin', 'test@dailyedge.com', '$2b$12$5SX1sUa6FvcYXtnKnkVkFeGO5XGq09blmz1fBGADDsZQgb9Sm457O');
