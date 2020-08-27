import React,{useState} from 'react'

export default function SearchBox({items, addItem}) {

    const [search, setSearch] = useState('')

    const results=!search?
    []:
    items.filter(ticker=>{
        return( ticker[1].toLowerCase().includes(search.toLocaleLowerCase())||ticker[2].toLowerCase().includes(search.toLocaleLowerCase()))
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
                        {addItem(ticker[0])
                        setSearch('')}
                        }
                        >
                            <p>{ticker[1]}</p> 
                            <p>{ticker[2]}</p> 
                        </div>
                }
            })}
        </div>
    )
}
