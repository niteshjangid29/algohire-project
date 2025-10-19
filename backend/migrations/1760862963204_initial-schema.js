exports.shorthands = undefined;

exports.up = pgm => {
    // 1. Create an extension for generating UUIDs
    pgm.sql('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    // 2. Create the subscriptions table
    pgm.createTable('subscriptions', {
        id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
        event_type: { type: 'varchar(255)', notNull: true },
        endpoint_url: { type: 'text', notNull: true },
        secret_key: { type: 'text', notNull: true },
        is_active: { type: 'boolean', default: true },
        created_at: { type: 'timestamptz', default: pgm.func('now()') },
        updated_at: { type: 'timestamptz', default: pgm.func('now()') },
    });
    pgm.addConstraint('subscriptions', 'unique_event_endpoint', {
        unique: ['event_type', 'endpoint_url']
    });
    pgm.createIndex('subscriptions', 'event_type');

    // 3. Create the events table
    pgm.createTable('events', {
        id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
        event_type: { type: 'varchar(255)', notNull: true },
        payload: { type: 'jsonb', notNull: true },
        received_at: { type: 'timestamptz', default: pgm.func('now()') },
    });

    // 4. Create the delivery_logs table
    pgm.createTable('delivery_logs', {
        id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
        subscription_id: { type: 'uuid', notNull: true, references: 'subscriptions(id)', onDelete: 'CASCADE' },
        event_id: { type: 'uuid', notNull: true, references: 'events(id)', onDelete: 'CASCADE' },
        status: { type: 'varchar(50)', notNull: true },
        response_status_code: { type: 'integer' },
        response_body: { type: 'text' },
        attempted_at: { type: 'timestamptz', default: pgm.func('now()') },
    });
    pgm.createIndex('delivery_logs', 'subscription_id');
    pgm.createIndex('delivery_logs', 'event_id');
    pgm.createIndex('delivery_logs', 'status');
};

exports.down = pgm => {
    pgm.dropTable('delivery_logs');
    pgm.dropTable('events');
    pgm.dropTable('subscriptions');
};