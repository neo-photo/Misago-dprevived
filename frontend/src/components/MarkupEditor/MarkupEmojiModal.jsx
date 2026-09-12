import React from "react"
import modal from "../../services/modal"
import FormGroup from "../form-group"
import isUrl from "./isUrl"
import { replaceSelection } from "./operations"

class MarkupEmojiModal extends React.Component {
  constructor(props) {
    super(props)

    const text = props.selection.text.trim()
    const textUrl = isUrl(text)

    this.state = {
      error: null,
      text: textUrl ? "" : text,
      url: textUrl ? text : "",
    }
  }

  handleSubmit = (ev) => {
    ev.preventDefault()
    const { selection, update } = this.props
    replaceSelection(selection, update, ev.target.textContent )
    modal.hide()

    return false
  }

  render() {
    return (
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <button
              aria-label={pgettext("modal", "Close")}
              className="close"
              data-dismiss="modal"
              type="button"
            >
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 className="modal-title">{pgettext("markup editor", "Emoji")}</h4>
          </div>
            <div className="modal-body"><div className="emoji-dialog">
            <div onClick={this.handleSubmit} >👍</div><div onClick={this.handleSubmit} >👎</div>
<div onClick={this.handleSubmit} >😀</div><div onClick={this.handleSubmit} >😁</div><div onClick={this.handleSubmit} >😂</div><div onClick={this.handleSubmit} >😃</div><div onClick={this.handleSubmit} >😄</div><div onClick={this.handleSubmit} >😅</div><div onClick={this.handleSubmit} >😆</div><div onClick={this.handleSubmit} >😇</div><div onClick={this.handleSubmit} >😈</div><div onClick={this.handleSubmit} >😉</div><div onClick={this.handleSubmit} >😊</div><div onClick={this.handleSubmit} >😋</div><div onClick={this.handleSubmit} >😌</div><div onClick={this.handleSubmit} >😍</div><div onClick={this.handleSubmit} >😎</div><div onClick={this.handleSubmit} >😏</div><div onClick={this.handleSubmit} >😐</div><div onClick={this.handleSubmit} >😑</div><div onClick={this.handleSubmit} >😒</div><div onClick={this.handleSubmit} >😓</div><div onClick={this.handleSubmit} >😔</div><div onClick={this.handleSubmit} >😕</div><div onClick={this.handleSubmit} >😖</div><div onClick={this.handleSubmit} >😗</div><div onClick={this.handleSubmit} >😘</div><div onClick={this.handleSubmit} >😙</div><div onClick={this.handleSubmit} >😚</div><div onClick={this.handleSubmit} >😛</div><div onClick={this.handleSubmit} >😜</div><div onClick={this.handleSubmit} >😝</div><div onClick={this.handleSubmit} >😞</div><div onClick={this.handleSubmit} >😟</div><div onClick={this.handleSubmit} >😠</div><div onClick={this.handleSubmit} >😡</div><div onClick={this.handleSubmit} >😢</div><div onClick={this.handleSubmit} >😣</div><div onClick={this.handleSubmit} >😤</div><div onClick={this.handleSubmit} >😥</div><div onClick={this.handleSubmit} >😦</div><div onClick={this.handleSubmit} >😧</div><div onClick={this.handleSubmit} >😨</div><div onClick={this.handleSubmit} >😩</div><div onClick={this.handleSubmit} >😪</div><div onClick={this.handleSubmit} >😫</div><div onClick={this.handleSubmit} >😬</div><div onClick={this.handleSubmit} >😭</div><div onClick={this.handleSubmit} >😮</div><div onClick={this.handleSubmit} >😯</div><div onClick={this.handleSubmit} >😰</div><div onClick={this.handleSubmit} >😱</div><div onClick={this.handleSubmit} >😲</div><div onClick={this.handleSubmit} >😳</div><div onClick={this.handleSubmit} >😴</div><div onClick={this.handleSubmit} >😵</div>
            </div>
            </div>
        </div>
      </div>
    )
  }
}

export default MarkupEmojiModal
