import { useEffect, useState } from 'react';

function App() {
    const [data, setData] = useState<any[]>([]);
    useEffect(() => {

        window.ipcRenderer.on('backend-error', (_event, error) => {
            console.error(error);
            // You can also display the error in a modal or any other way you prefer
        });

        (async () => {
            try {
                const fetchedData = await window.mongo.fetchData('abcd-collection');
                console.log(fetchedData);
                setData(fetchedData);
            } catch (error) {
                console.error('Error connecting to MongoDB:', error);
            }
        })();
    }, []);

    return (
        <div className=''>
            <div className='sticky top-0 bg-gray-400 p-3 flex items-center justify-around'>
                <button
                    className='bg-gray-500 px-10 hover:bg-blue-700 text-white font-bold py-2 rounded-sm'
                    onClick={async () => {
                        const insertData = await window.mongo.insertData('abcd-collection', {
                            hello: 'world',
                            timestamp: new Date().getTime()
                        });
                        setData([insertData, ...data]);
                    }}>add data</button>
                <h1 className='text-2xl mt-3'>total data: {data.length} found</h1>
            </div>


            <div className='mt-1'>
                {
                    data.map((d, i) => (
                        <div key={i}
                            className='border border-gray-500 p-3 flex items-center justify-between'
                        >
                            <div>
                                <p>{d.hello}</p>
                                <p>{d.timestamp}</p>
                            </div>

                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default App
