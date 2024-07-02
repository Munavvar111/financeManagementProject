import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountsComponent } from './accounts.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { of, throwError } from 'rxjs';
import { AddAccountsComponent } from './add-accounts/add-accounts.component';

describe('AccountsComponent', () => {
  let component: AccountsComponent;
  let fixture: ComponentFixture<AccountsComponent>;
  let mockApiService: jest.Mocked<ApiServiceService>;
  let mockMatDialog: jest.Mocked<MatDialog>;
  let mockMatSnackBar: jest.Mocked<MatSnackBar>;

  beforeEach(async () => {
    const apiSpy = {
      postAccount: jest.fn()
    } as unknown as jest.Mocked<ApiServiceService>;
    const dialogSpy = {
      open: jest.fn()
    } as unknown as jest.Mocked<MatDialog>;
    const snackBarSpy = {
      open: jest.fn()
    } as unknown as jest.Mocked<MatSnackBar>;

    await TestBed.configureTestingModule({
      imports: [
        AccountsComponent,
        ReactiveFormsModule,
        MatDialogModule,
        MatSnackBarModule
      ],
      providers: [
        FormBuilder,
        { provide: ApiServiceService, useValue: apiSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsComponent);
    component = fixture.componentInstance;
    mockApiService = TestBed.inject(ApiServiceService) as jest.Mocked<ApiServiceService>;
    mockMatDialog = TestBed.inject(MatDialog) as jest.Mocked<MatDialog>;
    mockMatSnackBar = TestBed.inject(MatSnackBar) as jest.Mocked<MatSnackBar>;
  });

  it('should initialize component correctly', () => {
    expect(component).toBeTruthy();
    expect(component.accountForm).toBeDefined();
    expect(component.editForm).toBeDefined();
    expect(component.accounts).toEqual([]);
    expect(component.editIndex).toBeNull();
    expect(component.dataIsLoad).toBe(false);
  });

  it('should load accounts on initialization', () => {
    // Mock user data in localStorage
    const mockUser = { id: 'testUserId' };
    localStorage.setItem('user', JSON.stringify(mockUser));

    // Mock API response
    const mockAccounts = [
      { name: 'Account 1', balnce: 100,userId:"123" },
      { name: 'Account 2', balnce: 200,userId:"123" }
    ];
    mockApiService.getAccount.mockReturnValue(of(mockAccounts));

    // Trigger ngOnInit
    component.ngOnInit();

    // Expectations
    expect(component.userId).toEqual(mockUser.id);
    expect(mockApiService.getAccount).toHaveBeenCalledWith(mockUser.id);
    expect(component.accounts).toEqual(mockAccounts);
    expect(component.dataIsLoad).toBe(true);
  });

  it('should open add account dialog', () => {
    // Mock dialog result and form data
    const formData = {
      accountName: 'New Account',
      accountBalance: '500'
    };

    spyOn(mockMatDialog, 'open').and.returnValue({
      afterClosed: () => of(formData)
    } as any);

    // Trigger openDialog
    component.openDialog();

    // Expectations
    expect(mockMatDialog.open).toHaveBeenCalledWith(AddAccountsComponent, jasmine.any(Object));
    expect(component.accountForm.value).toEqual(formData);
    // Add more expectations based on your component's behavior after dialog is closed
  });

  it('should handle error when adding account', () => {
    // Mock form values
    component.accountForm.setValue({
      accountName: 'Test Account',
      accountBalance: '100'
    });

    // Mock API error response
    const errorMessage = 'Failed to add account';
    mockApiService.postAccount.mockReturnValue(throwError(errorMessage));

    // Trigger onSubmit
    component.onSubmit();

    // Expectations
    expect(mockApiService.postAccount).toHaveBeenCalled();
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Error adding account', 'Close', {
      duration: 3000
    });
    // Additional error handling expectations as needed
  });

  it('should open edit account dialog', () => {
    // Mock index of account to edit
    const index = 0;
    component.accounts = [
      { name: 'Account 1', balnce: 100,userId:"123" },
      { name: 'Account 2', balnce: 200,userId:"123" }
    ];

    // Trigger openEditDialog
    component.openEditDialog(index);

    // Expectations
    expect(mockMatDialog.open).toHaveBeenCalledWith(AddAccountsComponent, jasmine.any(Object));
    expect(component.editIndex).toEqual(index);
    expect(component.editForm.value.accountName).toEqual(component.accounts[index].name);
    // Add more expectations based on your component's behavior after dialog is closed
  });

  it('should handle error when updating account', () => {
    // Mock index of account to edit and form values
    const index = 0;
    component.editIndex = index;
    component.accounts = [
      { name: 'Account 1', balnce: 100,userId:"123" },
      { name: 'Account 2', balnce: 200,userId:"123" }
    ];
    component.editForm.setValue({
      accountName: 'Updated Account Name'
    });

    // Mock API error response
    const errorMessage = 'Failed to update account';
    mockApiService.updateAccount.mockReturnValue(throwError(errorMessage));

    // Trigger onEditSubmit
    component.onEditSubmit();

    // Expectations
    expect(mockApiService.updateAccount).toHaveBeenCalled();
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Error updating account', 'Close', {
      duration: 3000
    });
    // Additional error handling expectations as needed
  });

  // Add more test cases as per your component's functionality

});
