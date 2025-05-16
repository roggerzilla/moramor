import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExitosoComponent } from './exitoso.component';

describe('ExitosoComponent', () => {
  let component: ExitosoComponent;
  let fixture: ComponentFixture<ExitosoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExitosoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExitosoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
