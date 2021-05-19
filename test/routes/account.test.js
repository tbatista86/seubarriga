const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/v1/accounts';
let user;
let user2;

beforeEach(async () => {
  const res = await app.services.user.save({
    name: 'User Account',
    mail: `${Date.now()}@mail.com`,
    passwd: '123456',
  });
  user = { ...res[0] };
  user.token = jwt.encode(user, 'segredo');

  const res2 = await app.services.user.save({
    name: 'User Account 2',
    mail: `${Date.now()}@mail.com`,
    passwd: '123456',
  });
  user2 = { ...res2[0] };
});

test('Deve inserir uma conta com sucesso', () => request(app)
  .post(MAIN_ROUTE)
  .send({ name: 'Acc #1' })
  .set('authorization', `bearer ${user.token}`)
  .then((result) => {
    expect(result.status).toBe(201);
    expect(result.body.name).toBe('Acc #1');
  }));

test('Não deve inserir uma conta sem nome', () => request(app)
  .post(MAIN_ROUTE)
  .send({ })
  .set('authorization', `bearer ${user.token}`)
  .then((result) => {
    expect(result.status).toBe(400);
    expect(result.body.error).toBe('Nome é um atributo obrigatório');
  }));

test('Não deve inserir uma conta de nome duplicado, para o mesmo usuário', () => app.db('accounts')
  .insert({ name: 'Acc Duplicada', userId: user.id })
  .then(() => request(app).post(MAIN_ROUTE).set('authorization', `bearer ${user.token}`).send({ name: 'Acc Duplicada' }))
  .then((res) => {
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Já existe uma conta com esse nome');
  }));

test('Deve listar apenas a conta o usuário', () => app.db('accounts')
  .insert([
    { name: 'Acc user #1', userId: user.id },
    { name: 'Acc user #2', userId: user2.id },
  ])
  .then(() => request(app).get(MAIN_ROUTE).set('authorization', `bearer ${user.token}`))
  .then((res) => {
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Acc user #1');
  }));

test('Deve retornar uma conta por id', () => app.db('accounts')
  .insert({ name: 'Acc By id', userId: user.id }, ['id'])
  .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`).set('authorization', `bearer ${user.token}`))
  .then((res) => {
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Acc By id');
    expect(res.body.userId).toBe(user.id);
  }));

test('Não deve retornar uma conta de outro usuário', () => app.db('accounts')
  .insert({ name: 'Acc User2', userId: user2.id }, ['id'])
  .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`).set('authorization', `bearer ${user.token}`))
  .then((res) => {
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Este recurso não pertence ao usuário');
  }));

test('Deve alterar uma conta', () => app.db('accounts')
  .insert({ name: 'Acc to Update', userId: user.id }, ['id'])
  .then((acc) => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
    .send({ name: 'Acc Updated' }).set('authorization', `bearer ${user.token}`))
  .then((res) => {
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Acc Updated');
  }));

test('Não deve retornar uma conta de outro usuário', () => app.db('accounts')
  .insert({ name: 'Acc User #2', userId: user2.id }, ['id'])
  .then((acc) => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
    .send({ name: 'Acc Updated' })
    .set('authorization', `bearer ${user.token}`))
  .then((res) => {
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Este recurso não pertence ao usuário');
  }));

test('Deve remover uma conta', () => app.db('accounts')
  .insert({ name: 'Acc to remove', userId: user.id }, ['id'])
  .then((acc) => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
    .send({ name: 'Acc Updated' }).set('authorization', `bearer ${user.token}`))
  .then((res) => {
    expect(res.status).toBe(204);
  }));

test('Não deve remover uma conta de outro usuário', () => app.db('accounts')
  .insert({ name: 'Acc User #2', userId: user2.id }, ['id'])
  .then((acc) => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
    .set('authorization', `bearer ${user.token}`))
  .then((res) => {
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Este recurso não pertence ao usuário');
  }));
