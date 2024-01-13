export async function up(knex) {
  await knex.schema.alterTable('alert', (table) => {
    table.string('ntfyUrl', 256).notNullable().defaultTo('')
  })
}

export async function down(knex) {
  if (process.env.NODE_ENV !== 'production') {
    await knex.schema.alterTable('alert', (table) => {
      table.dropColumn('ntfyUrl')
    })
  }
}
