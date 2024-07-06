import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDynamicSelectComponent } from './mat-dynamic-select.component';

describe('MatDynamicSelectComponent', () => {
  let component: MatDynamicSelectComponent;
  let fixture: ComponentFixture<MatDynamicSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDynamicSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatDynamicSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
