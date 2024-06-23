import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDetailDailogComponent } from './add-detail-dailog.component';

describe('AddDetailDailogComponent', () => {
  let component: AddDetailDailogComponent;
  let fixture: ComponentFixture<AddDetailDailogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDetailDailogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddDetailDailogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
