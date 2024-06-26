import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { AddExpensesComponent } from './addExpenses.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { CommonServiceService } from '../../../../common/services/common-service.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule } from '@angular/material/dialog';

describe('AddExpensesComponent', () => {
  let component: AddExpensesComponent;
  let fixture: ComponentFixture<AddExpensesComponent>;
  let apiService: ApiServiceService;
  let commonService: CommonServiceService;

  beforeEach(async () => {
    const apiServiceMock = {
      getCategories: jest.fn().mockReturnValue(of([{ subcategories: [{ name: 'Food' }, { name: 'Transport' }] }])),
      getAccount: jest.fn().mockReturnValue(of([{ name: 'Cash', balnce: 1000 }])),
    };

    const commonServiceMock = {
      formatedDate: jest.fn().mockReturnValue('2023-06-26'),
      handleExpenses: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        MaterialModule,
        RouterTestingModule,
        MatDialogModule,
        AddExpensesComponent // Importing the standalone component here
      ],
      providers: [
        { provide: ApiServiceService, useValue: apiServiceMock },
        { provide: CommonServiceService, useValue: commonServiceMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddExpensesComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiServiceService);
    commonService = TestBed.inject(CommonServiceService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should add a new expense form group when addExpense is called', () => {
    component.addExpense();
    const expensesFormArray = component.expenses();
    expect(expensesFormArray.length).toBe(2);
  });
});
