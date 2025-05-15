import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorreoEviadoComponent } from './correo-eviado.component';

describe('CorreoEviadoComponent', () => {
  let component: CorreoEviadoComponent;
  let fixture: ComponentFixture<CorreoEviadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorreoEviadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorreoEviadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
