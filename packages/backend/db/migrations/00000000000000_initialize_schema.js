export async function up(knex) {
  await knex.schema.createTable('apiKey', (table) => {
    table.increments('id')
    table.string('token', 36).notNullable()
    table.tinyint('canRead', 1).notNullable().defaultTo(0)
    table.tinyint('canWrite', 1).notNullable().defaultTo(0)
    table.string('comment', 256).notNullable().defaultTo('')

    table.unique(['token'], { indexName: 'apiKey_token_uindex' })
  })

  await knex.schema.createTable('dailyAggregation', (table) => {
    table.increments('id')
    table.datetime('measurementDay').notNullable()
    table.string('location', 64).notNullable()
    table.string('type', 64).notNullable()
    table.integer('count').notNullable()
    table.decimal('sum', 13, 4)
    table.decimal('average', 13, 4)
    table.decimal('minimum', 13, 4)
    table.decimal('maximum', 13, 4)

    table.unique(['measurementDay', 'location', 'type'], {
      indexName: 'daily_aggregation_measurement_day_location_type_uindex',
    })
  })

  await knex.schema.createTable('hourlyAggregation', (table) => {
    table.increments('id')
    table.datetime('measurementHour').notNullable()
    table.string('location', 64).notNullable()
    table.string('type', 64).notNullable()
    table.integer('count').notNullable()
    table.decimal('sum', 13, 4)
    table.decimal('average', 13, 4)
    table.decimal('minimum', 13, 4)
    table.decimal('maximum', 13, 4)

    table.unique(['measurementHour', 'location', 'type'], {
      indexName: 'hourly_aggregation_measurement_hour_location_type_uindex',
    })
  })

  await knex.schema.createTable('measurement', (table) => {
    table.increments('id')
    table.datetime('createdAt', { precision: 3 }).notNullable()
    table.string('location', 64).notNullable()
    table.string('type', 64).notNullable()
    table.decimal('value', 13, 4).notNullable()

    table.index(['location', 'type'], 'measurement_location_type_index')
    table.index(['createdAt'], 'measurement_created_at_index')
  })
}

export async function down(knex) {
  if (process.env.NODE_ENV !== 'production') {
    await knex.schema.dropTable('apiKey')
    await knex.schema.dropTable('dailyAggregation')
    await knex.schema.dropTable('hourlyAggregation')
    await knex.schema.dropTable('measurement')
  }
}
