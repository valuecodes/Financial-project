import React,{useState,useEffect} from 'react'

export default function SearchBox({tickers, addItem, placeholder}) {

    const [searchList, setSearchList] = useState([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        if(tickers){
            setSearchList(tickers)
        }
    }, [tickers])

    let results=!search?
    []:
    searchList.filter(ticker=>
        ticker.ticker.toLowerCase().includes(search.toLocaleLowerCase())||ticker.name.toLowerCase().includes(search.toLocaleLowerCase())
    )
    
    const searchHandler = (ticker) => {
        addItem(ticker)
        setSearch('')
    }

    return (
        <div className='searchBox'>
            <input type='text' 
                onChange={e => setSearch(e.target.value)}
                value={search}
                placeholder={placeholder}
            />
            {results.map((ticker,index) =>{
                if(index<10){
                    return <div 
                        key={ticker.tickerId}
                        className='searchResult' 
                        onClick={() => searchHandler(ticker)}
                        >
                            <p>{ticker.ticker}</p> 
                            <p>{ticker.name}</p> 
                        </div>
                }else{
                    return null
                }
            })}
        </div>
    )
}
