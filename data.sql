--
-- PostgreSQL database dump
--

\restrict WSGi4N8gIxkbenbAvfdZFEI1J7iPvDPlTF2bbGnZn9Ludiy9wKKFfZGXgEaSlNY

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.admin (id, username, email, password, created_at) VALUES (1, 'admin', 'admin@dailyedge.com', '$2b$12$bkHH70kn.uJuCGISkoJxHeU5X/2DgtP1p6FnUyzv/fMaQE00uMwMK', '2025-11-13 14:42:46.294462');


--
-- Data for Name: admin_activity_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (1, 1, 'login', NULL, NULL, 'Admin logged in', '2025-11-13 14:50:29.475461');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (2, 1, 'login', NULL, NULL, 'Admin logged in', '2025-11-13 14:56:00.382707');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (3, 1, 'login', NULL, NULL, 'Admin logged in', '2025-11-13 14:59:48.127903');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (4, 1, 'suspend_user', 'user', 3, 'too slow', '2025-11-13 15:01:31.873295');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (5, 1, 'login', NULL, NULL, 'Admin logged in', '2025-11-13 15:05:26.240989');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (6, 1, 'unsuspend_user', 'user', 3, 'User account reactivated', '2025-11-13 15:05:47.559258');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (7, 1, 'logout', NULL, NULL, 'Admin logged out', '2025-11-13 15:05:51.747682');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (8, 1, 'login', NULL, NULL, 'Admin logged in', '2025-11-13 15:06:25.846891');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (9, 1, 'suspend_user', 'user', 3, 'too slow', '2025-11-13 15:06:43.923917');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (10, 1, 'login', NULL, NULL, 'Admin logged in', '2025-11-13 15:08:06.777965');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (11, 1, 'unsuspend_user', 'user', 3, 'User account reactivated', '2025-11-13 15:08:24.193898');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (12, 1, 'create_challenge', 'challenge', 5, 'Created challenge: 7 day meditation week', '2025-11-13 15:17:35.030912');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (13, 1, 'login', NULL, NULL, 'Admin logged in', '2025-11-16 18:46:32.736523');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (14, 1, 'login', NULL, NULL, 'Admin logged in', '2025-11-17 11:14:13.447158');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (15, 1, 'suspend_user', 'user', 4, 'issues', '2025-11-17 11:15:51.828161');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (16, 1, 'logout', NULL, NULL, 'Admin logged out', '2025-11-17 11:54:07.995449');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (17, 1, 'login', NULL, NULL, 'Admin logged in', '2025-11-18 10:53:59.653854');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (18, 1, 'login', NULL, NULL, 'Admin logged in', '2025-11-18 10:56:16.973273');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (19, 1, 'login', NULL, NULL, 'Admin logged in', '2025-11-18 10:59:04.01047');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (20, 1, 'award_badge', 'user', 1, 'Awarded badge: 3DayEdger', '2025-11-18 10:59:20.89014');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (21, 1, 'logout', NULL, NULL, 'Admin logged out', '2025-11-18 11:01:06.297592');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (22, 1, 'login', NULL, NULL, 'Admin logged in', '2025-11-18 11:19:57.167732');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (23, 1, 'unsuspend_user', 'user', 4, 'User account reactivated', '2025-11-18 11:20:26.654617');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (24, 1, 'suspend_user', 'user', 4, 'invalid ', '2025-11-18 11:20:45.101434');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (25, 1, 'logout', NULL, NULL, 'Admin logged out', '2025-11-18 11:21:55.604996');
INSERT INTO public.admin_activity_log (id, admin_id, action, target_type, target_id, details, created_at) VALUES (26, 1, 'login', NULL, NULL, 'Admin logged in', '2025-11-18 12:34:59.488215');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, username, email, password, xp, created_at, is_suspended, suspended_at, suspended_reason) VALUES (4, 'abhav', 'abhav@gmail.com', '$2b$12$04/BV9UwlkHur3eGAeN5Ru3/JD0DtostLKV03tc16.XzhveORo46m', 10, '2025-09-26 09:23:59.752455+05:30', true, '2025-11-18 11:20:45.09857', 'invalid ');
INSERT INTO public.users (id, username, email, password, xp, created_at, is_suspended, suspended_at, suspended_reason) VALUES (1, 'ananya', 'ananyayaa14@gmail.com', '$2b$12$dLQMyO2tEnesWwjsqI2Re.of0KqdOfl36XTtFNZVaEIk4t7HVqTPG', 250, '2025-09-23 14:59:09.481648+05:30', false, NULL, NULL);
INSERT INTO public.users (id, username, email, password, xp, created_at, is_suspended, suspended_at, suspended_reason) VALUES (3, 'abha', 'abha@gmail.com', '$2b$12$AxMoyNj3bCTspHallgdtK.FvpvkKs930DCj838fBVLKpzYQ1h.neG', 55, '2025-09-25 10:16:02.70739+05:30', false, NULL, NULL);
INSERT INTO public.users (id, username, email, password, xp, created_at, is_suspended, suspended_at, suspended_reason) VALUES (5, 'saumya', 'saumya@gmail.com', '$2b$12$ZD5i0gu/EZUDbL/vysod6uTwTWXvnwSi8ZoNQBNrpqlP4X13mEqvC', 40, '2025-11-16 14:23:57.931658+05:30', false, NULL, NULL);
INSERT INTO public.users (id, username, email, password, xp, created_at, is_suspended, suspended_at, suspended_reason) VALUES (2, 'aanchal', 'aanchal@gmail.com', '$2b$12$jZZFor6Cp5goNHIeXXG/2upn4BJEcRHO/oxfJl.Dz0xQA5qsymjMS', 45, '2025-09-23 21:52:32.347442+05:30', false, NULL, NULL);


