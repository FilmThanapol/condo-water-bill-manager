import { db } from '@/db';
import { waterReadings } from '@/db/schema';

async function main() {
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const timestamp = currentDate.toISOString();

    const sampleWaterReadings = [
        {
            roomId: 1,
            month: currentMonth,
            lastMonth: 150,
            thisMonth: 180,
            usage: 30,
            pricePerUnit: 5.0,
            totalPrice: 150,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            roomId: 2,
            month: currentMonth,
            lastMonth: 200,
            thisMonth: 235,
            usage: 35,
            pricePerUnit: 5.0,
            totalPrice: 175,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            roomId: 3,
            month: currentMonth,
            lastMonth: 180,
            thisMonth: 210,
            usage: 30,
            pricePerUnit: 5.0,
            totalPrice: 150,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            roomId: 4,
            month: currentMonth,
            lastMonth: 250,
            thisMonth: 290,
            usage: 40,
            pricePerUnit: 5.0,
            totalPrice: 200,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            roomId: 5,
            month: currentMonth,
            lastMonth: 170,
            thisMonth: 195,
            usage: 25,
            pricePerUnit: 5.0,
            totalPrice: 125,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            roomId: 6,
            month: currentMonth,
            lastMonth: 220,
            thisMonth: 265,
            usage: 45,
            pricePerUnit: 5.0,
            totalPrice: 225,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            roomId: 7,
            month: currentMonth,
            lastMonth: 190,
            thisMonth: 215,
            usage: 25,
            pricePerUnit: 5.0,
            totalPrice: 125,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            roomId: 8,
            month: currentMonth,
            lastMonth: 280,
            thisMonth: 330,
            usage: 50,
            pricePerUnit: 5.0,
            totalPrice: 250,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            roomId: 9,
            month: currentMonth,
            lastMonth: 160,
            thisMonth: 195,
            usage: 35,
            pricePerUnit: 5.0,
            totalPrice: 175,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
        {
            roomId: 10,
            month: currentMonth,
            lastMonth: 240,
            thisMonth: 280,
            usage: 40,
            pricePerUnit: 5.0,
            totalPrice: 200,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
    ];

    await db.insert(waterReadings).values(sampleWaterReadings);
    
    console.log('✅ Water readings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});