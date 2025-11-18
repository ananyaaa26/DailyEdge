const authController = require('./authController');
const db = require('../models/db');
const bcrypt = require('bcrypt');

// Mock the database and bcrypt
jest.mock('../models/db');
jest.mock('bcrypt');

describe('Authentication Controller Tests', () => {
    let req, res, next;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Mock request object
        req = {
            body: {},
            session: {}
        };

        // Mock response object
        res = {
            render: jest.fn(),
            redirect: jest.fn()
        };

        // Mock next function
        next = jest.fn();
    });

    // ==========================================
    // SIGNUP TESTS
    // ==========================================

    describe('postSignup', () => {
        test('should reject signup with validation errors', async () => {
            req.body = {
                username: 'ab',
                email: 'invalidemail',
                password: '123'
            };

            await authController.postSignup(req, res, next);

            expect(res.render).toHaveBeenCalledWith('pages/signup', 
                expect.objectContaining({
                    errors: expect.arrayContaining([
                        'Username must be at least 3 characters long',
                        'Please enter a valid email address',
                        'Password must be at least 6 characters long'
                    ])
                })
            );
        });

        test('should reject signup with existing user', async () => {
            req.body = {
                username: 'newuser',
                email: 'existing@example.com',
                password: 'password123'
            };

            db.query.mockResolvedValueOnce({
                rows: [{ id: 1, email: 'existing@example.com', username: 'olduser' }]
            });

            await authController.postSignup(req, res, next);

            expect(res.render).toHaveBeenCalledWith('pages/signup', 
                expect.objectContaining({
                    errors: expect.arrayContaining(['A user with this email already exists'])
                })
            );
        });

        test('should successfully create new user and redirect to dashboard', async () => {
            req.body = {
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'password123'
            };

            db.query.mockResolvedValueOnce({ rows: [] });
            bcrypt.hash.mockResolvedValueOnce('$2b$12$hashedpassword');
            db.query.mockResolvedValueOnce({
                rows: [{ id: 1, username: 'newuser', email: 'newuser@example.com' }]
            });

            await authController.postSignup(req, res, next);

            expect(req.session.user).toEqual({
                id: 1,
                username: 'newuser',
                email: 'newuser@example.com',
                xp: 0
            });
            expect(res.redirect).toHaveBeenCalledWith('/dashboard?welcome=true');
        });
    });

    // ==========================================
    // LOGIN TESTS
    // ==========================================
    
    describe('postLogin', () => {
        test('should reject login with missing credentials', async () => {
            req.body = {
                email: '',
                password: ''
            };

            await authController.postLogin(req, res, next);

            expect(res.render).toHaveBeenCalledWith('pages/login', 
                expect.objectContaining({
                    errors: expect.arrayContaining(['Email is required', 'Password is required'])
                })
            );
        });

        test('should reject login with wrong password', async () => {
            req.body = {
                email: 'user@example.com',
                password: 'wrongpassword'
            };

            db.query.mockResolvedValueOnce({
                rows: [{ 
                    id: 1, 
                    username: 'testuser',
                    email: 'user@example.com', 
                    password: '$2b$12$hashedpassword',
                    is_suspended: false,
                    xp: 100
                }]
            });

            bcrypt.compare.mockResolvedValueOnce(false);

            await authController.postLogin(req, res, next);

            expect(res.render).toHaveBeenCalledWith('pages/login', 
                expect.objectContaining({
                    errors: expect.arrayContaining(['Invalid email or password'])
                })
            );
        });

        test('should successfully login with correct credentials', async () => {
            req.body = {
                email: 'user@example.com',
                password: 'correctpassword'
            };

            db.query.mockResolvedValueOnce({
                rows: [{ 
                    id: 1, 
                    username: 'testuser',
                    email: 'user@example.com', 
                    password: '$2b$12$hashedpassword',
                    is_suspended: false,
                    xp: 250
                }]
            });

            bcrypt.compare.mockResolvedValueOnce(true);

            await authController.postLogin(req, res, next);

            expect(req.session.user).toEqual({
                id: 1,
                username: 'testuser',
                email: 'user@example.com',
                xp: 250
            });
            expect(res.redirect).toHaveBeenCalledWith('/dashboard');
        });
    });

    // ==========================================
    // LOGOUT TEST
    // ==========================================

    describe('logout', () => {
        test('should destroy session and redirect to home', () => {
            req.session.destroy = jest.fn((callback) => callback(null));
            res.clearCookie = jest.fn();

            authController.logout(req, res);

            expect(req.session.destroy).toHaveBeenCalled();
            expect(res.clearCookie).toHaveBeenCalledWith('connect.sid');
            expect(res.redirect).toHaveBeenCalledWith('/');
        });
    });
});
