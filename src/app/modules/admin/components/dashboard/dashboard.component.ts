import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { Expense, Incomes, PaymentType, Transection } from '../../../../common/models/expenses.model';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { GenericChartComponent } from '../../../../common/chart/generic-chart/generic-chart.component';
import { response } from 'express';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule, CommonModule, GenericChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  chartdata: Expense[];
  labeldata: string[] = [];
  incomeData: Incomes[];
  realdata: number[] = [];
  colordata: string[] = [];
  last7DaysData: { date: string; amount: number }[] = [];
  lastNDaysExpenses: number[] = [];
  lastNDaysIncomes: number[] = [];
  monthlyExpenses: number[] = Array(12).fill(0);
  monthlyIncome: number[] = Array(12).fill(0);
  rangeForm: FormGroup;
  totalBalance:number=0;
  currentMonthExpenses: number; 
  previousMonthExpenses: number; 
  currentMonthIncome: number; 
  previousMonthIncome: number;

  PaymentType:PaymentType[];
  expenses: Expense[];
  transactions: Transection[] = [];
  filteredTransactions: Transection[] = [];
  selectedType: string = 'all';
  creditCardLimit: number = 100000;  // Define the credit card limit
  currentCreditUsage: number ; // Define the current credit usage

  doughnutChartData: ChartConfiguration['data'] | null = null;
  doughnutChartOptions: ChartConfiguration['options'] | null = null;
  doughnutChartDataCurrentMonthData: ChartConfiguration['data'] | null = null;
  doughnutChartDataCurrentMonthOptions: ChartConfiguration['options'] | null = null;
  doughnutChartDataLastMonthData: ChartConfiguration['data'] | null = null;
  doughnutChartDataLastMonthOptions: ChartConfiguration['options'] | null = null;
  barChartData: ChartConfiguration['data'] | null = null;
  barChartOptions: ChartConfiguration['options'] | null = null;
  incomeVsExpenseChartData: ChartConfiguration['data'] | null = null;
  incomeVsExpenseChartOptions: ChartConfiguration['options'] | null = null;

  constructor(
    private service: ApiServiceService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef

  ) {
    this.rangeForm = this.fb.group({
      selectedRange: [''], // Initial form control value
    });
  }

  onRangeChange(): void {
    const selectedRangeValue = this.rangeForm.value.selectedRange;
    this.loadData(selectedRangeValue);
    // this.cdr.detectChanges()
    console.log(selectedRangeValue);
  }

  ngOnInit(): void {
    this.loadTransactions();
    this.rangeForm.patchValue({ selectedRange: 'last30' });
    this.loadInitialData();
    this.getTotalBalance();
    this.getCurrentAndPreviousMonthData()
    console.log(this.currentMonthExpenses)

  }

  getTotalBalance(){
    this.service.getAccount().subscribe({
      next:(response:PaymentType[])=>{
        this.PaymentType=response;
        this.currentCreditUsage=response.find(item=>item.name=='Credit').balnce;
        this.totalBalance = response.reduce((acc, item) => acc + (item.balnce || 0), 0);
        console.log(this.totalBalance)
      
      }
    })
  } 
  get usagePercentage(): number {
    return (this.currentCreditUsage / this.creditCardLimit) * 100;
  }

  loadInitialData(): void {
    this.service.getIncomeAndExpenses().subscribe(([incomes, expenses]) => {
      this.transactions = [
        ...incomes.map(item => ({ ...item, type: 'income' })),
        ...expenses.map(item => ({ ...item, type: 'expenses' })),
      ];
      console.log(this.transactions);
    });

    this.service.getExpenses().subscribe((result) => {
      console.log(result);
      this.chartdata = result;
      if (this.chartdata != null) {
        this.processExpenses(this.chartdata)
        this.initializeDoughnutChart();
        this.initializeBarChart();
        
      }
    });

    this.service.getIncomeDetails().subscribe((incomeResult) => {
      this.incomeData = incomeResult;
      this.processIncome(this.incomeData);
      this.getCurrentAndPreviousMonthData();
      this.initializeDoughnutChartForCurrentMonth();
      this.initializeDoughnutChartForLastMonth();
    });

    this.loadData('last365');
  }
  initializeDoughnutChartForCurrentMonth(): void {
    this.labeldata = ["Income", "Expenses"];
    this.realdata = [this.currentMonthIncome, this.currentMonthExpenses];
    this.colordata = [this.getRandomColor(1, 3), this.getRandomColor(0, 2)];

    this.doughnutChartDataCurrentMonthData = {
      labels: this.labeldata,
      datasets: [{
        data: this.realdata,
        backgroundColor: this.colordata,
      }],
    };
    this.doughnutChartDataCurrentMonthOptions = {
      responsive: true,
    };
  }

  initializeDoughnutChartForLastMonth(): void {
    this.labeldata = ["Income", "Expenses"];
    this.realdata = [this.previousMonthIncome, this.previousMonthExpenses];
    this.colordata = [this.getRandomColor(1, 3), this.getRandomColor(0, 2)];

    this.doughnutChartDataLastMonthData = {
      labels: this.labeldata,
      datasets: [{
        data: this.realdata,
        backgroundColor: this.colordata,
      }],
    };
    this.doughnutChartDataLastMonthOptions = {
      responsive: true,

    };
  }
  //initialize the doughnutchart of the category
  initializeDoughnutChart(): void {
    const aggregatedData = this.aggregateDataByCategory(this.chartdata);

    this.labeldata = [];
    this.realdata = [];
    this.colordata = [];

    const categories = Object.keys(aggregatedData);
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const amount = aggregatedData[category];

      this.labeldata.push(category);
      this.realdata.push(amount);
      this.colordata.push(this.getRandomColor(i, categories.length));
    }

    this.doughnutChartData = {
      labels: this.labeldata,
      datasets: [
        {
          data: this.realdata,
          backgroundColor: this.colordata,
        },
      ],
    };
    this.doughnutChartOptions = {
      responsive: true,
      maintainAspectRatio:false,

    };
  }
  //initialize the bar chart data in data
  initializeBarChart(): void {
    this.last7DaysData = this.getLast7DaysExpenses(this.chartdata);
    const last7DaysLabels = this.last7DaysData.map((item) => item.date);
    const last7DaysAmounts = this.last7DaysData.map((item) => item.amount);
    console.log(last7DaysAmounts)
    console.log(last7DaysLabels)

    this.barChartData = {
      labels: last7DaysLabels,
      datasets: [
        {
          label:"Expenses",
          data: last7DaysAmounts,
          backgroundColor: 'red',
        },
      ],
    };
    this.barChartOptions = {
      responsive: true,

      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };
  }

  getCurrentAndPreviousMonthData(): void {
    const now = new Date();
    const currentMonth = now.getMonth();
    const previousMonth = (currentMonth === 0) ? 11 : currentMonth - 1;

    this.currentMonthExpenses = this.monthlyExpenses[currentMonth];
    this.previousMonthExpenses = this.monthlyExpenses[previousMonth];
    this.currentMonthIncome = this.monthlyIncome[currentMonth];
    this.previousMonthIncome = this.monthlyIncome[previousMonth];
  }

  //add all expenses for the particular category
  private aggregateDataByCategory(data: Expense[]): { [category: string]: number } {
    const aggregatedData = {};
    for (const item of data) {
      const category = item.category;
      const amount = item.amount;
      if (aggregatedData[category]) {
        aggregatedData[category] += amount;
      } else {
        aggregatedData[category] = amount;
      }
    }
    return aggregatedData;
  }

  //load the initial data for the money flow diagram in line chart
  private loadData(selectedRange: string): void {
    console.log(selectedRange)
    this.service.getExpenses().subscribe((expensesResult) => {
      this.chartdata = expensesResult;
      if (this.chartdata != null) {
        switch (selectedRange) {
          case 'last7':
            console.log("hiiiasda")
            this.lastNDaysExpenses = this.getLastnDaysExpenses(this.chartdata, 7);
            this.lastNDaysIncomes = this.getLastnDaysIncomes(this.incomeData, 7);
            this.initializeIncomeVsExpenseChart(this.last7DaysData.map((item) => item.date), this.lastNDaysIncomes, this.lastNDaysExpenses);
            break;
          case 'last30':
            this.initializeIncomeVsExpenseChart(this.getLastnDaysLabels(30), this.getLastnDaysIncomes(this.incomeData, 30), this.getLastnDaysExpenses(this.chartdata, 30));
            break;
          case 'last365':
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            this.initializeIncomeVsExpenseChart(months, this.monthlyIncome, this.monthlyExpenses);
            break;
          default:
            break;
        }
      }
    });
  }


  //get the monthely expenses add all expenses that credited in months
  processExpenses(expenses: Expense[]): void {
    expenses.forEach((expense) => {
      const month = new Date(expense.date).getMonth();
      console.log(month )
      this.monthlyExpenses[month] += expense.amount;
    });
  }

  //get the monthely income add all income that recived in months
  processIncome(income: Incomes[]): void {
    income.forEach((income) => {
      const month = new Date(income.date).getMonth();
      this.monthlyIncome[month] += income.amount;
    });
  }

  //config for the income vs expenses chart
  initializeIncomeVsExpenseChart(labels: string[], incomes: number[], expenses: number[]): void {
    this.incomeVsExpenseChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Income',
          data: incomes,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          fill: false,
          tension: 0.1,
        },
        {
          label: 'Expense',
          data: expenses,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          fill: false,
          tension: 0.1,
        },
      ],
    };
    this.incomeVsExpenseChartOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };

  }

  //bar chart get last 7 day expenses
  getLast7DaysExpenses(data: any[]): { date: string; amount: number }[] {
    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push({ date: date.toDateString(), amount: 0 });
    }
    data.forEach((item) => {
      const itemDate = new Date(item.date).toDateString();
      const day = last7Days.find((d) => d.date === itemDate);
      if (day) {
        day.amount += parseFloat(item.amount);
      }
    });
    return last7Days;
  }

  //get last n day labels for the chart
  private getLastnDaysLabels(days: number): string[] {
    const labels = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString());
    }
    return labels;
  }

  private getLastnDaysExpenses(data: Expense[], days: number): number[] {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (days - 1));

    const expenses = Array(days).fill(0);

    data.forEach((item) => {
      const itemDate = new Date(item.date);
      if (itemDate >= startDate && itemDate <= today) {
        const index = Math.floor((itemDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)+1);
        expenses[index] += item.amount;
      }
    });

    return expenses;
  }

  private getLastnDaysIncomes(data: Incomes[], days: number): number[] {  
    const today = new Date();
    const lastNDaysIncomes: number[] = Array(days).fill(0);

    data.forEach((income) => {
      const incomeDate = new Date(income.date);
      const diffTime = Math.abs(today.getTime() - incomeDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= days) {
        lastNDaysIncomes[days - diffDays] += income.amount;
      }
    });

    return lastNDaysIncomes;
  }

  getRandomColor(index: number, total: number): string {
    const hue = Math.floor((360 / total) * index);
    return `hsl(${hue}, 70%, 50%)`;
  }

  
  //recent transection 
  loadTransactions(): void {
    this.service.getIncomeAndExpenses().subscribe(([income, expenses]) => {
      this.transactions = [
        ...income.map(item => ({ ...item, type: 'income', icon: 'assets/income.jpg' })), // Add appropriate icon
        ...expenses.map(item => ({ ...item, type: 'expense', icon: 'assets/expenses.png' })) // Add appropriate icon
      ];
      this.applyFilter(this.selectedType);
    });
  }

  applyFilter(type: string): void {
    this.selectedType = type;
    let filtered = this.transactions;
    if (type !== 'all') {
      filtered = this.transactions.filter(transaction => transaction.type === type);
    }

    // Sort transactions by date
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Limit to the last 5 transactions
    this.filteredTransactions = filtered.slice(0, 5);
  }

  filterTransactions(type: string): void {
    this.applyFilter(type); 
  }
}
