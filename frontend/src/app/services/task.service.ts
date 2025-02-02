import { Injectable } from '@angular/core';
import {WebRequestService} from "./web-request.service";
import {Observable} from "rxjs";

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

  getTasks(listId: string): Observable<any> {
    return this.webReqService.get(`lists/${listId}/tasks`);
  }

  createTask(title: string, listId: string): Observable<any> {
    return this.webReqService.post(`lists/${listId}/tasks`, { title });
  }
}
