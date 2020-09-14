import React,{useState,useEffect} from 'react'

export default function SearchBox({items, addItem, placeholder}) {

    const [searchList, setSearchList] = useState([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        if(items){
            setSearchList(items)
        }
    }, [items])

    let results=!search?
    []:
    searchList.filter(ticker=>
        ticker[1].toLowerCase().includes(search.toLocaleLowerCase())||ticker[2].toLowerCase().includes(search.toLocaleLowerCase())
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
                        key={ticker.ticker}
                        className='searchResult' 
                        onClick={() => searchHandler(ticker)}
                        >
                            <p>{ticker[1]}</p> 
                            <p>{ticker[2]}</p> 
                        </div>
                }else{
                    return null
                }
            })}
        </div>
    )
}
