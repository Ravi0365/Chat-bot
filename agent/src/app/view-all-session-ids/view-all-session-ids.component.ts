import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { Sessions } from "./view-all-session-ids.sessions";
import { Observable } from "rxjs";
import { DataService } from "../data.service";
import { environment } from "../../environments/environment";

@Component({
  selector: "app-view-all-session-ids",
  templateUrl: "./view-all-session-ids.component.html",
  styleUrls: ["./view-all-session-ids.component.css"]
})
export class ViewAllSessionIdsComponent implements OnInit {
  hasSessionIds = false;
  apiAddress = environment.apiAddress;
  title = "Chat bot";
  allAvailableSessions = [];
  sessionIdMessages = [];
  message = [];
  constructor(private http: HttpClient, private data: DataService) {
    this.ShowSessionIds();
    setInterval(() => {
      this.ShowSessionIds();
    }, 3000);
  }
  getSessionIds(): Observable<HttpResponse<Sessions>> {
    return this.http.get<Sessions>(this.apiAddress + "getAgentSessions", {
      observe: "response"
    });
  }

  ShowSessionIds() {
    this.getSessionIds().subscribe((data: any) => {
      data.body.map(element => {
        this.allAvailableSessions.push(element);
      });
      this.allAvailableSessions = this.allAvailableSessions.sort(function(
        a,
        b
      ) {
        a = new Date(a.split(" ")[1] + " " + a.split(" ")[2]);
        b = new Date(b.split(" ")[1] + " " + b.split(" ")[2]);
        return a > b ? 1 : a < b ? -1 : 0;
      });
      if (this.allAvailableSessions.length > 0) {
        this.hasSessionIds = true;
      }else{
        this.hasSessionIds = false;
      }
    });
  }

  getSessionIdMessages(sessionId: string) {
    return this.http.get(this.apiAddress + "getChat?sessionId=" + sessionId);
  }
  selectedSessionId(sessionId: string) {
    this.getSessionIdMessages(sessionId).subscribe((data: any) => {
      this.sessionIdMessages.push({
        sessionId: sessionId,
        messages: data.message
      });
      this.data.changeMessage({ sessionId: sessionId, messages: data.message });
    });
  }
  ngOnInit() {}
}
