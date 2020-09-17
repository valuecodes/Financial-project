import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom'
import AddDataScreen from './screens/AddDataScreen'
import Header from './components/Header'
import HomeScreen from './screens/HomeScreen'
import SigninScreen from './screens/SigninScreen'
import RegisterScreen from './screens/RegisterScreen';
import TradingScreen from './screens/TradingScreen';
import TickerScreen from './screens/TickerScreen'
import PortfolioScreen from './screens/PortfolioScreen'

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header/>
        <main className='main'>
          <Route path='/addData' component={AddDataScreen}/>
          <Route path='/register' component={RegisterScreen}/>
          <Route path='/signin' component={SigninScreen}/>
          <Route path='/ticker/:id' component={TickerScreen}/>
          <Route path='/portfolio/:id' component={PortfolioScreen}/>
          <Route path='/trading' component={TradingScreen}/>
          <Route path='/' exact={true} component={HomeScreen}/>
        </main>
      </div>    
    </BrowserRouter>
  );
}

export default App;
