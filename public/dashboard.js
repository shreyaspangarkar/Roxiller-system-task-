document.addEventListener('DOMContentLoaded', () => {
    const monthSelect = document.getElementById('monthSelect');
    const searchBox = document.getElementById('searchBox');
    const transactionsTableBody = document.getElementById('transactionsTable').querySelector('tbody');
    
    // Statistics Elements
    const totalSales = document.getElementById('totalSales');
    const soldItems = document.getElementById('soldItems');
    const unsoldItems = document.getElementById('unsoldItems');

    // Combined Statistics Elements
    const combinedTotalSales = document.getElementById('combinedTotalSales');
    const combinedSoldItems = document.getElementById('combinedSoldItems');
    const combinedUnsoldItems = document.getElementById('combinedUnsoldItems');

    // Chart Elements
    const barChartCanvas = document.getElementById('barChart');
    const pieChartCanvas = document.getElementById('pieChart');

    let currentMonth = '3'; // Default to March

     // Function to fetch transactions for the selected month
     async function fetchTransactions() {
         const res = await fetch(`/api/transactions?month=${currentMonth}`);
         const data = await res.json();
         displayTransactions(data.data);
     }

     // Function to fetch statistics for the selected month
     async function fetchStatistics() {
         const res = await fetch(`/api/statistics?month=${currentMonth}`);
         const data = await res.json();
         totalSales.textContent = data.totalSaleAmount.toFixed(2); // Format as currency
         soldItems.textContent = data.totalSoldItems;
         unsoldItems.textContent = data.totalNotSoldItems;
     }

     // Function to fetch bar chart data for the selected month
     async function fetchBarChartData() {
         const res = await fetch(`/api/barchart?month=${currentMonth}`);
         const data = await res.json();
         displayBarChart(data);
     }

     // Function to fetch pie chart data for the selected month
     async function fetchPieChartData() {
         const res = await fetch(`/api/piechart?month=${currentMonth}`);
         const data = await res.json();
         displayPieChart(data);
     }

     // Function to fetch combined statistics for the selected month
     async function fetchCombinedStatistics() {
         const res = await fetch(`/api/combined?month=${currentMonth}`);
         const data = await res.json();
         combinedTotalSales.textContent = data.statistics.totalSaleAmount.toFixed(2); // Format as currency
         combinedSoldItems.textContent = data.statistics.totalSoldItems;
         combinedUnsoldItems.textContent = data.statistics.totalNotSoldItems; 
     }

     // Function to display transactions in the table
     function displayTransactions(transactions) {
         transactionsTableBody.innerHTML = ''; // Clear previous data
         transactions.forEach(transaction => {
             const row = document.createElement('tr');
             row.innerHTML = `
                 <td>${transaction.id}</td>
                 <td>${transaction.title}</td>
                 <td>${transaction.description}</td>
                 <td>$${transaction.price}</td>
                 <td>${new Date(transaction.dateOfSale).toLocaleDateString()}</td> <!-- Format date -->
                 <td>${transaction.sold ? 'Sold' : 'Not Sold'}</td>
             `;
             transactionsTableBody.appendChild(row);
         });
     }

     // Function to display bar chart
     function displayBarChart(data) {
         const labels = Object.keys(data);
         const values = Object.values(data);

         new Chart(barChartCanvas, {
             type: 'bar',
             data: {
                 labels,
                 datasets: [{
                     label: 'Items Sold in Price Range',
                     data: values,
                     backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33A0', '#FFC300', '#DAF7A6']
                 }]
             },
             options: {
                 responsive: true,
                 scales: { y: { beginAtZero: true } }
             }
         });
     }

     // Function to display pie chart
     function displayPieChart(data) {
         new Chart(pieChartCanvas, {
             type: 'pie',
             data: {
                 labels: ['Sold Items', 'Unsold Items'],
                 datasets: [{
                     label: 'Item Status',
                     data: [data.soldItems, data.unsoldItems],
                     backgroundColor: ['#36A2EB', '#FF6384']
                 }]
             },
             options: { responsive: true }
         });
     }

     // Event listener for changing the month
     monthSelect.addEventListener('change', (event) => {
         currentMonth = event.target.value; 
         fetchTransactions();
         fetchStatistics();
         fetchBarChartData();
         fetchPieChartData();
         fetchCombinedStatistics();
     });

     // Event listener for search input
     searchBox.addEventListener('input', async (event) => {
         const searchQuery = event.target.value.toLowerCase();
         const res = await fetch(`/api/transactions?month=${currentMonth}`);
         const data = await res.json();
         
         const filteredTransactions = data.data.filter(transaction =>
             transaction.title.toLowerCase().includes(searchQuery) ||
             transaction.description.toLowerCase().includes(searchQuery) ||
             transaction.price.toString().includes(searchQuery)
         );
         
         displayTransactions(filteredTransactions);
     });

     // Initial data load
     fetchTransactions();
     fetchStatistics();
     fetchBarChartData();
     fetchPieChartData();
     fetchCombinedStatistics();
});