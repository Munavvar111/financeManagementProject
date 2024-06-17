import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Expense, Incomes } from '../../../../common/models/expenses.model';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import {  EventInput } from '@fullcalendar/core';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule,AsyncPipe],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: (arg) => this.handleDateClick(arg),
    events: []
  };

  constructor(private apiService: ApiServiceService) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    // Fetch income and expense data from API
    this.apiService.getIncomeDetails().subscribe(incomeData => {
      this.apiService.getExpenses().subscribe(expenseData => {
        const events: EventInput[] = [];
        // Process income data
        incomeData.forEach((income: Incomes) => {
          events.push({
            title: `Income: ${income.amount}`,
            date: income.date,
            color: 'green'
          });
        });
        // Process expense data
        expenseData.forEach((expense: Expense) => {
          events.push({
            title: `Expense: ${expense.amount}`,
            date: expense.date,
            color: 'red'
          });
        });
        // Set events for the calendar
        this.calendarOptions.events = events;
      });
    });
  }

  handleDateClick(arg) {
    alert('date click! ' + arg.dateStr)
  }
}
