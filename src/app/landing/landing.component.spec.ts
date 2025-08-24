import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent, RouterTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display hero title', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.hero__title')).toBeTruthy();
  });

  it('should display features section', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.features')).toBeTruthy();
  });

  it('should display how it works section', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.how-it-works')).toBeTruthy();
  });

  it('should display CTA section', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.cta')).toBeTruthy();
  });
});
