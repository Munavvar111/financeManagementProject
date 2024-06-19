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
    this.apiService.getIncomeDetails().subscribe(incomeData => {
      this.apiService.getExpenses().subscribe(expenseData => {
        const eventMap: { [date: string]: { income: number, expense: number } } = {};

        // Helper function to format the date
        const formatDate = (date: string | Date): string => {
          if (typeof date === 'string') {
            return new Date(date).toISOString().split('T')[0];
          } else {
            return date.toISOString().split('T')[0];
          }
        };

        // Aggregate income data
        incomeData.forEach((income: Incomes) => {
          const formattedDate = formatDate(income.date);
          if (!eventMap[formattedDate]) {
            eventMap[formattedDate] = { income: 0, expense: 0 };
          }
          eventMap[formattedDate].income += income.amount;
          console.log(eventMap[formattedDate].income)
        });

        // Aggregate expense data
        expenseData.forEach((expense: Expense) => {
          const formattedDate = formatDate(expense.date);
          if (!eventMap[formattedDate]) {
            eventMap[formattedDate] = { income: 0, expense: 0 };
          }
          eventMap[formattedDate].expense += expense.amount;
        });

        // Create events array
        const events: EventInput[] = [];
        for (const date in eventMap) {
          if (eventMap[date].income > 0) {
            events.push({
              title: `Income: $${eventMap[date].income.toFixed(2)}`,
              date: date,
              color: 'green'
            });
          }
          if (eventMap[date].expense > 0) {
            events.push({
              title: `Expense: $${eventMap[date].expense.toFixed(2)}`,
              date: date,
              color: 'red'
            });
          }
        }

        // Set events for the calendar
        this.calendarOptions.events = events;
      });
    });
  }

  handleDateClick(arg) {
    alert('date click! ' + arg.dateStr)
  }
}
