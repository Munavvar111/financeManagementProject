import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { AccountsComponent } from './accounts.component';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AccountsComponent', () => {
  let component: AccountsComponent;
  let fixture: ComponentFixture<AccountsComponent>;
  let apiService: ApiServiceService;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    const apiServiceMock = {
      getAccount: jest.fn().mockReturnValue(of([{ id: '1', name: 'Savings', balance: 500 }])),
      postAccount: jest.fn().mockReturnValue(of({ id: '2', name: 'Checking', balance: 1000 })),
      updateAccount: jest.fn().mockReturnValue(of({ id: '1', name: 'Savings', balance: 600 })),
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatDialogModule,
        MatSnackBarModule,
        NgxSkeletonLoaderModule,
        NoopAnimationsModule,
        MaterialModule,
        AccountsComponent
      ],
      providers: [
        { provide: ApiServiceService, useValue: apiServiceMock },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiServiceService);
    snackBar = TestBed.inject(MatSnackBar); // Inject MatSnackBar for spying
    fixture.detectChanges();
  });

  it('should add a new account successfully', fakeAsync(() => {
    // Set up the form data
    component.accountForm.setValue({
      accountName: 'New Account',
      accountBalance: 1000
    });

    const snackBarOpenSpy = jest.spyOn(snackBar, 'open').mockReturnValue(null);

    component.onSubmit();
    fixture.detectChanges();

    tick();

    expect(apiService.postAccount).toHaveBeenCalledWith({
      name: 'New Account',
      balnce: 1000,
      userId: component.userId
    });

    expect(component.accounts.length).toBeGreaterThan(1);

    expect(component.accountForm.value).toEqual({
      accountName: null,
      accountBalance: null
    });
  }));

});
