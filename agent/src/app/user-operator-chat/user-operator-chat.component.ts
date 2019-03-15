import { Component, OnInit } from "@angular/core";
import { DataService } from "../data.service";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { environment } from "../../environments/environment";

@Component({
  selector: "app-user-operator-chat",
  templateUrl: "./user-operator-chat.component.html",
  styleUrls: ["./user-operator-chat.component.css"]
})
export class UserOperatorChatComponent implements OnInit {
  showGreeting = true;
  apiAddress = environment.apiAddress;
  messagesAndResponses = [];
  userSessionId = "";
  number = 1;
  constructor(private http: HttpClient, private data: DataService) {
    this.getData();
    setInterval(() => {
      if (this.userSessionId) {
        this.getNewMessages(this.userSessionId);
      } else {
        this.getData();
      }
    }, 3000);
  }
  sendMessage1(value: string) {
    console.log("value :", value);
  }
  sendMessage(event) {
    if (event.keyCode) {
      if (event.keyCode === 13) {
        const value = event.path[0].value;
        const message = {
          message: value,
          style: "agent-speech-bubble",
          orderId: this.messagesAndResponses.length + 1
        };
        this.messagesAndResponses.push(message);
        this.sendMessageToApi({
          data: value,
          type: "agent",
          orderId: this.messagesAndResponses.indexOf(message) + 1
        }).subscribe();
        event.path[0].value = "";
        setTimeout(() => {
          var elem = document.getElementById("chat");
          elem.scrollTop = elem.scrollHeight;
        }, 500);
      }
    } else {
      if (event.value.length > 0) {
        const message = {
          message: event.value,
          style: "agent-speech-bubble",
          orderId: this.messagesAndResponses.length + 1
        };
        this.messagesAndResponses.push(message);
        this.sendMessageToApi({
          data: event.value,
          type: "agent",
          orderId: this.messagesAndResponses.indexOf(message) + 1
        }).subscribe();
        setTimeout(() => {
          var elem = document.getElementById("chat");
          elem.scrollTop = elem.scrollHeight;
        }, 500);
        event.value = "";
      }
    }
    this.getNewMessages(this.userSessionId);
  }
  getData() {
    this.data.currentMessage.subscribe((message: any) => {
      this.userSessionId = message.sessionId;
      if (message.messages) {
        message.messages.sort((a, b) => {
          if (a.orderId < b.orderId) return -1;
          if (a.orderId > b.orderId) return 1;
          return 0;
        });
        message.messages.forEach(element => {
          if (element.type === "bot") {
            element.style = "speech-bubble-response";
            this.number = 1;
          } else if (element.type === "User") {
            element.style = "speech-bubble";
          } else if (element.type === "option") {
            element.style = "bot-option";
            element.number = this.number;
            this.number = this.number + 1;
          } else {
            element.style = "agent-speech-bubble";
          }
          element.orderId = +element.orderId;
        });
        this.showGreeting = false;
        setTimeout(() => {
          var elem = document.getElementById("chat");
          elem.scrollTop = elem.scrollHeight;
        }, 500);
        this.messagesAndResponses = message.messages;
      } else {
        this.showGreeting = true;
      }
    });
  }
  sendMessageToApi(message: any) {
    return this.http.get(
      this.apiAddress +
        "addMessage?type=" +
        message.type +
        "&message=" +
        message.data +
        "&sessionId=" +
        this.userSessionId +
        "&orderId=" +
        `${message.orderId}`
    );
  }
  closeSession() {
    return this.http.get(
      this.apiAddress + "removeSession?sessionId=" + this.userSessionId
    );
  }
  getSessionIdMessages(sessionId: string) {
    return this.http.get(this.apiAddress + "getChat?sessionId=" + sessionId);
  }
  getNewMessages(sessionId: string) {
    this.getSessionIdMessages(sessionId).subscribe((data: any) => {
      data.message.sort((a, b) => {
        if (a.orderId < b.orderId) return -1;
        if (a.orderId > b.orderId) return 1;
        return 0;
      });
      data.message.forEach(element => {
        if (element.type === "bot") {
          element.style = "speech-bubble-response";
          this.number = 1;
        } else if (element.type === "User") {
          element.style = "speech-bubble";
        } else if (element.type === "option") {
          element.style = "bot-option";
          element.number = this.number;
          this.number = this.number + 1;
        } else {
          element.style = "agent-speech-bubble";
        }
        element.orderId = +element.orderId;
      });
      data.message.sort((a, b) => {
        if (a.orderId < b.orderId) return -1;
        if (a.orderId > b.orderId) return 1;
        return 0;
      });
      if (data.message.length > this.messagesAndResponses.length) {
        this.messagesAndResponses = data.message;
        this.data.changeMessage({
          sessionId: this.userSessionId,
          messages: data.message
        });
        this.showGreeting = false;
        setTimeout(() => {
          var elem = document.getElementById("chat");
          elem.scrollTop = elem.scrollHeight;
        }, 500);
      }
    });
  }
  endChat() {
    this.closeSession().subscribe();
    this.showGreeting = true;
  }
  ngOnInit() {}
}
