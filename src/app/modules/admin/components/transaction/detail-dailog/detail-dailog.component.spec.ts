import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailDailogComponent } from './detail-dailog.component';

describe('DetailDailogComponent', () => {
  let component: DetailDailogComponent;
  let fixture: ComponentFixture<DetailDailogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailDailogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailDailogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
