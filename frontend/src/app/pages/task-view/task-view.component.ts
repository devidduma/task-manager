import { Component, OnInit } from '@angular/core';
import {TaskService} from "../../services/task.service";
import {ActivatedRoute, Params} from "@angular/router";
import {Task} from "../../models/task.model";
import {List} from "../../models/list.model";

@Component({
    selector: 'app-task-view',
    templateUrl: './task-view.component.html',
    styleUrls: ['./task-view.component.scss'],
    standalone: false
})
export class TaskViewComponent implements OnInit {

  constructor(private taskService: TaskService, private route: ActivatedRoute) {}

  lists: List[] = [];
  tasks: Task[] = [];

  listId: string = "";

  ngOnInit(): void {
    this.taskService.getLists().subscribe((lists: List[]) => {
      this.lists = lists;
    });

    this.route.params.subscribe((params: Params) => {
      if(params?.['listId'] !== undefined) {
        this.listId = params?.['listId'];

        this.taskService.getTasks(params?.['listId']).subscribe((tasks: Task[]) => {
          this.tasks = tasks;
        });
      }
    });
  }

  onTaskClick(task: Task): void {
    // Set the task to completed
    this.taskService.complete(task).subscribe(() => {
      // The task has been set to completed successfully
      task.completed = !task.completed;
    });
  }
}
