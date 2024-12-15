// Get references to HTML elements
const budgetForm = document.getElementById('budget-form');
const incomeInput = document.getElementById('income');
const expenseCategoryInput = document.getElementById('expense-category');
const expenseInput = document.getElementById('expense');
const totalIncomeSpan = document.getElementById('total-income');
const totalExpensesSpan = document.getElementById('total-expenses');
const balanceSpan = document.getElementById('balance');
const monthlyBudgetSpan = document.getElementById('monthly-budget');
const expenseTableBody = document.querySelector('#expense-table tbody');
const expenseChartCanvas = document.getElementById('expense-chart').getContext('2d');

// Set a default budget
let monthlyBudget = 1000;
let totalIncome = parseFloat(localStorage.getItem('totalIncome')) || 0;
let totalExpenses = parseFloat(localStorage.getItem('totalExpenses')) || 0;
let expenseData = JSON.parse(localStorage.getItem('expenseData')) || { Food: 0, Rent: 0, Entertainment: 0, Utilities: 0, Miscellaneous: 0 };

// Update the summary display
const updateSummary = () => {
    const balance = totalIncome - totalExpenses;
    totalIncomeSpan.textContent = `$${totalIncome.toFixed(2)}`;
    totalExpensesSpan.textContent = `$${totalExpenses.toFixed(2)}`;
    balanceSpan.textContent = `$${balance.toFixed(2)}`;
    monthlyBudgetSpan.textContent = `$${monthlyBudget.toFixed(2)}`;
    if (balance < 0) {
        balanceSpan.style.color = 'red'; // Red if negative
    } else {
        balanceSpan.style.color = 'green'; // Green if positive
    }

    updateExpenseChart();
};

// Add expense to the table
const addExpenseToTable = (category, amount) => {
    const row = document.createElement('tr');

    const categoryCell = document.createElement('td');
    categoryCell.textContent = category;
    row.appendChild(categoryCell);

    const amountCell = document.createElement('td');
    amountCell.textContent = `$${amount.toFixed(2)}`;
    row.appendChild(amountCell);

    const actionCell = document.createElement('td');
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.onclick = () => {
        row.remove();
        totalExpenses -= amount;
        expenseData[category] -= amount;
        localStorage.setItem('totalExpenses', totalExpenses);
        localStorage.setItem('expenseData', JSON.stringify(expenseData));
        updateSummary();
    };
    actionCell.appendChild(deleteBtn);
    row.appendChild(actionCell);

    expenseTableBody.appendChild(row);
};

// Update the expense chart
const updateExpenseChart = () => {
    const chartData = {
        labels: Object.keys(expenseData),
        datasets: [{
            label: 'Expenses by Category',
            data: Object.values(expenseData),
            backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#FFC300'],
            borderColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#FFC300'],
            borderWidth: 1
        }]
    };

    if (window.expenseChart) {
        window.expenseChart.data = chartData;
        window.expenseChart.update();
    } else {
        window.expenseChart = new Chart(expenseChartCanvas, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: { enabled: true }
                }
            });
    }
};

// Form submit handler
budgetForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from reloading the page

    const income = parseFloat(incomeInput.value);
    const expenseCategory = expenseCategoryInput.value;
    const expense = parseFloat(expenseInput.value);

    if (!isNaN(income) && income > 0) {
        totalIncome += income;
        localStorage.setItem('totalIncome', totalIncome);
    }

    if (!isNaN(expense) && expense > 0) {
        totalExpenses += expense;
        expenseData[expenseCategory] += expense;
        addExpenseToTable(expenseCategory, expense);
        localStorage.setItem('totalExpenses', totalExpenses);
        localStorage.setItem('expenseData', JSON.stringify(expenseData));
    }

    incomeInput.value = '';  // Clear input fields
    expenseInput.value = ''; // Clear input fields

    updateSummary(); // Update the summary display
});

// Load stored data on page load
window.addEventListener('load', function () {
    // Display existing expenses
    for (const category in expenseData) {
        if (expenseData.hasOwnProperty(category)) {
            addExpenseToTable(category, expenseData[category]);
        }
    }
    updateSummary(); // Ensure summary is updated with saved data
});