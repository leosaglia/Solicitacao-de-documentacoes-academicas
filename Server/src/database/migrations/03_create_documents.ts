import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('documents', table => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('description').notNullable();
        table.integer('attendance_deadline').notNullable();
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('documents');
}