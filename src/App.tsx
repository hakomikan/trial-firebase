import * as firebase from "firebase/app";
import 'firebase/auth';
import 'firebase/database';
import * as React from 'react';
import { Key } from 'ts-keycode-enum';
import './App.css';
import AutosizeInput from 'react-input-autosize';

class App extends React.Component {

  public state: any;
  public fbapp: firebase.app.App;
  public fbauth: firebase.auth.Auth;
  public fbdb: firebase.database.Database;
  public fbgoogleprovider: firebase.auth.GoogleAuthProvider;

  constructor(props: any) {
    super(props)

    this.state = {
      "current": "",
      "name": "now loading",
      "tasks": [
      ],
    }

    const config = {
      apiKey: "AIzaSyDdIKPJVVwa8pXOHa-yGfdYr_s9ru2Lj-k",
      authDomain: "checklist-3e43e.firebaseapp.com",
      databaseURL: "https://checklist-3e43e.firebaseio.com",
      messagingSenderId: "553703248197",
      projectId: "checklist-3e43e",
      storageBucket: "",
    };

    this.fbapp = firebase.initializeApp(config);
    this.fbauth = this.fbapp.auth();
    this.fbdb = this.fbapp.database();
    this.fbgoogleprovider = new firebase.auth.GoogleAuthProvider();
    this.fbauth.onAuthStateChanged((user: firebase.User | null) => {
      if (user !== null) {
        this.fbdb.ref(`users/${user.uid}`).once("value").then(snapshot => {
          const val = snapshot.val();
          let tasks = [];
          let name = "no name";
          if (val !== null) {
            tasks = val.tasks;
            name = val.name;
          }
          this.setState({
            "loginState": "loggedin",
            "name": name,
            "tasks": tasks,
            "user": user,
            "userName": user.displayName,
          });

        });
      }
    });
  }

  public UpdateName = (newName : string) => {
    this.fbdb.ref(`users/${this.state.user.uid}/name`).set(newName);
    this.setState({
      name: newName
    });
  }

  public UpdateTasks = (newTasks : string[]) => {
    this.fbdb.ref(`users/${this.state.user.uid}/tasks`).set(newTasks);
    this.setState({
      tasks: newTasks
    });
  }

  public OnKeyDown = (event: any) => {
    const currentIndexString = event.currentTarget.dataset.index;
    if (typeof currentIndexString !== "string") {
      return;
    }
    const currentIndex = parseInt(currentIndexString, 10);

    if (currentIndex === this.state.tasks.length && event.keyCode === Key.Enter && this.state.current !== "") {
      this.setState({current: ""});
      this.UpdateTasks(this.state.tasks.concat([this.state.current]));
    }
    if (event.keyCode === Key.UpArrow) {
      const prevIndex = Math.max(-1, currentIndex - 1);
      const nextTarget = this.refs["input:" + prevIndex] as any;
      const tmp = nextTarget.value;
      nextTarget.focus();
      nextTarget.value = '';
      nextTarget.value = tmp;
      event.preventDefault();
    }
    if (event.keyCode === Key.DownArrow) {
      const nextIndex = Math.min(this.state.tasks.length, currentIndex + 1);
      const nextTarget = this.refs["input:" + nextIndex] as any;
      const tmp = nextTarget.value;
      nextTarget.focus();
      nextTarget.value = '';
      nextTarget.value = tmp;
      event.preventDefault();
    }
    if (event.keyCode === Key.Backspace && event.currentTarget.value === "" && currentIndex !== this.state.tasks.length && currentIndex !== -1) {
      event.preventDefault();

      const nextTarget = this.refs["input:" + (currentIndex - 1)] as any;
      const tmp = nextTarget.value;
      nextTarget.focus();
      nextTarget.value = '';
      nextTarget.value = tmp;
      this.state.tasks.splice(currentIndex, 1)
      this.UpdateTasks(this.state.tasks);
    }
  }

