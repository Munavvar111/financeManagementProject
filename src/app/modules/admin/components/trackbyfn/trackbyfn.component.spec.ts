import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackbyfnComponent } from './trackbyfn.component';

describe('TrackbyfnComponent', () => {
  let component: TrackbyfnComponent;
  let fixture: ComponentFixture<TrackbyfnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackbyfnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrackbyfnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
