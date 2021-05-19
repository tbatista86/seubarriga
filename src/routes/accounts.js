const express = require('express');
const RecursoIndevidoError = require('../error/RecursoIndevidoError');

module.exports = (app) => {
  const router = express.Router();

  router.param('id', (req, res, next) => {
    app.services.account.find({ id: req.params.id })
      .then((acc) => {
        if (acc.userId !== req.user.id) throw new RecursoIndevidoError();
        else next();
      }).catch((err) => next(err));
  });

  router.post('/', (req, res, next) => {
    app.services.accounts.save({ ...req.body, userId: req.user.id })
      .then((result) => res.status(201).json(result[0]))
      .catch((err) => next(err));
  });

  router.get('/', (req, res, next) => {
    app.services.accounts.findAll(req.user.id)
      .then((result) => res.status(200).json(result))
      .catch((err) => next(err));
  });

  router.get('/:id', (req, res, next) => {
    app.services.accounts.find({ id: req.params.id })
      .then((result) => res.status(200).json(result))
      .catch((err) => next(err));
  });

  router.put('/:id', (req, res, next) => {
    app.services.accounts.update(req.params.id, req.body)
      .then((result) => res.status(200).json(result[0]))
      .catch((err) => next(err));
  });

  router.delete('/:id', (req, res, next) => {
    app.services.accounts.remove(req.params.id)
      .then(() => res.status(204).send())
      .catch((err) => next(err));
  });

  return router;
};
