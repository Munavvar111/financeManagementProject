import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackbyfnwithoutComponent } from './trackbyfnwithout.component';

describe('TrackbyfnwithoutComponent', () => {
  let component: TrackbyfnwithoutComponent;
  let fixture: ComponentFixture<TrackbyfnwithoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackbyfnwithoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrackbyfnwithoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
