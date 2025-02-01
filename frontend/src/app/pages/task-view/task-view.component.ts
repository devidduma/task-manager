import { Component, OnInit } from '@angular/core';
import {TaskService} from "../../services/task.service";
import {ActivatedRoute, Params} from "@angular/router";

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {

  constructor(private taskService: TaskService, private route: ActivatedRoute) {}

  lists: any[] = [];
  tasks: any[] = [];

  ngOnInit(): void {
    this.taskService.getLists().subscribe((lists: any[]) => {
      this.lists = lists;
    });

    this.route.params.subscribe((params: Params) => {
      if(params?.['listId'] !== undefined) {
        this.taskService.getTasks(params?.['listId']).subscribe((tasks: any[]) => {
          this.tasks = tasks;
        });
      }
    });
  }
}
