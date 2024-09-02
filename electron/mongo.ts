import { ipcMain } from 'electron';
import { Db, MongoClient, ObjectId } from 'mongodb';

const mongoUri = 'mongodb://127.0.0.1:27017'; // MongoDB URI
const dbName = 'abcd'; // Your database name

let db: Db | null = null;

export async function connectToMongoDB() {
    const client = new MongoClient(mongoUri); // Options are no longer needed
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB');
}

export async function fetchData(collectionName: string) {
    if (!db) {
        throw new Error('Database not initialized');
    }
    const collection = db.collection(collectionName);
    return collection.find({}).toArray();
}

export async function insertData(collectionName: string, data: any) {
    if (!db) {
        throw new Error('Database not initialized');
    }
    const collection = db.collection(collectionName);
    return collection.insertOne(data);
}

export async function fetchDatabyId(collectionName: string, id: ObjectId ) {
    if (!db) {
        throw new Error('Database not initialized');
    }
    const collection = db.collection(collectionName);
    return collection.findOne({ 
        _id: id
    });
}


export async function deleteData(collectionName: string, data: any) {
    if (!db) {  
        throw new Error('Database not initialized');
    }
    const collection = db.collection(collectionName);
    return collection.deleteOne(data);
}

ipcMain.handle('fetch-data', async (_event, collectionName) => {
    try {
        const data = await fetchData(collectionName);
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
});

ipcMain.handle('insert-data', async (_event, collectionName, data) => {
    try {
        const result = await insertData(collectionName, data);
        const id = result.insertedId;
        // return the inserted data
        const resultData = await fetchDatabyId(collectionName, id);
        return resultData;
    } catch (error) {
        console.error('Error inserting data:', error);
        throw error;
    }
})

ipcMain.handle('fetch-databy-id', async (_event, collectionName, id) => {
    try {
        const data = await fetchDatabyId(collectionName, id);
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
})

ipcMain.handle('delete-data-by-id', async (_event, collectionName, data) => {
    try {
        console.log(data);
        const result = await deleteData(collectionName, data);
        console.log(result);
        return result;
    } catch (error) {
        console.error('Error deleting data:', error);
        throw error;
    }
})