--
-- Data for Name: badges; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.badges (id, user_id, badge_name, earned_at) VALUES (1, 1, '3DayEdger', '2025-11-18 10:59:20.870212+05:30');


--
-- Data for Name: challenges; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.challenges (id, title, description, duration_days, xp_reward, created_by, is_admin_created) VALUES (1, '30-Day Fitness Push', 'Complete a fitness habit every day for 30 days straight.', 30, 500, 'system', false);
INSERT INTO public.challenges (id, title, description, duration_days, xp_reward, created_by, is_admin_created) VALUES (2, 'Mindful Mornings', 'Start your day with a 10-minute meditation for 7 consecutive days.', 7, 150, 'system', false);
INSERT INTO public.challenges (id, title, description, duration_days, xp_reward, created_by, is_admin_created) VALUES (3, 'Digital Detox Weekly', 'Avoid social media for 2 hours before bed for a full week.', 7, 200, 'system', false);
INSERT INTO public.challenges (id, title, description, duration_days, xp_reward, created_by, is_admin_created) VALUES (4, 'Hydration Hero', 'Drink 8 glasses of water every day for 14 days.', 14, 250, 'system', false);
INSERT INTO public.challenges (id, title, description, duration_days, xp_reward, created_by, is_admin_created) VALUES (5, '7 day meditation week', '7 day mental fitness challenge', 7, 200, 'admin', true);


--
-- Data for Name: user_challenges; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_challenges (id, user_id, challenge_id, start_date, status, completed_at, failed_at) VALUES (1, 1, 1, '2025-11-04 12:20:15.791706+05:30', 'in_progress', NULL, NULL);
INSERT INTO public.user_challenges (id, user_id, challenge_id, start_date, status, completed_at, failed_at) VALUES (2, 3, 2, '2025-11-13 14:59:21.670373+05:30', 'in_progress', NULL, NULL);
INSERT INTO public.user_challenges (id, user_id, challenge_id, start_date, status, completed_at, failed_at) VALUES (3, 3, 4, '2025-11-16 15:24:21.940122+05:30', 'in_progress', NULL, NULL);
INSERT INTO public.user_challenges (id, user_id, challenge_id, start_date, status, completed_at, failed_at) VALUES (4, 2, 2, '2025-11-16 15:37:39.192574+05:30', 'in_progress', NULL, NULL);
INSERT INTO public.user_challenges (id, user_id, challenge_id, start_date, status, completed_at, failed_at) VALUES (5, 5, 2, '2025-11-16 15:44:41.191758+05:30', 'in_progress', NULL, NULL);
INSERT INTO public.user_challenges (id, user_id, challenge_id, start_date, status, completed_at, failed_at) VALUES (6, 5, 4, '2025-11-16 15:51:51.292012+05:30', 'in_progress', NULL, NULL);
INSERT INTO public.user_challenges (id, user_id, challenge_id, start_date, status, completed_at, failed_at) VALUES (7, 1, 2, '2025-11-18 12:34:22.201925+05:30', 'in_progress', NULL, NULL);


--
-- Data for Name: challenge_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.challenge_logs (id, user_challenge_id, date, status) VALUES (1, 1, '2025-11-04', 'done');
INSERT INTO public.challenge_logs (id, user_challenge_id, date, status) VALUES (2, 1, '2025-11-11', 'done');
INSERT INTO public.challenge_logs (id, user_challenge_id, date, status) VALUES (3, 1, '2025-11-13', 'done');
INSERT INTO public.challenge_logs (id, user_challenge_id, date, status) VALUES (4, 2, '2025-11-13', 'done');
INSERT INTO public.challenge_logs (id, user_challenge_id, date, status) VALUES (5, 1, '2025-11-16', 'done');
INSERT INTO public.challenge_logs (id, user_challenge_id, date, status) VALUES (6, 2, '2025-11-16', 'done');
INSERT INTO public.challenge_logs (id, user_challenge_id, date, status) VALUES (7, 3, '2025-11-16', 'done');
INSERT INTO public.challenge_logs (id, user_challenge_id, date, status) VALUES (8, 4, '2025-11-16', 'done');
INSERT INTO public.challenge_logs (id, user_challenge_id, date, status) VALUES (9, 5, '2025-11-16', 'done');
INSERT INTO public.challenge_logs (id, user_challenge_id, date, status) VALUES (10, 6, '2025-11-16', 'done');


