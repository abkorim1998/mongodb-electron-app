import { Db } from "mongodb";

export { };

declare global {
    interface Window {
        mongo: {
            connectToMongoDB: () => Promise<any>;
            fetchData: (collectionName: string) => Promise<any[]>;
            insertData: (collectionName: string, data: any) => Promise<InsertOneResult<Document>>;
            deleteData: (collectionName: string, data: any) => Promise<DeleteResult>;
        };
    }
}