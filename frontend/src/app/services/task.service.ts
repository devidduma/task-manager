import { Injectable } from '@angular/core';
import {WebRequestService} from "./web-request.service";
import {Observable} from "rxjs";
import {Task} from "../models/task.model";

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReqService: WebRequestService) {

  }

  getLists(): Observable<any> {
    return this.webReqService.get('lists');
  }

  createList(title: string): Observable<any> {
    return this.webReqService.post('lists', { title });
  }

  deleteList(listId: string): Observable<any> {
    return this.webReqService.delete(`lists/${listId}`);
  }

  getTasks(listId: string): Observable<any> {
    return this.webReqService.get(`lists/${listId}/tasks`);
  }

  createTask(title: string, listId: string): Observable<any> {
    return this.webReqService.post(`lists/${listId}/tasks`, { title });
  }

  complete(task: Task): Observable<any> {
    return this.webReqService.patch(`lists/${task.listId}/tasks/${task._id}`, {
      completed: !task.completed,
    });
  }

}
