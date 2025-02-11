import {Component, OnInit} from '@angular/core';
import {HttpResponse} from "@angular/common/http";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-signup-page',
  standalone: false,
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.scss'
})
export class SignupPageComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit() {}

  onSignupButtonClicked(email: string, password: string): void {
    this.authService.signup(email, password).subscribe((res: HttpResponse<any>) => {
      if(res.status === 200) {
        // we have logged in successfully
        this.router.navigate(['/lists']);
      }
      console.log(res);
    });
  }
}
