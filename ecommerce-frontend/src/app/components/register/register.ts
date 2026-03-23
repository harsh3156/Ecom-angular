import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: this.passwordMatchValidator });

  loading = false;
  error = '';
  showPassword = false;
  showConfirmPassword = false;

  get f() { return this.form.controls; }

  passwordMatchValidator(control: AbstractControl) {
    const pass = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;

    const { confirmPassword, ...data } = this.form.value;
    this.authService.register(data).subscribe({
      next: () => {
        this.toast.success('Account created successfully!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Registration failed. Please try again.');
        this.loading = false;
      },
    });
  }
}
