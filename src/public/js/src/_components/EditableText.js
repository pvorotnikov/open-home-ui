import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Icon, Input } from 'semantic-ui-react'

export class EditableText extends Component {

    constructor(props) {
        super(props)

        this.state = {
            inEdit: false,
            value: ''
        }
    }

    onChange(e, data) {
        this.setState({ value: data.value })
        if (this.props.onChange) {
            this.props.onChange(e, data)
        }
    }

    startEdit() {
        this.setState({
            inEdit: true,
            value: this.props.text,
        })
    }

    completeEdit() {
        this.setState({inEdit: false})
        this.props.onUpdate(this.state.value)
    }

    renderNonEditableContent() {
        const { text, pre } = this.props

        const textWrapper = pre ? <pre>{text}</pre> : <span>{text}</span>

        return (
            <span>
                { textWrapper }
                { '' !== text && <Icon link name='edit' size='small' style={{marginLeft: '10px'}} onClick={this.startEdit.bind(this)} /> }
            </span>
        )
    }

    renderEditableContent() {
        const { text } = this.props
        const Component = this.props.as

        return (
            <span>
                <Component size='small' defaultValue={text} onChange={this.onChange.bind(this)} />
                <Icon link name='save' size='small' style={{marginLeft: '10px'}} onClick={this.completeEdit.bind(this)} />
            </span>
        )
    }

    render() {
        return this.state.inEdit
            ? this.renderEditableContent()
            : this.renderNonEditableContent()
    }

}

EditableText.defaultProps = {
    as: Input,
    pre: false,
}

EditableText.propTypes = {
    as: PropTypes.func,
    pre: PropTypes.bool,
    text: PropTypes.string.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onChange: PropTypes.func,
}
