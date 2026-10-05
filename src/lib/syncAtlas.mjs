import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://haris2192001_db_user:1of06JZdrwXOtgif@cluster0.9xogsl5.mongodb.net/Colabify?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  console.log("Connected to MongoDB Atlas successfully!");

  const db = client.db('Colabify');

  // Verify collections
  const collections = await db.listCollections().toArray();
  console.log("Existing collections in Colabify DB:", collections.map(c => c.name));

  // Projects count
  const projectCount = await db.collection('projects').countDocuments();
  console.log("Projects in MongoDB Atlas:", projectCount);

  // Team members count
  const teamCount = await db.collection('team_members').countDocuments();
  console.log("Team members in MongoDB Atlas:", teamCount);

  // Blogs count
  const blogCount = await db.collection('blogs').countDocuments();
  console.log("Blogs in MongoDB Atlas:", blogCount);

  await client.close();
  console.log("Connection closed cleanly.");
}

run().catch(console.error);
