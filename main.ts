// Deploy de prueba, ejemplo Back-end corregido
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { schema } from "./schema.ts";
import { resolvers } from "./resolvers.ts";

import { MongoClient, Collection } from "mongodb";
import { ContactModel } from "./type.ts";

// ------- variables de entorno -------
const MONGO_URL = Deno.env.get("MONGO_URL");
if (!MONGO_URL) throw new Error("Please provide a MONGO_URL");

// ------- conexión MongoDB -------
const mongoClient = new MongoClient(MONGO_URL);
await mongoClient.connect();
console.info("Connected to MongoDB");

const mongoDB = mongoClient.db(Deno.env.get("DB_NAME") ?? "contactsDB");
const ContactsCollection: Collection<ContactModel> =
  mongoDB.collection<ContactModel>("contacts");

// ------- Apollo Server -------
type Context = { ContactsCollection: Collection<ContactModel> };

const server = new ApolloServer<Context>({
  typeDefs: schema,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  // ← ahora devuelve Promise<Context>, que es lo que exige la librería
  context: async (): Promise<Context> => ({ ContactsCollection }),
});

console.info(`🚀  Server ready at ${url}`);

