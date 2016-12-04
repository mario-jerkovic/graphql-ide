import electron from "electron"
import {fromJS, Map} from "immutable"
import {createStore, applyMiddleware, compose} from "redux"
import thunk from "redux-thunk"
import createLogger from "redux-logger"
import fs from "fs"

export default (rootReducer, dataStore) => {

    const dataPath = electron.remote.app.getPath('userData')
    const filePath = dataPath + '/state.json'

    let initialState = Map()

    if (fs.existsSync(filePath)) {
        const state = fs.readFileSync(filePath, 'utf-8')
        initialState = fromJS(JSON.parse(state))
    }

    const logger = createLogger()

    const createStoreWithMiddleware = applyMiddleware(thunk, logger)(createStore)

    const store = createStoreWithMiddleware(rootReducer, initialState, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({
            actionCreators: dataStore.getFlatActionCreators()
        }))

    store.subscribe(() => {
        const state = store.getState().toJSON()
        fs.writeFileSync(filePath, JSON.stringify(state, null, 4), 'utf-8')
    })

    return store
}