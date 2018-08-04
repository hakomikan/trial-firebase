import * as React from 'react';
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

    this.OnKeyDown = this.OnKeyDown.bind(this)
    this.changeText = this.changeText.bind(this)
    this.changeTitle = this.changeTitle.bind(this)
    this.deleteTask = this.deleteTask.bind(this)
  }

  public OnKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const ENTER = 13;
    if (event.keyCode === ENTER && this.state.current !== "") {
      this.setState((prevState: any, props) => {
        return {
          "current": "",
          "name": prevState.name,
          "tasks": prevState.tasks.concat([this.state.current]),
        }
      });
    }
  }

  public changeText(event: any) {
    this.setState({"current": event.target.value});
  }

  public changeTitle(event: any) {
    this.setState({"name": event.target.value})
  }

  public deleteTask(event: any) {
    const targetIndex = event.currentTarget.dataset.index as number;
    this.state.tasks.splice(targetIndex, 1)
    this.setState({"tasks": this.state.tasks })
  }

  public render() {
    return (
      <div>
        <h1><input value={this.state.name} onChange={this.changeTitle} /> </h1>
        <div className="test">
        {this.state.tasks.map((task:string, i: any) => (
          <li key={i}>
            <i className="far fa-square"/>
            <span><input value={task}/></span>
            <i className="subicon far fa-edit"/>
            <i className="subicon far fa-trash-alt" data-index={i} onClick={this.deleteTask}/>
          </li>
        ))}
        <li itemType="text" className="intermadiate">
          <i className="intermediate far fa-square"/>
          <span>
            <input onKeyDown={this.OnKeyDown} value={this.state.current} onChange={this.changeText} placeholder="<new task>"/>
          </span>
        </li>
        </div>
      </div>
    );
  }
}

export default App;
