const express = require('express');
const axios = require('axios');
const router = express.Router();
const dotenv = require('dotenv');

dotenv.config();
const API_URL = process.env.API_URL;

/**
 * 1. Transactions Endpoint
 * GET /api/transactions
 * Query Params: page, perPage, search, month
 */
router.get('/transactions', async (req, res) => {
    let { page = 1, perPage = 10, search = '', month } = req.query;
    page = parseInt(page);
    perPage = parseInt(perPage);
    search = search.trim().toLowerCase();

    try {
        const response = await axios.get(API_URL);
        const transactions = response.data;

        // Filter transactions based on search term and month
        let filteredTransactions = transactions.filter(transaction =>
            transaction.title?.toLowerCase().includes(search) ||
            transaction.description?.toLowerCase().includes(search) ||
            transaction.price?.toString().includes(search)
        );

        if (month) {
            filteredTransactions = filteredTransactions.filter(transaction => {
                const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1;
                return transactionMonth === parseInt(month);
            });
        }

        const total = filteredTransactions.length;
        const paginatedTransactions = filteredTransactions.slice((page - 1) * perPage, page * perPage);

        res.json({ total, page, perPage, data: paginatedTransactions });
    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * 2. Statistics Endpoint
 * GET /api/statistics
 * Query Params: month
 */
router.get('/statistics', async (req, res) => {
    const { month } = req.query;

    try {
        const response = await axios.get(API_URL);
        const transactions = response.data;

        // Filter transactions based on the specified month
        const filteredTransactions = transactions.filter(transaction => {
            const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1;
            return transactionMonth === parseInt(month);
        });

        const totalSaleAmount = filteredTransactions.reduce((sum, t) => sum + t.price, 0);
        const totalSoldItems = filteredTransactions.filter(t => t.sold).length;
        const totalNotSoldItems = filteredTransactions.filter(t => !t.sold).length;

        res.json({ totalSaleAmount, totalSoldItems, totalNotSoldItems });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

/**
 * 3. Bar Chart Data Endpoint
 * GET /api/barchart
 * Query Params: month
 */
router.get('/barchart', async (req, res) => {
    const { month } = req.query;

    try {
        const response = await axios.get(API_URL);
        const transactions = response.data;

        const filteredTransactions = transactions.filter(transaction => {
            const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1;
            return transactionMonth === parseInt(month);
        });

        // Calculate price ranges
        const priceRanges = { "0-100": 0, "101-200": 0, "201-300": 0, "301-400": 0, "401-500": 0, "501+": 0 };

        filteredTransactions.forEach(transaction => {
            if (transaction.price <= 100) priceRanges["0-100"]++;
            else if (transaction.price <= 200) priceRanges["101-200"]++;
            else if (transaction.price <= 300) priceRanges["201-300"]++;
            else if (transaction.price <= 400) priceRanges["301-400"]++;
            else if (transaction.price <= 500) priceRanges["401-500"]++;
            else priceRanges["501+"]++;
        });

        res.json(priceRanges);
    } catch (error) {
        console.error('Error fetching bar chart data:', error);
        res.status(500).json({ error: 'Failed to fetch bar chart data' });
    }
});

/**
 * 4. Pie Chart Data Endpoint
 * GET /api/piechart
 * Query Params: month
 */
router.get('/piechart', async (req, res) => {
    const { month } = req.query;

    try {
        const response = await axios.get(API_URL);
        const transactions = response.data;

        const filteredTransactions = transactions.filter(transaction => {
            const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1;
            return transactionMonth === parseInt(month);
        });

        const soldItems = filteredTransactions.filter(t => t.sold).length;
        const unsoldItems = filteredTransactions.filter(t => !t.sold).length;

        res.json({ soldItems, unsoldItems });
    } catch (error) {
        console.error('Error fetching pie chart data:', error);
        res.status(500).json({ error: 'Failed to fetch pie chart data' });
    }
});

/**
 * 5. Combined Statistics Endpoint
 * GET /api/combined
 * Query Params: month
 */
router.get('/combined', async (req, res) => {
    const { month } = req.query;

    try {
        const [transactionsRes, barChartRes, pieChartRes] = await Promise.all([
            axios.get(`${API_URL}`),
            axios.get(`${API_URL}`),
            axios.get(`${API_URL}`)
        ]);

        const transactions = transactionsRes.data;
        const filteredTransactions = transactions.filter(transaction => {
            const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1;
            return transactionMonth === parseInt(month);
        });

        // Gather combined statistics
        const totalSaleAmount = filteredTransactions.reduce((sum, t) => sum + t.price, 0);
        const totalSoldItems = filteredTransactions.filter(t => t.sold).length;
        const totalNotSoldItems = filteredTransactions.filter(t => !t.sold).length;

        const combinedData = {
            statistics: { totalSaleAmount, totalSoldItems, totalNotSoldItems },
            barChart: barChartRes.data,
            pieChart: pieChartRes.data
        };

        res.json(combinedData);
    } catch (error) {
        console.error('Error fetching combined data:', error);
        res.status(500).json({ error: 'Failed to fetch combined data' });
    }
});

module.exports = router;
