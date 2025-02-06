import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {HttpResponse} from "@angular/common/http";

@Component({
  selector: 'app-login-page',
  standalone: false,
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent implements OnInit {

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
  }

  onLoginButtonClicked(email: string, password: string): void {
    this.authService.login(email, password).subscribe((res: HttpResponse<any>) => {
      console.log(res);
    });
  }
}
