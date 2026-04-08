const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');
const User = require('../models/User');
const Lead = require('../models/Lead');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        await Lead.deleteMany();
        await User.deleteMany();

        // Hash common password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Create Admin
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@crm.com',
            password: hashedPassword,
            role: 'Admin'
        });

        // Create Managers
        const managers = await User.insertMany([
            { name: 'Sarah Manager', email: 'sarah@crm.com', password: hashedPassword, role: 'Manager' },
            { name: 'Mike Manager', email: 'mike@crm.com', password: hashedPassword, role: 'Manager' }
        ]);

        // Create Executives
        const executives = [];
        for (let i = 0; i < 5; i++) {
            executives.push({
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: hashedPassword,
                role: 'Executive'
            });
        }
        const createdExecutives = await User.insertMany(executives);
        const allSalesUsers = [...managers, ...createdExecutives];

        // Create Leads
        const leads = [];
        const statuses = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Converted', 'Lost'];
        const sources = ['Website', 'Facebook Ads', 'Referral', 'Cold Call', 'Other'];

        for (let i = 0; i < 50; i++) {
            const randomUser = allSalesUsers[Math.floor(Math.random() * allSalesUsers.length)];
            
            leads.push({
                name: faker.person.fullName(),
                email: faker.internet.email(),
                phone: faker.phone.number(),
                source: sources[Math.floor(Math.random() * sources.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                assignedTo: randomUser._id,
                notes: faker.lorem.paragraph(),
                followUpDate: faker.date.future(),
                createdAt: faker.date.recent({ days: 30 })
            });
        }

        await Lead.insertMany(leads);

        console.log('Dummy Data Imported...');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
