import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import * as React from "react";
import { Key } from "ts-keycode-enum";
import "./App.css";
import AutosizeInput from "react-input-autosize";
import * as Immutable from "immutable";

let CheckListTaskRecord = Immutable.Record({
  name: "do nothing",
  done: false
});

export class CheckListTask extends CheckListTaskRecord {
  public static fromJSON(json: any) {
    return new CheckListTaskRecord({
      name: json.name,
      done: json.done
    });
  }
}

let CheckListRecord = Immutable.Record({
  name: "SomeCheckList",
  tasks: Immutable.List([new CheckListTask()])
});

export class CheckList extends CheckListRecord {
  public static fromJSON(json: any): CheckList {
    return new CheckList({
      name: json.name,
      tasks: Immutable.List(
        json.tasks.map((task: any) => CheckListTask.fromJSON(task))
      )
    });
  }
}

let CheckListStoreRecord = Immutable.Record({
  checkLists: Immutable.List([new CheckList()])
});

export class CheckListStore extends CheckListStoreRecord {
  public static fromJSON(json: any): CheckListStore {
    return new CheckListStore(
      CheckListStoreRecord({
        checkLists: Immutable.List(
          json.checkLists.map((checklist: any) => CheckList.fromJSON(checklist))
        )
      })
    );
  }
}

class App extends React.Component {
  public state: any;
  public fbapp: firebase.app.App;
  public fbauth: firebase.auth.Auth;
  public fbdb: firebase.database.Database;
  public fbgoogleprovider: firebase.auth.GoogleAuthProvider;

  constructor(props: any) {
    super(props);

    this.state = {
      current: "",
      name: "now loading",
      tasks: [],
      currentCheckList: 1,
      checklists: CheckListStore.fromJSON({
        checkLists: [
          {
            name: "BeforeShopping",
            tasks: [
              { name: "Money" },
              { name: "Bag" },
              { name: "Check the shopping list" }
            ]
          },
          {
            name: "BeforeTrip",
            tasks: [
              { name: "Schedule" },
              { name: "Tooth brush" },
              { name: "AC adapter" }
            ]
          },
          {
            name: "TripPlanning",
            tasks: [
              { name: "Write fuzzy schedule" },
              { name: "Enumerate activities" },
              { name: "Contact friends" }
            ]
          }
        ]
      })
    };

    const config = {
      apiKey: "AIzaSyDdIKPJVVwa8pXOHa-yGfdYr_s9ru2Lj-k",
      authDomain: "checklist-3e43e.firebaseapp.com",
      databaseURL: "https://checklist-3e43e.firebaseio.com",
      messagingSenderId: "553703248197",
      projectId: "checklist-3e43e",
      storageBucket: ""
    };

    this.fbapp = firebase.initializeApp(config);
    this.fbauth = this.fbapp.auth();
    this.fbdb = this.fbapp.database();
    this.fbgoogleprovider = new firebase.auth.GoogleAuthProvider();
    this.fbauth.onAuthStateChanged((user: firebase.User | null) => {
      if (user !== null) {
        this.fbdb
          .ref(`users/${user.uid}/store`)
          .once("value")
          .then(snapshot => {
            const val = snapshot.val();

            let store = this.state.checklists as CheckListStore;

            if (val !== null) {
              store = CheckListStore.fromJSON(val);
            }
            this.setState({
              loginState: "loggedin",
              name: this.state.name,
              tasks: this.state.tasks,
              checklists: store,
              user: user,
              userName: user.displayName
            });
          });
      }
    });
  }

  public get CurrentIndex(): number {
    return this.state.currentCheckList as number;
  }

  public UpdateDatabase(newStore: CheckListStore): void {
    this.setState({
      checklists: newStore
    });
    this.fbdb
      .ref(`users/${this.state.user.uid}/store`)
      .set(JSON.parse(JSON.stringify(newStore)));
  }

  public UpdateName = (newName: string) => {
    const newState = this.CheckListStore.update("checkLists", checkLists =>
      checkLists.update(this.CurrentIndex, checklist =>
        checklist.update("name", name => newName)
      )
    );
    this.UpdateDatabase(newState);
  };

