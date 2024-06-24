import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowTransactionComponent } from './show-transaction.component';

describe('ShowTransactionComponent', () => {
  let component: ShowTransactionComponent;
  let fixture: ComponentFixture<ShowTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowTransactionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
