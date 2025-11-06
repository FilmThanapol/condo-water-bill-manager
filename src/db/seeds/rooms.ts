import { db } from '@/db';
import { rooms } from '@/db/schema';

async function main() {
    const sampleRooms = [
        {
            roomNumber: '101',
            ownerName: 'John Doe',
            createdAt: new Date().toISOString(),
        },
        {
            roomNumber: '102',
            ownerName: 'Jane Smith',
            createdAt: new Date().toISOString(),
        },
        {
            roomNumber: '201',
            ownerName: 'Michael Johnson',
            createdAt: new Date().toISOString(),
        },
        {
            roomNumber: '202',
            ownerName: 'Emily Davis',
            createdAt: new Date().toISOString(),
        },
        {
            roomNumber: '301',
            ownerName: 'Robert Brown',
            createdAt: new Date().toISOString(),
        },
        {
            roomNumber: '302',
            ownerName: 'Sarah Wilson',
            createdAt: new Date().toISOString(),
        },
        {
            roomNumber: '401',
            ownerName: 'David Martinez',
            createdAt: new Date().toISOString(),
        },
        {
            roomNumber: '402',
            ownerName: 'Jennifer Garcia',
            createdAt: new Date().toISOString(),
        },
        {
            roomNumber: '501',
            ownerName: 'James Rodriguez',
            createdAt: new Date().toISOString(),
        },
        {
            roomNumber: '502',
            ownerName: 'Lisa Anderson',
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(rooms).values(sampleRooms);
    
    console.log('✅ Rooms seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});