--
-- Data for Name: habits; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.habits (id, user_id, name, category, frequency, created_at, duration_days, status, end_date, completed_at) VALUES (2, 2, 'Drink 8 glasses of water', 'Health', 'Daily', '2025-09-23 21:55:20.294715+05:30', 30, 'in_progress', NULL, NULL);
INSERT INTO public.habits (id, user_id, name, category, frequency, created_at, duration_days, status, end_date, completed_at) VALUES (4, 4, 'run 10 km', 'Health', 'Daily', '2025-09-26 09:24:26.817556+05:30', 30, 'in_progress', NULL, NULL);
INSERT INTO public.habits (id, user_id, name, category, frequency, created_at, duration_days, status, end_date, completed_at) VALUES (5, 1, 'meditate 30 minutes', 'Mindfulness', 'Daily', '2025-11-02 17:37:29.836721+05:30', 30, 'in_progress', NULL, NULL);
INSERT INTO public.habits (id, user_id, name, category, frequency, created_at, duration_days, status, end_date, completed_at) VALUES (6, 3, 'Run 10km', 'Health', 'Daily', '2025-11-16 15:23:30.743794+05:30', 10, 'in_progress', NULL, NULL);
INSERT INTO public.habits (id, user_id, name, category, frequency, created_at, duration_days, status, end_date, completed_at) VALUES (7, 2, 'Drink 8 glasses of water', 'Mindfulness', 'Daily', '2025-11-16 15:38:17.897266+05:30', 30, 'in_progress', NULL, NULL);
INSERT INTO public.habits (id, user_id, name, category, frequency, created_at, duration_days, status, end_date, completed_at) VALUES (8, 5, 'Run 10km', 'Fitness', 'Daily', '2025-11-16 15:48:39.780713+05:30', 20, 'in_progress', NULL, NULL);
INSERT INTO public.habits (id, user_id, name, category, frequency, created_at, duration_days, status, end_date, completed_at) VALUES (1, 1, 'run 10km', 'Health', 'Daily', '2025-09-23 15:00:06.41414+05:30', 30, 'failed', '2025-11-16', NULL);
INSERT INTO public.habits (id, user_id, name, category, frequency, created_at, duration_days, status, end_date, completed_at) VALUES (3, 1, 'read 10 pages everyday', 'Study', 'Daily', '2025-09-26 09:05:58.113319+05:30', 30, 'failed', '2025-11-16', NULL);
INSERT INTO public.habits (id, user_id, name, category, frequency, created_at, duration_days, status, end_date, completed_at) VALUES (9, 1, 'study 3hrs', 'Study', 'Daily', '2025-11-16 17:11:36.230506+05:30', 1, 'completed', NULL, '2025-11-16 17:17:03.758163');
INSERT INTO public.habits (id, user_id, name, category, frequency, created_at, duration_days, status, end_date, completed_at) VALUES (10, 1, 'reading books', 'Study', 'Daily', '2025-11-18 12:33:45.065629+05:30', 7, 'in_progress', NULL, NULL);


--
-- Data for Name: habit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (1, 2, '2025-09-23', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (2, 1, '2025-09-24', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (3, 3, '2025-09-26', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (4, 4, '2025-09-26', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (5, 1, '2025-11-02', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (7, 5, '2025-11-02', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (6, 3, '2025-11-02', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (8, 1, '2025-11-04', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (9, 3, '2025-11-04', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (10, 5, '2025-11-04', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (11, 5, '2025-11-11', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (12, 3, '2025-11-11', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (13, 1, '2025-11-11', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (14, 1, '2025-11-13', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (15, 3, '2025-11-13', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (16, 5, '2025-11-13', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (17, 1, '2025-11-16', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (18, 3, '2025-11-16', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (19, 5, '2025-11-16', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (20, 6, '2025-11-16', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (21, 2, '2025-11-16', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (22, 8, '2025-11-16', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (23, 7, '2025-11-16', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (24, 9, '2025-11-16', 'done');
INSERT INTO public.habit_logs (id, habit_id, date, status) VALUES (25, 10, '2025-11-18', 'done');


--
-- Name: admin_activity_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_activity_log_id_seq', 26, true);


--
-- Name: admin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_id_seq', 1, true);


--
-- Name: badges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.badges_id_seq', 1, true);


--
-- Name: challenge_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.challenge_logs_id_seq', 10, true);


--
-- Name: challenges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.challenges_id_seq', 5, true);


--
-- Name: habit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.habit_logs_id_seq', 25, true);


--
-- Name: habits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.habits_id_seq', 10, true);


--
-- Name: user_challenges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_challenges_id_seq', 7, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- PostgreSQL database dump complete
--

\unrestrict WSGi4N8gIxkbenbAvfdZFEI1J7iPvDPlTF2bbGnZn9Ludiy9wKKFfZGXgEaSlNY

