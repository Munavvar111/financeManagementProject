import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericDailogComponent } from './generic-dailog.component';

describe('GenericDailogComponent', () => {
  let component: GenericDailogComponent;
  let fixture: ComponentFixture<GenericDailogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericDailogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenericDailogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
