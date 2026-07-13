import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);

  @Input() set appHasRole(roles: string[]) {
    const user = this.authService.getCurrentUser();

    if (user && roles.includes(user.role)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
