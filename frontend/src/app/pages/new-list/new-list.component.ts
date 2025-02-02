import { Component, OnInit } from '@angular/core';
import {TaskService} from "../../services/task.service";
import {Router} from "@angular/router";
import {List} from "../../models/list.model";

@Component({
  selector: 'app-new-list',
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.scss']
})
export class NewListComponent implements OnInit {

  constructor(private taskService: TaskService, private router: Router) { }

  ngOnInit(): void {
  }

  createList(title: string): void {
    this.taskService.createList(title).subscribe((response: List) => {
      // now we navigate to /lists/response._id
      this.router.navigate(['/lists', response._id]);
    });
  }
}
