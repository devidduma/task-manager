import { Component, OnInit } from '@angular/core';
import {TaskService} from "../../services/task.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {Task} from "../../models/task.model";
import {List} from "../../models/list.model";

@Component({
    selector: 'app-task-view',
    templateUrl: './task-view.component.html',
    styleUrls: ['./task-view.component.scss'],
    standalone: false
})
export class TaskViewComponent implements OnInit {

  constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router) {}

  lists: List[] = [];
  tasks: Task[] = [];

  listId: string = "";
  selectedListId: string = "";

  ngOnInit(): void {
    this.taskService.getLists().subscribe((lists: List[]) => {
      this.lists = lists;
    });

    this.route.params.subscribe((params: Params) => {
      if(params?.['listId'] !== undefined) {
        this.listId = params?.['listId'];

        this.selectedListId = params['listId'];

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

  onDeleteListClicked() {
    this.taskService.deleteList(this.selectedListId).subscribe((res: any) => {
      this.router.navigate(['/lists']);
      console.log(res);
    });
  }

  onDeleteTaskClicked(id: string) {
    this.taskService.deleteTask(this.selectedListId, id).subscribe((res: any) => {
      this.tasks = this.tasks.filter(val => val._id !== id);
      console.log(res);
    });
  }

}
