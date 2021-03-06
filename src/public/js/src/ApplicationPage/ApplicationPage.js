import React, { Component } from 'react'
import PropTypes from 'prop-types'
import reactCSS from 'reactcss'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Rules } from './'

import {
    Header,
    Container,
    Icon,
    Button,
    Loader,
    Segment,
    Label,
    List,
    Card,
    Dimmer,
    Checkbox,
} from 'semantic-ui-react'

import { appActions, scopeActions, gatewayActions, ruleActions } from '../_actions'
import { EditableText, ConfirmModal } from '../_components'
import { FEEDBACK_CHANNEL } from '../_constants'

class ApplicationPage extends Component {

    componentDidMount() {
        this.props.dispatch(scopeActions.getAll())
        this.props.dispatch(appActions.getSingle(this.props.match.params.id))
        this.props.dispatch(gatewayActions.getAll(this.props.match.params.id))
        this.props.dispatch(ruleActions.getAll(this.props.match.params.id))
    }

    componentWillUnmount() {
        this.props.dispatch(scopeActions.clear())
        this.props.dispatch(appActions.clear())
        this.props.dispatch(gatewayActions.clear())
        this.props.dispatch(ruleActions.clear())
    }

    onEditableTextUpdate(name, value) {
        const { app } = this.props
        value = value.trim()
        let updatedApp = {
            [name]: value,
        }
        this.props.dispatch(appActions.update(app.id, updatedApp))
    }

    onGatewayPropertyUpdate(gatewayId, name, value) {
        value = value.trim()
        let updatedGateway = {
            [name]: value,
        }
        this.props.dispatch(gatewayActions.update(gatewayId, updatedGateway))
    }

    onPublicUpdate(name, data) {
        const { app } = this.props
        this.props.dispatch(appActions.update(app.id, { public: data.checked }))
    }

    refreshKey() {
        this.props.dispatch(appActions.refreshKey(this.props.app.id))
    }

    refreshSecret() {
        this.props.dispatch(appActions.refreshSecret(this.props.app.id))
    }

    handleDeleteGateway(id) {
        this.props.dispatch(gatewayActions.delete(id))
    }

    handleDeleteApp() {
        this.props.dispatch(appActions.delete(this.props.match.params.id, this.props.history))
    }

    handleRuleSubmit(rule) {
        this.props.dispatch(ruleActions.create({...rule, application: this.props.match.params.id}))
    }

    handleRuleDelete(id) {
        this.props.dispatch(ruleActions.delete(id))
    }

    renderHeader() {
        const { app } = this.props
        return (
            <Container>
                <Header as='h1'>
                    <Icon name='lab' circular />
                    <Header.Content>
                        <EditableText text={app.name || ''} onUpdate={(value) => this.onEditableTextUpdate('name', value)} />
                        <Loader active={this.props.loading} inline size='small' />
                        <Header.Subheader>{app.id && `ID: ${app.id}`}</Header.Subheader>
                        <Header.Subheader>
                            Alias: <EditableText text={app.alias || ''} onUpdate={(value) => this.onEditableTextUpdate('alias', value.toLowerCase().replace(/\s/g, ''))} />
                        </Header.Subheader>
                    </Header.Content>
                </Header>
                <EditableText text={app.description || ''} onUpdate={(value) => this.onEditableTextUpdate('description', value)} />
            </Container>
        )
    }

    renderCredentials() {
        const { app } = this.props

        return (
            <Segment raised>
                <Dimmer active={!app.key} inverted>
                    <Loader inverted />
                </Dimmer>
                <Label color='blue' ribbon>Credentials</Label>
                <p style={{padding: "10px 10px 0 10px"}}>
                    Use these credentials when establishing connection over MQTT or HTTP.
                    Using MQTT they need to be provided as 'username' and 'password'.
                    Using HTTP they should be used as Basic authorization method.
                </p>
                <List>
                    <List.Item>
                        <Label color='green' horizontal>Access key</Label>
                        &nbsp;
                        <span>
                            {app.key}
                            <ConfirmModal title='Are you sure you want to refresh this key?'
                                trigger={<Icon link name='refresh' style={{marginLeft: '10px'}} />}
                                onConfirm={this.refreshKey.bind(this)} />
                        </span>
                    </List.Item>
                    <List.Item>
                        <Label color='green' horizontal>Secret key</Label>
                        &nbsp;
                        <span>
                            {app.secret}
                            <ConfirmModal title='Are you sure you want to refresh this key?'
                                trigger={<Icon link name='refresh' style={{marginLeft: '10px'}} />}
                                onConfirm={this.refreshSecret.bind(this)} />
                        </span>
                    </List.Item>
                </List>
            </Segment>
        )
    }

    renderGateways() {
        const { gateways, app } = this.props

        if (!app.hasOwnProperty('id')) {
            return
        }

        return (
            <Segment raised>
                <Dimmer active={gateways.loading} inverted>
                    <Loader inverted />
                </Dimmer>
                <Label color='blue' ribbon>Gateways</Label>
                <Card.Group style={{ marginTop: '5px' }}>
                    { gateways.items && gateways.items.length
                        ? this.renderGatewaysCards()
                        : this.renderNewGatewayCard() }
                </Card.Group>
            </Segment>
        )
    }

