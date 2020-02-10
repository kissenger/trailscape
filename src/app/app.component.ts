import { Component, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { AlertBoxComponent } from './shared/components/alert-box/alert-box.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { LoginComponent } from './login-forms/login/login.component';
import { RegisterComponent } from './login-forms/register/register.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'cotopaxi';

  constructor(
    injector: Injector
  ) {

    //  // See angular custom elements example: https://angular.io/guide/elements

    const SpinnerElement = createCustomElement(SpinnerComponent, {injector});
    customElements.define('bootstrap-spinner', SpinnerElement);

    const AlertBoxElement = createCustomElement(AlertBoxComponent, {injector});
    customElements.define('alert-box', AlertBoxElement);

    const LoginElement = createCustomElement(LoginComponent, {injector});
    customElements.define('login-box', LoginElement);

    const RegisterElement = createCustomElement(RegisterComponent, {injector});
    customElements.define('register-box', RegisterElement);

   }


}
