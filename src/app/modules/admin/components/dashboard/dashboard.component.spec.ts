import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { GenericChartComponent } from '../../../../common/chart/generic-chart/generic-chart.component';
import { Expense, Incomes, PaymentType } from '../../../../common/models/expenses.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let apiServiceSpy: jest.Mocked<ApiServiceService>;

  beforeEach(async () => {
    apiServiceSpy = {
      getExpenses: jest.fn(),
      getIncomeDetails: jest.fn(),
      getIncomeAndExpenses: jest.fn(),
      getAccount: jest.fn()
    } as unknown as jest.Mocked<ApiServiceService>;

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MaterialModule, CommonModule],
      declarations: [DashboardComponent, GenericChartComponent],
      providers: [{ provide: ApiServiceService, useValue: apiServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    // Mock data
    apiServiceSpy.getExpenses.mockReturnValue(of([{ date: new Date().toISOString(), amount: 100, category: 'Food' } as Expense]));
    apiServiceSpy.getIncomeDetails.mockReturnValue(of([{ date: new Date().toISOString(), amount: 200 } as Incomes]));
    apiServiceSpy.getIncomeAndExpenses.mockReturnValue(of([
      [{ date: new Date().toISOString(), amount: 200 } as Incomes],
      [{ date: new Date().toISOString(), amount: 100 } as Expense]
    ]));
    apiServiceSpy.getAccount.mockReturnValue(of([{ balnce: 500 } as PaymentType]));

    fixture.detectChanges(); // ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