    renderNewGatewayCard() {
        const appId = this.props.app.id
        const { history } = this.props
        return (
            <Card key={'new-gateway'}>
                <Card.Content>
                    <Card.Header>New gateway</Card.Header>
                    <Card.Meta>My gateway</Card.Meta>
                    <Card.Description>
                        Create a new gateway.
                        Gateways establish connection to the cloud.
                        You can connect your end-devices to gateways
                        allowing them to send and receive information
                        or a gateway can act as an end device.
                    </Card.Description>
                </Card.Content>
                <Card.Content extra>
                    <Button circular icon='plus' label='Create' color='green' onClick={e => history.push(`/apps/i/${appId}/newgw`) } />
                </Card.Content>
            </Card>
        )
    }

    renderGatewaysCards() {
        const { gateways } = this.props
        const appId = this.props.app.id
        const styles = reactCSS({
            default: {
                delete: {
                    position: 'absolute',
                    top: 5,
                    right: 0,
                },
            }
        })

        const cards = gateways.items.map(gateway => (
            <Card key={gateway.id}>
                <Dimmer active={gateway.deleting} inverted>
                    <Loader inverted />
                </Dimmer>
                <Card.Content>
                    <ConfirmModal title='Are you sure you want to delete this gateway?'
                        trigger={<Icon style={styles.delete} link circular name='delete' color='red' />}
                        onConfirm={() => this.handleDeleteGateway(gateway.id)} />
                    <Card.Header>
                        <EditableText text={gateway.name} onUpdate={(value) => this.onGatewayPropertyUpdate(gateway.id, 'name', value)} />
                    </Card.Header>
                    <Card.Meta>ID: {gateway.id}</Card.Meta>
                    <Card.Meta>
                        Alias: <EditableText text={gateway.alias} onUpdate={(value) => this.onGatewayPropertyUpdate(gateway.id, 'alias', value.toLowerCase().replace(/\s/g, ''))} />
                    </Card.Meta>
                    <Card.Description>
                        <EditableText text={gateway.description} onUpdate={(value) => this.onGatewayPropertyUpdate(gateway.id, 'description', value)} />
                    </Card.Description>
                </Card.Content>
                <Card.Content extra>
                    <Label>
                        Ingress
                        <Label.Detail>{gateway.statsIn}</Label.Detail>
                    </Label>
                    <Label>
                        Egress
                        <Label.Detail>{gateway.statsOut}</Label.Detail>
                    </Label>
                </Card.Content>
                <Card.Content extra>
                    <Button as={Link} to={`/apps/i/${appId}/g/${gateway.id}`} circular icon='edit' label='Modify' color='green' />
                </Card.Content>
            </Card>
        ))
        cards.push(this.renderNewGatewayCard())
        return cards
    }

    renderFeedbackChannels() {
        const { gateways, app } = this.props

        if (!gateways.items || !app.hasOwnProperty('id')) {
            return
        }

        const channels = gateways.items.map(gateway => (
            <List.Item key={gateway.id}>
                <Label color='green' horizontal>{gateway.name}</Label>
                    <Label>{app.id}</Label>/
                    <Label>{gateway.id}</Label>/
                    <Label>{FEEDBACK_CHANNEL}</Label>
            </List.Item>
        ))

        return (
            <Segment raised>
                <Label color='blue' ribbon>Feedback channels</Label>
                <Container style={{padding: "10px 10px 0 10px"}}>
                    You can subscribe to these topics when you want to receive server push messages:
                </Container>
                <List>
                    <List.Item>
                        <Label color='green' horizontal>Application broadcast</Label>
                        <Label>{app.id}</Label>/<Label>{FEEDBACK_CHANNEL}</Label>
                    </List.Item>
                    { channels }
                </List>
            </Segment>
        )
    }

    renderSettings() {

        const { app } = this.props

        if (!app.hasOwnProperty('id')) {
            return
        }

        return (
            <Segment raised>
                <Label color='blue' ribbon>Settings</Label>
                <Container style={{padding: "10px 10px 0 10px"}}>
                    Here be dragons!
                </Container>
                <List relaxed>
                    <List.Item>
                        <List.Content>
                            <Checkbox label='Public app'
                                defaultChecked={this.props.app.public}
                                onChange={this.onPublicUpdate.bind(this)} />
                        </List.Content>
                    </List.Item>
                    <List.Item>
                        <ConfirmModal title='Are you sure you want to delete this app?'
                            text='This action cannot be undone.'
                            trigger={<Button circular icon='delete' label='Delete app' color='red' />}
                            onConfirm={this.handleDeleteApp.bind(this)} />
                    </List.Item>
                </List>
            </Segment>
        )
    }

    render() {
        const { app } = this.props
        return (
            <Container>
                { this.renderHeader() }
                { this.renderCredentials() }
                <Rules rules={this.props.rules}
                    scopes={this.props.scopes}
                    application={this.props.app}
                    onDelete={id => this.handleRuleDelete(id)}
                    onSubmit={rule => this.handleRuleSubmit(rule)} />
                { this.renderGateways() }
                { this.renderFeedbackChannels() }
                { this.renderSettings() }
            </Container>
        )
    }
}

ApplicationPage.propTypes = {
    loading: PropTypes.bool,
    app: PropTypes.object.isRequired,
    gateways: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
}

ApplicationPage.defaultProps = {
    app: {},
    gateways: {},
}

function mapStateToProps(state) {
    const { apps, gateways, rules, scopes } = state
    const { app, loading } = apps
    return {
        scopes: scopes.items,
        app,
        loading,
        gateways,
        rules,
    }
}

const connectedApplicationPage = connect(mapStateToProps)(withRouter(ApplicationPage))
export { connectedApplicationPage as ApplicationPage }
