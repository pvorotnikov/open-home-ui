import moment from 'moment'
import { todoConstants } from '../_constants'

export function todos(state = [], action) {

    switch (action.type) {

        case todoConstants.ADD:
            return [
                ...state,
                {
                    id: action.id,
                    text: action.text,
                    completed: false,
                    created: moment(),
                    updated: moment(),
                }
            ]

        case todoConstants.TOGGLE:
            return state.map((todo) =>
                todo.id === action.id
                    // set completed flag to true and refresh updated timestamp
                    ? {...todo, completed: !todo.completed, updated: moment() }
                    : todo
            )

        default:
            return state
    }

}

export function visibilityFilter(state = todoConstants.FILTER_SHOW_ALL, action) {

    switch (action.type) {

        case todoConstants.FILTER:
            return action.filter

        default:
            return state
    }

}
