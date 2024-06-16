import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAccountsComponent } from './add-accounts.component';

describe('AddAccountsComponent', () => {
  let component: AddAccountsComponent;
  let fixture: ComponentFixture<AddAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAccountsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
