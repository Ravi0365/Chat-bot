import { Component, OnInit } from "@angular/core";
import { DataService } from "../data.service";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { DomSanitizer } from "@angular/platform-browser";
import { environment } from "../../environments/environment";
import { templateSourceUrl } from '@angular/compiler';

@Component({
  selector: "app-speak-to-agent",
  templateUrl: "./speak-to-agent.component.html",
  styleUrls: ["./speak-to-agent.component.css"]
})
export class SpeakToAgentComponent implements OnInit {
  apiAddress = environment.apiAddress;
  sessionId = null;
  messages = [{ style: "speech-bubble sb11", orderId: 1, message: "Loading Messages..." }];
  userBotMessages = [];
  title = "speaking to agent";
  text = "";
  newMessage: string;
  number = 1;
  constructor(
    private data: DataService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {
    const localSessionId = sessionStorage.getItem("sessionId");
    if (localSessionId) {
      this.sessionId = localSessionId;
    }
    this.getMessages();
    setInterval(() => {
      this.getMessages();
    }, 3000);
  }

  sendMessage(event) {
    if (event) {
      if (event.keyCode === 13 || event.code === "Enter") {
        setTimeout(() => {
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            left: document.documentElement.scrollHeight,
            behavior: "smooth"
          });
        }, 6);
        const value = event.target.value || event.path[0].value;
        this.text = value;
        const message = {
          message: value,
          img: true,
          style: "speech-bubble-response sb12",
          orderId: this.messages.length + 1
        };
        this.messages.push(message);
        this.sendMessageToApi({
          data: value,
          type: "User",
          orderId: this.messages.indexOf(message) + 1
        }).subscribe();
        event.path[0].value = "";
      } else {
        // this.newMessage = ""
        event.path[0].value + event.key.length > 0 ? event.key : "";
      }
    } else {
      if (this.newMessage.length > 0) {
        const message = {
          message: this.newMessage,
          img: true,
          style: "speech-bubble-response sb12",
          orderId: this.messages.length + 1
        };
        this.messages.push(message);
        this.sendMessageToApi({
          data: this.newMessage,
          type: "User",
          orderId: this.messages.indexOf(message) + 1
        }).subscribe();
      }
    }
    if (this.messages) {
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          left: document.documentElement.scrollHeight,
          behavior: "smooth"
        });
      }, 600);
    }
    this.getMessages();
  }
  sendMessageToApi(message: any) {
    return this.http.get(
      this.apiAddress +
      "addMessage?type=" +
      message.type +
      "&message=" +
      message.data +
      "&sessionId=" +
      this.sessionId +
      "&orderId=" +
      `${message.orderId}`
    );
  }
  getMessages() {
    this.getSessionIdMessages(this.sessionId).subscribe((data: any) => {
      data.message.sort((a, b) => {
        if (a.orderId < b.orderId) return -1;
        if (a.orderId > b.orderId) return 1;
        return 0;
      });
      data.message.forEach(element => {
        if (element.type === "User") {
          element.img = true;
          element.style = "speech-bubble-response sb12";
        } else if (element.type === "bot") {
          element.style = "speech-bubble sb11";
          this.number = 1;
        } else if (element.type === "agent") {
          element.style = "speech-bubble sb11";
          this.number = 1;
        } else {
          element.style = "option-bubble";
          element.number = this.number;
          this.number = this.number + 1;
        }
        element.orderId = +element.orderId;
      });
      if (this.messages.length !== data.message.length) {
        setTimeout(() => {
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            left: document.documentElement.scrollHeight,
            behavior: "smooth"
          });
        }, 600);
        data.message.sort((a, b) => {
          if (a.orderId < b.orderId) return -1;
          if (a.orderId > b.orderId) return 1;
          return 0;
        });
        this.messages = data.message;
      }
    });
  }
  Reset(status: boolean) {
    this.messages = [];
    if (status) {
      sessionStorage.removeItem("sessionId");
      window.location.href = "/";
    }
  }
  getSessionIdMessages(sessionId: string) {
    return this.http.get(this.apiAddress + "getChat?sessionId=" + sessionId);
  }

  ngOnInit() {
    if (sessionStorage.getItem("sessionId")) {
      this.data.setSessionId(sessionStorage.getItem("sessionId"));
    }
    this.data.sessionId.subscribe((id: any) => {
      this.sessionId = id;
    });
    this.data.userBotMessages.subscribe((data: any) => {
      this.userBotMessages = data.message;
    });
  }
}
