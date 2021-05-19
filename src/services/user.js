const bcrypty = require('bcrypt-nodejs');
const ValidationError = require('../error/ValidationError');

module.exports = (app) => {
  const findAll = () => app.db('users').select(['id', 'name', 'mail']);

  const findOne = (filter = {}) => app.db('users').where(filter).first();

  const getPasswdHash = (passwd) => {
    const salt = bcrypty.genSaltSync(10);

    return bcrypty.hashSync(passwd, salt);
  };

  const save = async (user) => {
    if (!user.name) throw new ValidationError('Nome é um atributo obrigatório');
    if (!user.mail) throw new ValidationError('Email é um atributo obrigatório');
    if (!user.passwd) throw new ValidationError('Senha é um atributo obrigatório');

    const userDb = await findOne({ mail: user.mail });

    if (userDb) throw new ValidationError('Já existe um usuário com esse email');

    const newUser = { ...user };
    newUser.passwd = getPasswdHash(user.passwd);

    return app.db('users').insert(newUser, ['id', 'name', 'mail']);
  };

  return { findAll, save, findOne };
};
