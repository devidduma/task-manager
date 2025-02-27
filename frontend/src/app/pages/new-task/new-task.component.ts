import { Component, OnInit } from '@angular/core';
import {TaskService} from "../../services/task.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {Task} from "../../models/task.model";

@Component({
    selector: 'app-new-task',
    templateUrl: './new-task.component.html',
    styleUrls: ['./new-task.component.scss'],
    standalone: false
})
export class NewTaskComponent implements OnInit {

  constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router) { }

  listId: string = "";

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      if(params?.['listId'] !== undefined) {
        this.listId = params['listId'];
      }
    });
  }

  createTask(title: string): void {
    this.taskService.createTask(title, this.listId).subscribe((newTask: Task) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
