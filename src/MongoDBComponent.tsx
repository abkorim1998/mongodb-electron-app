// import { useEffect, useState } from 'react';
// import { MongoClient, Db } from 'mongodb';

// const mongoUri = 'mongodb://127.0.0.1:27017'; // MongoDB URI
// const dbName = 'abcd'; // Your database name

// let db: Db | null = null;

// async function connectToMongoDB() {
//     const client = new MongoClient(mongoUri);
//     await client.connect();
//     db = client.db(dbName);
//     console.log('Connected to MongoDB');
// }

// async function fetchData(collectionName: string) {
//     if (!db) {
//         throw new Error('Database not initialized');
//     }
//     const collection = db.collection(collectionName);
//     return collection.find({}).toArray();
// }

// const MongoDBComponent = () => {
//     const [data, setData] = useState<any[]>([]);

//     useEffect(() => {
//         (async () => {
//             try {
//                 await connectToMongoDB();
//                 const fetchedData = await fetchData('your-collection-name');
//                 setData(fetchedData);
//             } catch (error) {
//                 console.error('Error connecting to MongoDB:', error);
//             }
//         })();
//     }, []);

//     return (
//         <div>
//             <h1>MongoDB Data</h1>
//             <pre>{JSON.stringify(data, null, 2)}</pre>
//         </div>
//     );
// };

// export default MongoDBComponent;
