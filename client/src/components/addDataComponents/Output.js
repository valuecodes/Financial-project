import React from 'react'

export default function Output({selectedData,setSelectedData,dataText,setCompanyInfo, companyInfo}) {
    function modifyItem(item, elem,e){
        let data = {...companyInfo}
        if(dataText==='profile'){
            data.profile[item]=e.target.value
        }else{
            let index=data[dataText].findIndex(x => x._id===item._id)
            data[dataText][index][elem]=e.target.value
        }   
        setCompanyInfo(data)
    }

    function deleteItem(item){
        let data = {...companyInfo}
        let updated=data[dataText].filter(x => x._id!==item._id)
        data[dataText]=updated
        setCompanyInfo(data)
        setSelectedData({ dataText:dataText, state:data[dataText]})
    }

    function addItem(){
        let data = {...companyInfo}
        let newItem={...data[dataText][0]}
        for(let key in newItem){
            newItem[key]=''
        }
        delete newItem._id
        data[dataText].unshift(newItem)
        setCompanyInfo(data)
        setSelectedData({ dataText:dataText, state:data[dataText]})
    }

    function getBGColor(value){
        if(!value){
            return 'rgb(255, 202, 196)'
        }

        return value.toString()==='NaN'?'rgb(255, 202, 196)':'rgb(199, 240, 210)'
    }

    return (
        <div className='modifyData'>
            <button onClick={addItem}>Add item</button>  
            <table>
                <thead>
                    <tr>
                    {selectedData[0]&&Object.keys(selectedData[0]).map(header =>
                        <td>{spacecamel(header)}</td>
                    )}
                    {dataText==='profile'&&
                        Object.keys(selectedData).map(item => 
                            <td>{spacecamel(item)}</td>
                        ) 
                    }                        
                    </tr>
                </thead>
                <tbody>
                    {dataText==='profile'?
                        Object.keys(selectedData).map(item => 
                            <td>
                                <input 
                                style={{backgroundColor:getBGColor(1)}} 
                                value={selectedData[item]} 
                                onChange={e => modifyItem(item, selectedData,e)}
                                />
                            </td>
                        )                  
                    :
                        selectedData.map(item=>
                            <tr >

                                {Object.keys(item).map(elem=>
                                    <td>
                                        <input style={{backgroundColor:getBGColor(item[elem])}} value={item[elem]} onChange={e => modifyItem(item, elem,e)}/>
                                    </td>
                                )}
                                <td>
                                    <button onClick={e => deleteItem(item)}>Delete</button>
                                </td>
                            </tr>
                        )}                   
                </tbody>
            </table>
                              


        </div>
    )
}

function spacecamel(s){
    return s.replace(/([a-z])([A-Z])/g, '$1 $2');
}