  public UpdateTasks_ = (newTasks: string[]) => {
    const newState = this.CheckListStore.update("checkLists", checkLists =>
      checkLists.update(this.CurrentIndex, checklist =>
        checklist.update("tasks", tasks =>
          Immutable.List(
            newTasks.map(task => new CheckListTask({ name: task, done: false }))
          )
        )
      )
    );
    this.UpdateDatabase(newState);
  };

  public UpdateTask = (index: number, newTask: CheckListTask) => {
    const newState = this.CheckListStore.update("checkLists", checkLists =>
      checkLists.update(this.CurrentIndex, checklist =>
        checklist.update("tasks", tasks => tasks.update(index, task => newTask))
      )
    );
    this.UpdateDatabase(newState);
  };

  public AppendTask = (taskName: string) => {
    const newState = this.CheckListStore.update("checkLists", checkLists =>
      checkLists.update(this.CurrentIndex, checklist =>
        checklist.update("tasks", tasks =>
          tasks.push(new CheckListTask({ name: taskName }))
        )
      )
    );
    this.UpdateDatabase(newState);
  };

  public DeleteTask = (taskIndex: number) => {
    const newState = this.CheckListStore.update("checkLists", checkLists =>
      checkLists.update(this.CurrentIndex, checklist =>
        checklist.update("tasks", tasks => tasks.delete(taskIndex))
      )
    );
    this.UpdateDatabase(newState);
  };

  public OnKeyDown = (event: any) => {
    const currentIndexString = event.currentTarget.dataset.index;
    if (typeof currentIndexString !== "string") {
      return;
    }
    const currentIndex = parseInt(currentIndexString, 10);

    if (
      currentIndex === this.CurrentCheckList.tasks.count() &&
      event.keyCode === Key.Enter &&
      this.state.current !== ""
    ) {
      this.setState({ current: "" });
      this.AppendTask(this.state.current);
    }
    if (event.keyCode === Key.UpArrow) {
      const prevIndex = Math.max(-1, currentIndex - 1);
      const nextTarget = this.refs["input:" + prevIndex] as any;
      const tmp = nextTarget.value;
      nextTarget.focus();
      nextTarget.value = "";
      nextTarget.value = tmp;
      event.preventDefault();
    }
    if (event.keyCode === Key.DownArrow) {
      const nextIndex = Math.min(this.CurrentTasks.count(), currentIndex + 1);
      const nextTarget = this.refs["input:" + nextIndex] as any;
      const tmp = nextTarget.value;
      nextTarget.focus();
      nextTarget.value = "";
      nextTarget.value = tmp;
      event.preventDefault();
    }
    if (
      event.keyCode === Key.Backspace &&
      event.currentTarget.value === "" &&
      currentIndex !== this.CurrentTasks.count() &&
      currentIndex !== -1
    ) {
      event.preventDefault();

      const nextTarget = this.refs["input:" + (currentIndex - 1)] as any;
      const tmp = nextTarget.value;
      nextTarget.focus();
      nextTarget.value = "";
      nextTarget.value = tmp;
      this.DeleteTask(currentIndex);
    }
  };

  public changeText = (event: any) => {
    this.setState({ current: event.target.value });
  };

  public changeTitle = (event: any) => {
    this.UpdateName(event.target.value as string);
  };

  public deleteTask = (event: any) => {
    const targetIndex = event.currentTarget.dataset.index as number;
    this.DeleteTask(targetIndex);
  };

  public changeExistTask = (event: any) => {
    const targetIndex = event.currentTarget.dataset.index as number;
    const newTaskName = event.target.value;
    const targetTask = this.CurrentTasks.get(targetIndex);
    if (!targetTask) {
      return;
    }

    this.UpdateTask(
      targetIndex,
      targetTask.update("name", name => newTaskName)
    );
  };

  public onNewTaskFocusOut = (event: any) => {
    if (this.state.current !== "") {
      this.AppendTask(this.state.current);
      this.setState({ current: "" });
    }
  };

  public OnBlur = (event: any) => {
    this.UpdateName(event.target.value);
  };

