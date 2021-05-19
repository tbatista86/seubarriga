const request = require('supertest');

const app = require('../src/app');

test('Deve respondeer na raiz', () => request(app).get('/')
  .then((res) => {
    expect(res.status).toBe(200);
  }));
