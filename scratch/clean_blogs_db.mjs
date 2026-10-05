import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

async function cleanBlogsDb() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const db = client.db('Colabify');
    const result = await db.collection('blogs').updateMany(
      {},
      {
        $unset: {
          author: "",
          authorRole: "",
          authorAvatar: "",
          readTime: "",
        },
      }
    );
    console.log(`Cleaned MongoDB Atlas blogs: matched ${result.matchedCount}, modified ${result.modifiedCount}`);

    const docs = await db.collection('blogs').find({}).toArray();
    console.log("Current blogs in Atlas (author fields removed):", docs.map(d => ({ id: d.id, title: d.title, category: d.category, author: d.author })));
  } catch (err) {
    console.error("DB clean error:", err);
  } finally {
    await client.close();
  }
}

cleanBlogsDb();
