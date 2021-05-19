const request = require('supertest');
const jwt = require('jwt-simple');

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/users';

const mail = `${Date.now()}@mail.com`;

let user;

beforeAll(async () => {
  const res = await app.services.user.save({
    name: 'User Account',
    mail: `${Date.now()}@mail.com`,
    passwd: '123456',
  });
  user = { ...res[0] };
  user.token = jwt.encode(user, 'segredo');
});

test('Deve listar todos os usuários', () => request(app)
  .get(MAIN_ROUTE)
  .set('authorization', `bearer ${user.token}`)
  .then((res) => {
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  }));

test('Deve inseiri usuario com sucesso', () => request(app)
  .post(MAIN_ROUTE)
  .send({ name: 'Tiago Batista', mail, passwd: '123456' })
  .set('authorization', `bearer ${user.token}`)
  .then((res) => {
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Tiago Batista');
    expect(res.body).not.toHaveProperty('passwd');
  }));

test('Deve armazenar senha criptografada', async () => {
  const res = await request(app).post(MAIN_ROUTE)
    .send({ name: 'Tiago Batista', mail: `${Date.now()}@mail.com`, passwd: '123456' })
    .set('authorization', `bearer ${user.token}`);
  expect(res.status).toBe(201);

  const { id } = res.body;
  const userDB = await app.services.user.findOne({ id });
  expect(userDB.passwd).not.toBeUndefined();
  expect(userDB.passwd).not.toBe('123456');
});

test('Não deve inserir usuário sem nome', () => request(app)
  .post(MAIN_ROUTE)
  .send({ mail: 'any_email', passwd: '123456' })
  .set('authorization', `bearer ${user.token}`)
  .then((res) => {
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Nome é um atributo obrigatório');
  }));

test('Não teve insirir usuário sem emial', async () => {
  const result = await request(app).post(MAIN_ROUTE)
    .send({ name: 'Tiago Batista', passwd: '123456' })
    .set('authorization', `bearer ${user.token}`);
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('Email é um atributo obrigatório');
});

test('Não deve inserir usuário sem senha', async (done) => {
  const result = await request(app).post(MAIN_ROUTE)
    .send({ name: 'Tiago Batista', mail: 'mails@mail.com' })
    .set('authorization', `bearer ${user.token}`);
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('Senha é um atributo obrigatório');
  done();
});

test('Não deve inseirir usuário com email exitente', () => request(app)
  .post(MAIN_ROUTE)
  .send({ name: 'Tiago Batista', mail, passwd: '123456' })
  .set('authorization', `bearer ${user.token}`)
  .then((res) => {
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Já existe um usuário com esse email');
  }));
