import React,{useState} from 'react'

export default function SearchInput({currentTickers,selectTicker }) {

    const [search, setSearch] = useState('')

    const results=!search?
    []:
    currentTickers.filter(ticker=>{
        return( ticker.ticker.toLowerCase().includes(search.toLocaleLowerCase())||ticker.name.toLowerCase().includes(search.toLocaleLowerCase()))
    })

    return (
        <div className='searchBox'>
            <input type='text' onChange={e => 
                setSearch(e.target.value)}
            />
            {results.map((ticker,index) =>{
                if(index<10){
                    return <div 
                        key={ticker.ticker}
                        className='searchResult' 
                        onClick={e => 
                        {selectTicker(ticker.ticker)
                        setSearch('')}
                        }>
                            <p>{ticker.ticker}</p> 
                            <p>{ticker.name}</p> 
                        </div>
                }
            })}
        </div>
    )
}

