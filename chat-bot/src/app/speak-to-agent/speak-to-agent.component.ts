import { Component, OnInit } from '@angular/core';
import { DataService } from "../data.service";
import { HttpClient, HttpResponse } from "@angular/common/http";
@Component({
  selector: 'app-speak-to-agent',
  templateUrl: './speak-to-agent.component.html',
  styleUrls: ['./speak-to-agent.component.css']
})
export class SpeakToAgentComponent implements OnInit {
  sessionId = null;
  userBotChats = []
  messages = [];
  constructor(private data: DataService, private http: HttpClient) {
    setTimeout(() => {
      this.getMessages(true)
    }, 1000);
    setInterval(() => {
      this.getMessages(false)
    }, 4000);
  }

  getMessages(onLoad: boolean) {
    this.getSessionIdMessages(this.sessionId).subscribe((data: any) => {
      console.log('data :', data);
      data.message.forEach(element => {
        if (element.type === "User") {
          element.style = "speech-bubble-response";
        } else {
          element.style = "speech-bubble";
        }
      });
      this.messages = data.message;
    })
  }
  Reset(status: boolean) {
    this.messages = [];
    if (status) {
      window.location.href = "/";
    }
  }
  getSessionIdMessages(sessionId: string) {
    return this.http.get("http://41.86.98.151:8080/getChat?sessionId=" + sessionId);
  }

  ngOnInit() {
    this.data.sessionId.subscribe((id: any) => {
      this.sessionId = id;
    });
    this.data.userBotMessages.subscribe((messages: any) => {
      this.userBotChats = messages
    });
    this.data.userAgentMessages.subscribe((messages: any) => {
      this.messages = messages
    })
  }

}
