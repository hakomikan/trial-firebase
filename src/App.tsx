import * as firebase from "firebase";
import 'firebase/auth';
import 'firebase/database';
import * as React from 'react';
import { Key } from 'ts-keycode-enum';
import './App.css';

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
      "name": "Before Travel",
      "tasks": [
        "notepc",
        "tablet",
        "smart phone"
      ],
    }

    this.OnKeyDown = this.OnKeyDown.bind(this);
    this.changeText = this.changeText.bind(this);
    this.changeTitle = this.changeTitle.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.changeExistTask = this.changeExistTask.bind(this);
    this.onNewTaskFocusOut = this.onNewTaskFocusOut.bind(this);
    this.onLogin = this.onLogin.bind(this);

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
  }

  public OnKeyDown(event: any) {
    const currentIndexString = event.currentTarget.dataset.index;
    if (typeof currentIndexString !== "string") {
      return;
    }
    const currentIndex = parseInt(currentIndexString, 10);

    if (currentIndex === this.state.tasks.length && event.keyCode === Key.Enter && this.state.current !== "") {
      this.setState((prevState: any, props) => {
        return {
          "current": "",
          "name": prevState.name,
          "tasks": prevState.tasks.concat([this.state.current]),
        }
      });
    }
    if (event.keyCode === Key.UpArrow) {
      const prevIndex = Math.max(-1, currentIndex-1);
      const nextTarget = this.refs["input:" + prevIndex] as any;
      const tmp = nextTarget.value;
      nextTarget.focus();
      nextTarget.value = '';
      nextTarget.value = tmp;
      event.preventDefault();
    }
    if (event.keyCode === Key.DownArrow) {
      const nextIndex = Math.min(this.state.tasks.length, currentIndex+1);
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
      this.setState({ "tasks": this.state.tasks })        
    }
  }

  public changeText(event: any) {
    this.setState({ "current": event.target.value });
  }

  public changeTitle(event: any) {
    this.setState({ "name": event.target.value })
  }

  public deleteTask(event: any) {
    const targetIndex = event.currentTarget.dataset.index as number;
    this.state.tasks.splice(targetIndex, 1)
    this.setState({ "tasks": this.state.tasks })
  }

  public changeExistTask(event: any) {
    const targetIndex = event.currentTarget.dataset.index as number;
    this.state.tasks[targetIndex] = event.target.value;
    this.setState({ "tasks": this.state.tasks });
  }

  public onNewTaskFocusOut(event: any) {
    if (this.state.current !== "") {
      this.setState((prevState: any, props) => {
        return {
          "current": "",
          "tasks": prevState.tasks.concat([this.state.current]),
        }
      });
    }
  }

  public onLogin(event: any) {
    this.fbauth.signInWithPopup(this.fbgoogleprovider).then( result => {
      if( result.credential !== null ) {
        console.log("logged in!");
        this.setState({
          "accessToken": (result.credential as any).accessToken,
          "loginState": "loggedin",
          "userName": result.user,          
        });  
      }
    }).catch( error => {
      console.log(error)
    });
  }

  public render() {
    return (
      <div>
        <h1>
          <input onKeyDown={this.OnKeyDown} value={this.state.name} ref={"input:" + -1} data-index={-1} onChange={this.changeTitle} />
          <i className="fas fa-sign-in-alt" onClick={this.onLogin} />
        </h1>
        <div className="test">
          {this.state.tasks.map((task: string, i: any) => (
            <li key={i}>
              <i className="far fa-square" />
              <span><input onKeyDown={this.OnKeyDown} ref={"input:" + i} value={task} data-index={i} onChange={this.changeExistTask} /></span>
              <i className="subicon far fa-trash-alt" data-index={i} onClick={this.deleteTask} />
            </li>
          ))}
          <li itemType="text" className="intermadiate">
            <i className="intermediate far fa-square" />
            <span>
              <input ref={"input:"+this.state.tasks.length} data-index={this.state.tasks.length} onKeyDown={this.OnKeyDown} onBlur={this.onNewTaskFocusOut} value={this.state.current} onChange={this.changeText} placeholder="<new task>" />
            </span>
          </li>
        </div>
      </div>
    );
  }
}

export default App;
