import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransectionComponent } from './transection.component';

describe('TransectionComponent', () => {
  let component: TransectionComponent;
  let fixture: ComponentFixture<TransectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
