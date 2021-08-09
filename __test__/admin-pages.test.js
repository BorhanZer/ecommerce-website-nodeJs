var req = require('supertest');
var app = require('../app');

beforeEach(() => {
    jest.useFakeTimers();
});

describe('Test Get All Pages', () => {
    test('It should respond with 200 success', async() => {
        var response = await req(app).get('/users/login')
            .expect(200);
    });
});



afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});