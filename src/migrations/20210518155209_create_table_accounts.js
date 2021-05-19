exports.up = (knex) => knex.schema.createTable('accounts', (t) => {
  t.increments('id').primary();
  t.string('name').notNull();
  t.integer('userId')
    .references('id')
    .inTable('users')
    .notNull();
});

exports.down = (knex) => knex.shema.dropTable('accounts');
