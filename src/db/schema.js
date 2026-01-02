const { pgTable, serial, text, timestamp, integer } = require('drizzle-orm/pg-core');

const users = pgTable('User', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    createdAt: timestamp('createdAt').defaultNow(),
});

const conversations = pgTable('Conversation', {
    id: serial('id').primaryKey(),
    userId: integer('userId').references(() => users.id).notNull(),
    title: text('title').notNull(),
    createdAt: timestamp('createdAt').defaultNow(),
});

const messages = pgTable('Message', {
    id: serial('id').primaryKey(),
    conversationId: integer('conversationId').references(() => conversations.id).notNull(),
    role: text('role').notNull(), // 'user' or 'assistant'
    content: text('content').notNull(),
    language: text('language'), // nullable, mostly for assistant code responses
    createdAt: timestamp('createdAt').defaultNow(),
});

module.exports = {
    users,
    conversations,
    messages,
};
