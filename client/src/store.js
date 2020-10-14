import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { tickerListDataReducer, tickerDataReducer, tickerPortfolioDataReducer, tickerSaveReducer, tickerDeleteReducer, tickerUpdateRatiosReducer, tickerApiFinancialsReducer, tickerRatiosReducer } from './reducers/tickerReducers';
import { userSigninReducer, userRegisterReducer } from './reducers/userReducers';
import Cookie from 'js-cookie'
import { 
    portfolioUserListReducer,
    portfolioCreateReducer, 
    portfolioAddTickerReducer, 
    portfolioDeleteReducer, 
    portfolioAddTransactionReducer, 
    portfolioUpdateTransactionReducer,
    portfolioDeleteTransactionReducer, 
    portfolioDeleteTickerReducer,
    portfolioUpdateReducer,
    portfolioSelectedReducer
} from './reducers/portfolioReducers';
import { exhangeRateListReducer, exhangeRateUpdateReducer } from './reducers/exhangeRateReducer';

const userInfo = Cookie.getJSON('userInfo') || null
const initialState = {userSignin:{userInfo},userPortfolios:[],}

const reducer = combineReducers({
    
    userSignin: userSigninReducer,
    userRgister: userRegisterReducer,
    
    portfolioCreate: portfolioCreateReducer,
    portfolioUpdate: portfolioUpdateReducer,
    portfolioDelete: portfolioDeleteReducer,
    portfolioAddTicker: portfolioAddTickerReducer,
    portfolioDeleteTicker: portfolioDeleteTickerReducer,
    portfolioAddTransaction: portfolioAddTransactionReducer,
    portfolioUpdateTransaction: portfolioUpdateTransactionReducer,
    portfolioDeleteTransaction: portfolioDeleteTransactionReducer,
    portfolioUserList: portfolioUserListReducer,
    portfolioSelected:portfolioSelectedReducer,
    
    tickerListData: tickerListDataReducer,
    tickerData:tickerDataReducer,
    tickerSave: tickerSaveReducer,
    tickerDelete: tickerDeleteReducer,
    tickerUpdateRatios: tickerUpdateRatiosReducer,
    tickerApiFinancials: tickerApiFinancialsReducer,

    tickerRatios: tickerRatiosReducer,

    exhangeRateList:exhangeRateListReducer,
    exhangeRateUpdate:exhangeRateUpdateReducer
})

const composeEnchancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__||compose

const store = createStore(reducer, initialState, composeEnchancer(applyMiddleware(thunk)))
export default store