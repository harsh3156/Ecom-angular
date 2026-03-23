import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-product-add-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './product-add-edit.html',
  styleUrl: './product-add-edit.scss',
})
export class ProductAddEditComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    price: ['', [Validators.required, Validators.min(0)]],
    category: ['', Validators.required],
    stock: ['', [Validators.required, Validators.min(0)]],
  });

  productId: string | null = null;
  isEdit = false;
  loading = false;
  pageLoading = false;
  imageProcessing = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  currentImage = '';

  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_WIDTH = 1200;
  private readonly JPEG_QUALITY = 0.85;

  categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Food', 'Automotive', 'Other'];

  get f() { return this.form.controls; }

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.productId;
    if (this.isEdit && this.productId) {
      this.loadProduct(this.productId);
    }
  }

  ngOnDestroy() {
    if (this.imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.imagePreview);
    }
  }

  loadProduct(id: string) {
    this.pageLoading = true;
    this.cdr.markForCheck();
    this.productService.getProduct(id).subscribe({
      next: (res) => {
        const p = res.product;
        this.form.patchValue({
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category,
          stock: p.stock,
        });
        this.currentImage = p.image;
        this.pageLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.pageLoading = false;
        this.toast.error('Product not found');
        this.cdr.markForCheck();
        this.router.navigate(['/products']);
      },
    });
  }

  async onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toast.error('Please select a valid image (PNG, JPG, WEBP)');
      input.value = '';
      return;
    }
    if (file.size > this.MAX_FILE_SIZE) {
      this.toast.error('Image must be under 5MB. Please choose a smaller image.');
      input.value = '';
      return;
    }

    this.imageProcessing = true;
    input.value = '';
    this.cdr.markForCheck();

    try {
      const compressed = await this.compressImage(file);
      this.selectedFile = compressed;
      this.imagePreview = URL.createObjectURL(compressed);
    } catch {
      this.selectedFile = file;
      this.imagePreview = URL.createObjectURL(file);
    } finally {
      this.imageProcessing = false;
      this.cdr.markForCheck();
    }
  }

  private compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > this.MAX_WIDTH || height > this.MAX_WIDTH) {
          if (width > height) {
            height = Math.round((height * this.MAX_WIDTH) / width);
            width = this.MAX_WIDTH;
          } else {
            width = Math.round((width * this.MAX_WIDTH) / height);
            height = this.MAX_WIDTH;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('Compression failed')); return; }
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          },
          'image/jpeg',
          this.JPEG_QUALITY
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      img.src = url;
    });
  }

  removeImage() {
    if (this.imagePreview && this.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(this.imagePreview);
    }
    this.selectedFile = null;
    this.imagePreview = null;
    this.currentImage = '';
  }

  getImageUrl(image: string): string {
    if (!image) return '';
    if (image.startsWith('http')) return image;
    return `http://localhost:5000${image}`;
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.cdr.markForCheck();

    const formData = new FormData();
    Object.entries(this.form.value).forEach(([key, val]) => formData.append(key, val as string));
    if (this.selectedFile) formData.append('image', this.selectedFile);

    const action = this.isEdit && this.productId
      ? this.productService.updateProduct(this.productId, formData)
      : this.productService.createProduct(formData);

    action.subscribe({
      next: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.toast.success(this.isEdit ? 'Product updated successfully!' : 'Product created successfully!');
        setTimeout(() => this.router.navigate(['/products']), 800);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Operation failed. Please try again.');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }
}