  public changeText = (event: any) => {
    this.setState({ "current": event.target.value });
  }

  public changeTitle = (event: any) => {
    this.setState({ "name": event.target.value })
  }

  public deleteTask = (event: any) => {
    const targetIndex = event.currentTarget.dataset.index as number;
    this.state.tasks.splice(targetIndex, 1)
    this.UpdateTasks(this.state.tasks);
  }

  public changeExistTask = (event: any) => {
    const targetIndex = event.currentTarget.dataset.index as number;
    let newTasks = this.state.tasks;
    newTasks[targetIndex] = event.target.value;
    this.UpdateTasks(newTasks);
  }

  public onNewTaskFocusOut = (event: any) => {
    if (this.state.current !== "") {
      this.UpdateTasks(this.state.tasks.concat([this.state.current]));
      this.setState({current:""});
    }
  }

  public OnBlur = (event: any) => {
    this.UpdateName(event.target.value);
  }

  public onLogin = (event: any) => {
    this.fbauth.signInWithPopup(this.fbgoogleprovider).then(result => {
      if (result.credential !== null) {
        console.log("logged in!");
      }
    }).catch(error => {
      console.log(error)
    });
  }

  public onLogout = (event: any) => {
    this.fbauth.signOut().then(() => {
      console.log("logged out!");
      this.setState({
        "accessToken": null,
        "loginState": null,
        "userName": null
      });
    })
  }

  public getLoginStateName(): string {
    if (this.state.loginState === "loggedin") {
      return "Logged in";
    }
    else {
      return "Not login";
    }
  }

  public getUserName(): string {
    if (this.state.userName) {
      return this.state.userName;
    }
    else {
      return "<no user>";
    }
  }

  public getUserId(): string | null {
    if (this.state.user) {
      return (this.state.user as firebase.User).uid;
    }
    else {
      return null;
    }
  }

  public systemMenu = () => {
    return (
      <div className="systemMenu">
        <span className="iconButton" title="logout" onClick={this.onLogout}><i className="fas fa-sign-out-alt" /></span>
      </div>
    );
  }

  public SideMenu = () => {
    return (
      <div className="leftPain">
        <ul>
        <li>1st-CheckList</li>
        <li>2nd-CheckList</li>
        <li>3rd-CheckList</li>
        </ul>
      </div>
    );
  }

  public render() {
    if (this.state.loginState === "loggedin") {
      return (
        <div className="frame">
          <this.SideMenu />
          <div className="mainPain">
            <this.systemMenu />
            <h1>
              <AutosizeInput minWidth="300" onKeyDown={this.OnKeyDown} onBlur={this.OnBlur} value={this.state.name} ref={"input:" + -1} data-index={-1} onChange={this.changeTitle} />
            </h1>
            <div className="checkList">
              {this.state.tasks.map((task: string, i: any) => (
                <li key={i}>
                  <i className="far fa-square" />
                  <span><AutosizeInput minWidth="300" onKeyDown={this.OnKeyDown} ref={"input:" + i} value={task} data-index={i} onChange={this.changeExistTask} /></span>
                  <i className="subicon far fa-trash-alt" data-index={i} onClick={this.deleteTask} />
                </li>
              ))}
              <li itemType="text" className="intermadiate">
                <i className="intermediate far fa-square" />
                <span>
                  <AutosizeInput ref={"input:" + this.state.tasks.length} data-index={this.state.tasks.length} onKeyDown={this.OnKeyDown} onBlur={this.onNewTaskFocusOut} value={this.state.current} onChange={this.changeText} placeholder="<new task>" />
                </span>
              </li>
            </div>
          </div>
        </div>
      );
    }
    else {
      return (
        <span className="iconButton" title="login" onClick={this.onLogin}><i className="fas fa-sign-in-alt" /><span>login</span></span>
      );
    }
  }
}

export default App;