  public onLogin = (event: any) => {
    this.fbauth
      .signInWithPopup(this.fbgoogleprovider)
      .then(result => {
        if (result.credential !== null) {
          console.log("logged in!");
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  public onLogout = (event: any) => {
    this.fbauth.signOut().then(() => {
      console.log("logged out!");
      this.setState({
        accessToken: null,
        loginState: null,
        userName: null
      });
    });
  };

  public getLoginStateName(): string {
    if (this.state.loginState === "loggedin") {
      return "Logged in";
    } else {
      return "Not login";
    }
  }

  public getUserName(): string {
    if (this.state.userName) {
      return this.state.userName;
    } else {
      return "<no user>";
    }
  }

  public getUserId(): string | null {
    if (this.state.user) {
      return (this.state.user as firebase.User).uid;
    } else {
      return null;
    }
  }

  public systemMenu = () => {
    return (
      <div className="systemMenu">
        <span className="iconButton" title="logout" onClick={this.onLogout}>
          <i className="fas fa-sign-out-alt" />
        </span>
      </div>
    );
  };

  public OnSelectCheckList = (event: any) => {
    const currentIndex: string = event.currentTarget.dataset.index;
    this.setState({
      currentCheckList: parseInt(currentIndex)
    });
  };

  public get CheckListStore(): CheckListStore {
    let store = this.state.checklists as CheckListStore;
    return store;
  }

  public get CurrentCheckList() {
    let checkList = this.CheckListStore.checkLists.get(
      this.state.currentCheckList
    );

    if (!checkList) {
      throw new Error("invalid checklist store");
    }

    return checkList;
  }

  public get CurrentTasks() {
    return this.CurrentCheckList.tasks;
  }

  public SideMenu = () => {
    return (
      <div className="leftPain">
        <ul>
          {this.CheckListStore.checkLists.map((checklist, i) => {
            if (this.state.currentCheckList === i) {
              return (
                <li
                  key={i}
                  data-index={i}
                  onClick={this.OnSelectCheckList}
                  className="selected"
                >
                  {checklist.name}
                </li>
              );
            } else {
              return (
                <li key={i} data-index={i} onClick={this.OnSelectCheckList}>
                  {checklist.name}
                </li>
              );
            }
          })}
          <li
            key={this.CheckListStore.checkLists.count()}
            data-index={this.CheckListStore.checkLists.count()}
          >
            <span>
              <AutosizeInput minWidth="220" placeholder="<new CheckList>" />
            </span>
          </li>
        </ul>
      </div>
    );
  };

  public render() {
    if (this.state.loginState === "loggedin") {
      let checkList = this.CurrentCheckList;

      return (
        <div className="frame">
          <this.SideMenu />
          <div className="mainPain">
            <this.systemMenu />
            <h1>
              <AutosizeInput
                minWidth="300"
                onKeyDown={this.OnKeyDown}
                onBlur={this.OnBlur}
                value={checkList.name}
                ref={"input:" + -1}
                data-index={-1}
                onChange={this.changeTitle}
              />
            </h1>
            <div className="checkList">
              {checkList.tasks.map((task, i) => (
                <li key={i}>
                  <i className="far fa-square" />
                  <span>
                    <AutosizeInput
                      minWidth="300"
                      onKeyDown={this.OnKeyDown}
                      ref={"input:" + i}
                      value={task.name}
                      data-index={i}
                      onChange={this.changeExistTask}
                    />
                  </span>
                  <i
                    className="subicon far fa-trash-alt"
                    data-index={i}
                    onClick={this.deleteTask}
                  />
                </li>
              ))}
              <li itemType="text" className="intermadiate">
                <i className="intermediate far fa-square" />
                <span>
                  <AutosizeInput
                    ref={"input:" + checkList.tasks.count()}
                    data-index={checkList.tasks.count()}
                    onKeyDown={this.OnKeyDown}
                    onBlur={this.onNewTaskFocusOut}
                    value={this.state.current}
                    onChange={this.changeText}
                    placeholder="<new task>"
                  />
                </span>
              </li>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <span className="iconButton" title="login" onClick={this.onLogin}>
          <i className="fas fa-sign-in-alt" />
          <span>login</span>
        </span>
      );
    }
  }
}

export default App;
