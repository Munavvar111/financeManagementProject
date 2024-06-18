import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { AsyncPipe, CommonModule, isPlatformBrowser } from '@angular/common';
import { Chart, ChartType, registerables } from 'chart.js';
import {
  Expense,
  Incomes,
  Transection,
} from '../../../../common/models/expenses.model';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule,AsyncPipe,CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
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
  doughnutChart: Chart | undefined;
  barChart: Chart | undefined;
  incomeVsExpenseChart: Chart | undefined;
  rangeForm: FormGroup;
  expenses: Expense[];
  transactions: Transection[] = [];
  filteredTransactions: Transection[] = [];
  selectedType: string = 'all'; // 'all', 'income', 'expense'


  constructor(
    private service: ApiServiceService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private fb: FormBuilder
  ) {
    this.rangeForm = this.fb.group({
      selectedRange: [''], // Initial form control value
    });
  }
  onRangeChange(): void {
    const selectedRangeValue = this.rangeForm.value.selectedRange;
    this.loadData(selectedRangeValue);
    console.log(selectedRangeValue);
  }
  ngOnInit(): void {
    //load intitial transection
    this.loadTransactions();

    this.service.getIncomeAndExpenses().subscribe(([incomes, expenses]) => {
      this.transactions = [
        ...incomes.map((item) => ({ ...item, type: 'income' })),
        ...expenses.map((item) => ({ ...item, type: 'expenses' })),
      ];
      console.log(this.transactions);
    });
    this.rangeForm.patchValue({
      selectedRange: 'last30', // Default selection
    });
    this.service.getExpenses().subscribe((result) => {
      console.log(result);
      this.chartdata = result;
      if (this.chartdata != null) {
        this.processExpenses(this.chartdata);

        //identify the number of the uniqu category
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
        this.last7DaysData = this.getLast7DaysExpenses(this.chartdata);

        if (isPlatformBrowser(this.platformId)) {
          this.RenderChart(
            this.labeldata,
            this.realdata,
            this.colordata,
            'doughnut',
            'doughnutChart'
          );
          const last7DaysLabels = this.last7DaysData.map((item) => item.date);
          const last7DaysAmounts = this.last7DaysData.map(
            (item) => item.amount
          );
          this.RenderChart(
            last7DaysLabels,
            last7DaysAmounts,
            this.colordata.slice(0, 7),
            'bar',
            'barChart'
          );
        }
      }
    });

    this.service.getIncomeDetails().subscribe((incomeResult) => {
      this.incomeData = incomeResult;
      this.processIncome(this.incomeData);
      if (this.incomeData != null) {
        // Process income if needed
        //put snack bar
      }
    });

    //initial load the dat
    this.loadData('last30');
  }

  private aggregateDataByCategory(data: Expense[]): {
    [category: string]: number;
  } {
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
  ngOnDestroy(): void {
    if (this.doughnutChart) {
      this.doughnutChart.destroy();
    }
    if (this.barChart) {
      this.barChart.destroy();
    }
  }
  private loadData(selectedRange: string): void {
    this.service.getExpenses().subscribe((expensesResult) => {
      this.chartdata = expensesResult;
      if (this.chartdata != null) {
        // Process and render charts based on selectedRange
        switch (selectedRange) {
          case 'last7':
            this.lastNDaysExpenses = this.getLastnDaysExpenses(
              this.chartdata,
              7
            );
            this.lastNDaysIncomes = this.getLastnDaysIncomes(
              this.incomeData,
              7
            );
            if (isPlatformBrowser(this.platformId)) {
              this.RenderIncomeVsExpenseChart(
                this.last7DaysData.map((item) => item.date),
                this.lastNDaysIncomes,
                this.lastNDaysExpenses
              );
            }
            break;
          case 'last30':
            if (isPlatformBrowser(this.platformId)) {
              this.RenderIncomeVsExpenseChart(
                this.getLastnDaysLabels(30),
                this.getLastnDaysIncomes(this.incomeData, 30),
                this.getLastnDaysExpenses(this.chartdata, 30)
              );
            }
            break;
          case 'last365':
            const months = [
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'May',
              'Jun',
              'Jul',
              'Aug',
              'Sep',
              'Oct',
              'Nov',
              'Dec',
            ];
            if (isPlatformBrowser(this.platformId)) {
              this.RenderIncomeVsExpenseChart(
                months,
                this.monthlyIncome,
                this.monthlyExpenses
              );
            }
            break;
          default:
            break;
        }
      }
    });
  }

  processExpenses(expenses: Expense[]): void {
    expenses.forEach((expenses) => {
      const month = new Date(expenses.date).getMonth();
      this.monthlyExpenses[month] += expenses.amount;
    });
  }

  processIncome(income: Incomes[]): void {
    income.forEach((income) => {
      const month = new Date(income.date).getMonth();
      this.monthlyIncome[month] += income.amount;
    });
  }
  RenderIncomeVsExpenseChart(
    labels: string[],
    incomes: number[],
    expenses: number[]
  ) {
    const chartElement = document.getElementById(
      'incomeVsExpenseChart'
    ) as HTMLCanvasElement;
    if (chartElement) {
      const ctx = chartElement.getContext('2d');
      if (ctx) {
        let chartInstance: Chart | undefined;
        if (this['incomeVsExpenseChart']) {
          this['incomeVsExpenseChart'].destroy();
        }
        this.incomeVsExpenseChart = new Chart(ctx, {
          type: 'line',
          data: {
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
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    }
  }

  RenderChart(
    labeldata: string[],
    maindata: number[],
    colordata: string[],
    type: ChartType,
    id: string
  ) {
    const chartElement = document.getElementById(id) as HTMLCanvasElement;
    if (chartElement) {
      const ctx = chartElement.getContext('2d');
      if (ctx) {
        let chartInstance: Chart | undefined;
        if (this[id]) {
          this[id].destroy();
        }
        chartInstance = new Chart(ctx, {
          type: type,
          data: {
            labels: labeldata,
            datasets: [
              {
                label: 'Anount',
                data: maindata,
                backgroundColor: colordata,
                borderColor: colordata.map((color) =>
                  this.adjustColor(color, -20)
                ), // Adjust border color for better visibility
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
        this[id] = chartInstance;
      }
    }
  }

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
        const index = Math.floor(
          (itemDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
        );
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

  adjustColor(color: string, amount: number): string {
    return (
      '#' +
      color
        .replace(/^#/, '')
        .replace(/../g, (color) =>
          (
            '0' +
            Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(
              16
            )
          ).substr(-2)
        )
    );
  }
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
    console.log(this.transactions)
    let filtered = this.transactions;
    if (type !== 'all') {
      filtered = this.transactions.filter(transaction => transaction.type === type);
    }

    // Sort transactions by date
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Limit to the last 5 transactions
    this.filteredTransactions = filtered.slice(0, 5);
    console.log(this.filteredTransactions)
  }
  filterTransactions(type: string): void {
    this.applyFilter(type); 
  }
}
