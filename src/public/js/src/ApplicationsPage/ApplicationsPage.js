import React, { Component } from 'react'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { Header, Container, Icon, Card, Button, Loader } from 'semantic-ui-react'

import { appActions } from '../_actions'
import { history } from '../_helpers'

class ApplicationsPage extends Component {

    componentDidMount() {
        this.props.dispatch(appActions.getAll())
    }

    renderNewAppCard() {
        return (
            <Card key={'new-app'}>
                <Card.Content>
                    <Card.Header>New application</Card.Header>
                    <Card.Meta>My app</Card.Meta>
                    <Card.Description>
                        Create a new application.
                        Applications allow your gateways to connect to the cloud.
                        You can add one or more gateways to your application.
                    </Card.Description>
                </Card.Content>
                <Card.Content extra>
                    <Button circular icon='plus' label='Create' color='green' onClick={e => history.push('/apps/new') } />
                </Card.Content>
            </Card>
        )
    }

    renderAppCards() {
        const { apps } = this.props
        const cards = apps.items.map(app => (
            <Card key={app.id}>
                <Card.Content>
                    <Card.Header>{app.name}</Card.Header>
                    <Card.Meta>ID: {app.id}</Card.Meta>
                    <Card.Description>
                        {app.description}
                    </Card.Description>
                </Card.Content>
                <Card.Content extra>
                    <Card.Description>Access key: {app.key}</Card.Description>
                    <Card.Description>Secret key: {app.secret}</Card.Description>
                </Card.Content>
                <Card.Content extra>
                    <Button circular icon='edit' label='Modify' color='green' onClick={e => history.push('/apps/i/' + app.id) } />
                </Card.Content>
            </Card>
        ))
        cards.push(this.renderNewAppCard())
        return cards
    }

    render() {
        const { apps } = this.props

        return (
            <Container>
                <Header as='h1'>
                    <Icon name='lab' circular />
                    <Header.Content>My Apps <Loader active={apps.loading} inline size='small' /></Header.Content>
                </Header>
                <Card.Group>
                    { apps.items && apps.items.length
                        ? this.renderAppCards()
                        : this.renderNewAppCard() }
                </Card.Group>
            </Container>
        )
    }
}

ApplicationsPage.propTypes = {
    apps: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
    const { apps } = state
    return {
        apps
    }
}

const connectedApplicationsPage = connect(mapStateToProps)(ApplicationsPage)
export { connectedApplicationsPage as ApplicationsPage }