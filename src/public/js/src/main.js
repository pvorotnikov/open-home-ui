import React from 'react'
import { render} from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import { store } from './_helpers'
import App from './components/App'

// App bootstrap
render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
)
