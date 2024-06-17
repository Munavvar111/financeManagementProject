import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { isPlatformBrowser } from '@angular/common';
import { Chart,ChartType,registerables } from 'chart.js';
import { Expense, Incomes } from '../../../../common/models/expenses.model';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CanvasJSAngularChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
    chartdata: Expense[];
  labeldata: string[] = [];
  incomeData: Incomes[];
  realdata: number[] = [];
  colordata: string[] = [];
  last7DaysData: { date: string, amount: number }[] = [];
  monthlyExpenses: number[] = Array(12).fill(0);
  monthlyIncome: number[] = Array(12).fill(0);
  doughnutChart: Chart | undefined;
  barChart: Chart | undefined;
  incomeVsExpenseChart: Chart | undefined;


  constructor(private service: ApiServiceService, @Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    this.service.getExpenses().subscribe(result => {
      console.log(result);
      this.chartdata = result;
      if (this.chartdata != null) {
        this.processExpenses(this.chartdata);
      
        const aggregatedData =this.aggregateDataByCategory(this.chartdata);


        
        this.labeldata=[];
        this.realdata=[];
        this.colordata=[];
        
        const categories=Object.keys(aggregatedData);
        for (let i = 0; i < categories.length; i++) {
          const category = categories[i];
          const amount = aggregatedData[category];
  
          this.labeldata.push(category);
          this.realdata.push(amount);
          this.colordata.push(this.getRandomColor(i, categories.length));
        }
        this.last7DaysData = this.getLast7DaysExpenses(this.chartdata);
        
        if (isPlatformBrowser(this.platformId)) {
          this.RenderChart(this.labeldata, this.realdata, this.colordata, 'doughnut', 'doughnutChart');
          const last7DaysLabels = this.last7DaysData.map(item => item.date);
          const last7DaysAmounts = this.last7DaysData.map(item => item.amount);
          this.RenderChart(last7DaysLabels, last7DaysAmounts, this.colordata.slice(0, 7), 'bar', 'barChart');
        }
      }
    });
    this.service.getIncomeDetails().subscribe(result => {
      this.incomeData = result;
      if (this.incomeData != null) {
        this.processIncome(this.incomeData);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        if (isPlatformBrowser(this.platformId)) {
          this.RenderIncomeVsExpenseChart(months, this.monthlyIncome, this.monthlyExpenses);
        }
      }
    });

  }

  private aggregateDataByCategory(data:any[]):{[category:string]:number}{
    const aggregatedData = {};
    for(const item of data){
      const category=item.category;
      const amount=item.amount
    if(aggregatedData[category]){
      aggregatedData[category]+=amount
    }
    else{
      aggregatedData[category]=amount;
    }
    
  }
  return aggregatedData

  }
  ngOnDestroy(): void {
    if (this.doughnutChart) {
      this.doughnutChart.destroy();
    }
    if (this.barChart) {
      this.barChart.destroy();
    }
    
  }

  processExpenses(expenses:Expense[]):void{
    expenses.forEach(expenses=>{
      const month=new Date(expenses.date).getMonth();
      this.monthlyExpenses[month]+=expenses.amount
    })
  }

  processIncome(income:Incomes[]):void{
    income.forEach(income=>{
      const month=new Date(income.date).getMonth();
      this.monthlyIncome[month]+=income.amount;
    })
  }
  RenderIncomeVsExpenseChart(months: string[], incomes: number[], expenses: number[]) {
    if (isPlatformBrowser(this.platformId)) {
      const chartElement = document.getElementById('incomeVsExpenseChart') as HTMLCanvasElement;
      if (chartElement) {
        const ctx = chartElement.getContext('2d');
        if (ctx) {
          if (this.incomeVsExpenseChart) {
            this.incomeVsExpenseChart.destroy();
          }
          this.incomeVsExpenseChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: months,
              datasets: [
                {
                  label: 'Income',
                  data: incomes,
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1,
                  fill: false,
                  tension: 0.1
                },
                {
                  label: 'Expense',
                  data: expenses,
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  borderColor: 'rgba(255, 99, 132, 1)',
                  borderWidth: 1,
                  fill: false,
                  tension: 0.1
                }
              ]
            },
            options: {
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });
        }
      }
    }
  }

  RenderChart(labeldata: string[], maindata: number[], colordata: string[], type: ChartType, id: string) {
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
              datasets: [{
                label: 'Anount',
                data: maindata,
                backgroundColor: colordata,
                borderColor: colordata.map(color => this.adjustColor(color, -20)), // Adjust border color for better visibility
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
          });
          this[id] = chartInstance;
        }
      }
  }

  getLast7DaysExpenses(data: any[]): { date: string, amount: number }[] {
    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push({ date: date.toDateString(), amount: 0 });
    }
    data.forEach(item => {
      const itemDate = new Date(item.date).toDateString();
      const day = last7Days.find(d => d.date === itemDate);
      if (day) {
        day.amount += parseFloat(item.amount);
      }
    });
    return last7Days;
  }


  getRandomColor(index: number, total: number): string {
    const hue = Math.floor((360 / total) * index);
    return `hsl(${hue}, 70%, 50%)`;
  }

  adjustColor(color: string, amount: number): string {
    return '#' + color.replace(/^#/, '').replace(/../g, color =>
      ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2)
    );
  }
}
