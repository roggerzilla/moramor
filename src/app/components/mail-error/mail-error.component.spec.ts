import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailErrorComponent } from './mail-error.component';

describe('MailErrorComponent', () => {
  let component: MailErrorComponent;
  let fixture: ComponentFixture<MailErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
