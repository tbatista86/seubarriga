const request = require('supertest');
const app = require('../../src/app');

test('Deve criar usuário via signup', () => request(app).post('/auth/signup')
  .send({ name: 'Tiago Batista', mail: `${Date.now()}@mail.com`, passwd: '123456' })
  .then((res) => {
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Tiago Batista');
    expect(res.body).toHaveProperty('mail');
    expect(res.body).not.toHaveProperty('passwd');
  }));

test('Deve receber token ao logar', () => {
  const mail = `${Date.now()}@gmail.com`;
  return app.services.user
    .save({ name: 'Tiago Batista', mail, passwd: '123456' })
    .then(() => request(app).post('/auth/signin')
      .send({ mail, passwd: '123456' }))
    .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
});

test('Não deve autenticar usuário com senha errada', () => {
  const mail = `${Date.now()}@gmail.com`;
  return app.services.user
    .save({ name: 'Tiago Batista', mail, passwd: '123456' })
    .then(() => request(app).post('/auth/signin')
      .send({ mail, passwd: '654321' }))
    .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Usuário e/ou senha inválidos');
    });
});

test('Não deve autenticar usuário com email errada', () => request(app)
  .post('/auth/signin')
  .send({ mail: 'any_email', passwd: '654321' })
  .then((res) => {
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Usuário e/ou senha inválidos');
  }));

test('Não deve acessar a rota protegida sem token', () => request(app)
  .get('/v1/users')
  .then((res) => {
    expect(res.status).toBe(401);
  }));
