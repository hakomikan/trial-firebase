import * as React from 'react';
import { Key } from 'ts-keycode-enum';
import './App.css';

class App extends React.Component {

  public state: any;

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
      nextTarget.value = '';
      nextTarget.value = tmp;
      nextTarget.focus();
    }
    if (event.keyCode === Key.DownArrow) {
      const nextIndex = Math.min(this.state.tasks.length, currentIndex+1);
      const nextTarget = this.refs["input:" + nextIndex] as any;
      const tmp = nextTarget.value;
      nextTarget.value = '';
      nextTarget.value = tmp;
      nextTarget.focus();
    }
    if (event.keyCode === Key.Backspace && event.currentTarget.value === "" && currentIndex !== this.state.tasks.length && currentIndex !== -1) {
      event.preventDefault();

      const nextTarget = this.refs["input:" + (currentIndex - 1)] as any;
      const tmp = nextTarget.value;
      nextTarget.value = '';
      nextTarget.value = tmp;
      nextTarget.focus();
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

  public render() {
    return (
      <div>
        <h1><input onKeyDown={this.OnKeyDown} value={this.state.name} ref={"input:" + -1} data-index={-1} onChange={this.changeTitle} /> </h1>
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
