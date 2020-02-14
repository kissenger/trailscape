import { Component, OnInit} from '@angular/core';
import { LoginService } from '../shared/services/login.service';
import { RegisterService } from '../shared/services/register.service';
import { AuthService } from '../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(
    public auth: AuthService,  // do not delete - used in html
    public login: LoginService,
    public register: RegisterService,
    public router: Router
  ) { }

  ngOnInit() {
  }

  onLogoutClick() {
    this.auth.deleteToken();
    this.router.navigate(['']);
  }

  onLoginClick() {
    this.register.removeElement();
    this.login.showAsElement().subscribe( () => {
    });
  }

  onRegisterClick() {
    this.login.removeElement();
    this.register.showAsElement().subscribe( () => {
    });
  }

}
