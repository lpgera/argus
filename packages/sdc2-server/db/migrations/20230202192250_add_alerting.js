export async function up(knex) {
  await knex.schema.createTable('alert', (table) => {
    table.increments('id')
    table.string('location', 64).notNullable()
    table.string('type', 64).notNullable()
    table.enum('comparison', ['<', '<=', '=', '>=', '>']).notNullable()
    table.decimal('value', 13, 4).notNullable()
    table.boolean('isAlerting').notNullable()

    table.index(['location', 'type'], 'alertConfig_location_type_index')
  })
}

export async function down(knex) {
  if (process.env.NODE_ENV !== 'production') {
    await knex.schema.dropTable('alert')
  }
}
