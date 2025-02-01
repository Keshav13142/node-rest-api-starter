import { relations } from "drizzle-orm";
import {
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

// Tables
export const userRole = ["USER", "EVENT_ORGANIZER", "ADMIN"] as const;
export const userRoleEnum = pgEnum("user_role", userRole);

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  fullName: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 20 }),
  role: userRoleEnum().default("USER").notNull(),
  ...timestamps,
});

export const eventStatus = [
  "DRAFT",
  "PUBLISHED",
  "CANCELLED",
  "COMPLETED",
  "POSTPONED",
] as const;
export const eventStatusEnum = pgEnum("event_status", eventStatus);

export const events = pgTable("events", {
  id: uuid().primaryKey().defaultRandom(),
  organizerId: uuid()
    .references(() => users.id)
    .notNull(),
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  startTime: timestamp().notNull(),
  endTime: timestamp().notNull(),
  venue: varchar({ length: 255 }).notNull(),
  address: text().notNull(),
  city: varchar({ length: 100 }).notNull(),
  state: varchar({ length: 100 }).notNull(),
  status: eventStatusEnum().default("DRAFT").notNull(),
  totalCapacity: integer().notNull(),
  ...timestamps,
});

export const mediaTypes = ["IMAGE", "VIDEO", "DOCUMENT"] as const;
export const mediaTypeEnum = pgEnum("media_type", mediaTypes);

export const eventMedia = pgTable("event_media", {
  id: uuid().primaryKey().defaultRandom(),
  eventId: uuid()
    .references(() => events.id)
    .notNull(),
  mediaType: mediaTypeEnum().notNull(),
  url: text().notNull(),
  displayOrder: integer().default(0).notNull(),
  ...timestamps,
});

export const ticketTypes = pgTable("ticket_types", {
  id: uuid().primaryKey().defaultRandom(),
  eventId: uuid()
    .references(() => events.id)
    .notNull(),
  name: varchar({ length: 100 }).notNull(),
  price: decimal({ precision: 10, scale: 2 }).notNull(),
  totalQuantity: integer().notNull(),
  availableQuantity: integer().notNull(),
  description: text(),
  saleStartsAt: timestamp().notNull(),
  saleEndsAt: timestamp().notNull(),
  ...timestamps,
});

export const ticketStatus = [
  "RESERVED",
  "PAID",
  "USED",
  "CANCELLED",
  "EXPIRED",
] as const;
export const ticketStatusEnum = pgEnum("ticket_status", ticketStatus);

export const tickets = pgTable("tickets", {
  id: uuid().primaryKey().defaultRandom(),
  ticketTypeId: uuid()
    .references(() => ticketTypes.id)
    .notNull(),
  userId: uuid()
    .references(() => users.id)
    .notNull(),
  orderId: uuid()
    .references(() => orders.id)
    .notNull(),
  status: ticketStatusEnum().default("RESERVED").notNull(),
  usedAt: timestamp(),
  ...timestamps,
});

export const orderStatus = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "REFUNDED",
] as const;
export const orderStatusEnum = pgEnum("order_status", orderStatus);

export const orders = pgTable("orders", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .references(() => users.id)
    .notNull(),
  totalAmount: decimal({ precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum().default("PENDING").notNull(),
  paymentGatewayRef: varchar({ length: 255 }),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const wallets = pgTable("wallets", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .references(() => users.id)
    .notNull()
    .unique(),
  balance: decimal({ precision: 10, scale: 2 }).default("0").notNull(),
  currency: varchar({ length: 3 }).default("INR").notNull(),
  ...timestamps,
});

export const walletTransactionType = ["CREDIT", "DEBIT", "REFUND"] as const;
export const walletTransactionTypeEnum = pgEnum(
  "transaction_type",
  walletTransactionType
);

export const transactionStatus = [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REVERSED",
] as const;
export const transactionStatusEnum = pgEnum(
  "transaction_status",
  transactionStatus
);

export const walletTransactions = pgTable("wallet_transactions", {
  id: uuid().primaryKey().defaultRandom(),
  walletId: uuid()
    .references(() => wallets.id)
    .notNull(),
  userId: uuid()
    .references(() => users.id)
    .notNull(),
  amount: decimal({ precision: 10, scale: 2 }).notNull(),
  type: walletTransactionTypeEnum().notNull(),
  status: transactionStatusEnum().default("PENDING").notNull(),
  paymentGatewayRef: varchar({ length: 255 }),
  ...timestamps,
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  events: many(events),
  tickets: many(tickets),
  wallet: one(wallets, {
    fields: [users.id],
    references: [wallets.userId],
  }),
  orders: many(orders),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  ticketTypes: many(ticketTypes),
  media: many(eventMedia),
}));

export const ticketTypesRelations = relations(ticketTypes, ({ one, many }) => ({
  event: one(events, {
    fields: [ticketTypes.eventId],
    references: [events.id],
  }),
  tickets: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  ticketType: one(ticketTypes, {
    fields: [tickets.ticketTypeId],
    references: [ticketTypes.id],
  }),
  user: one(users, {
    fields: [tickets.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [tickets.orderId],
    references: [orders.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  tickets: many(tickets),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(walletTransactions),
}));

export const walletTransactionsRelations = relations(
  walletTransactions,
  ({ one }) => ({
    wallet: one(wallets, {
      fields: [walletTransactions.walletId],
      references: [wallets.id],
    }),
    user: one(users, {
      fields: [walletTransactions.userId],
      references: [users.id],
    }),
  })
);

export const eventMediaRelations = relations(eventMedia, ({ one }) => ({
  event: one(events, {
    fields: [eventMedia.eventId],
    references: [events.id],
  }),
}));
