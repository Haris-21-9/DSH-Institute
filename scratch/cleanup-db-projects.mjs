import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://haris2192001_db_user:1of06JZdrwXOtgif@cluster0.9xogsl5.mongodb.net/Colabify?retryWrites=true&w=majority&appName=Cluster0";

async function cleanupProjects() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  const db = client.db('Colabify');

  const deleteFilter = {
    $or: [
      { title: { $regex: /mobile arcade/i } },
      { title: { $regex: /kambo strong/i } },
      { title: { $regex: /expeditors/i } },
      { url: { $regex: /mobilearcadeltd/i } },
      { url: { $regex: /kambostrong/i } },
      { url: { $regex: /expeditors/i } },
      { slug: { $in: ['mobile-arcade-ltd', 'kambo-strong-nz', 'kambo-strong', 'expeditors'] } }
    ]
  };

  const result = await db.collection('projects').deleteMany(deleteFilter);
  console.log('Deleted projects count from MongoDB Atlas:', result.deletedCount);

  const remaining = await db.collection('projects').find({}).toArray();
  console.log('Remaining projects in Atlas:', remaining.map(p => ({ id: p.id, title: p.title, url: p.url })));

  await client.close();
}

cleanupProjects().catch(console.error);
