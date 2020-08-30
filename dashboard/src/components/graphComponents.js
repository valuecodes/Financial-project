import React,{useEffect, useState} from 'react'

export function SetTimePeriod({time,setTime,type='full', yearsFrom=2020, yearsTo=2020, all=true}) {

    const [timePeriods, setTimePeriods] = useState([])

    useEffect(() => {
        
        if(type==='full'){
            changeTimePeriod('1.years')
            setTimePeriods(['3.months-months', '6.months-months','1.years-years','3.years-years','5.years-years','10.years-years','20.years-years'])
        }else if(type==='yearly'){
            
            let years = Array.from({length:(yearsTo+1)-yearsFrom},(v,k)=>k+yearsFrom+'.-fyears')
            if(all){
                years.push('All.-all')
                changeTimePeriod('All.-all')
            }else{
                changeTimePeriod(yearsTo+'.-fyears')
            }
            setTimePeriods(years)
        }
    }, [type,yearsFrom,yearsTo])

    function changeTimePeriod(value){
        const number = value.split('.')[0]
        const period = value.split('-')[1]
        let start=new Date()
        let end=new Date()
        switch(period){
            case 'months':
                start.setMonth(start.getMonth()- number);
                break 
            case 'years':
                start.setFullYear(start.getFullYear() - number);   
                break  
            case 'fyears':
                start = new Date(number, 0, 1);
                end = new Date(number, 12, 0);   
                break
            case 'all':
                start = new Date(yearsFrom, 0, 1);
                break
            default: start.setFullYear(start.getFullYear() - 1);   
        }
        setTime({
            value,
            start,
            end
        })
    }

    return (
        <div>
            {timePeriods.map(period =>
                <button  
                style={{backgroundColor:time.value===period&&'lightgreen'}}
                onClick={()=>changeTimePeriod(period)}>{period.replace('.',' ').split('-')[0]}</button>
            )}
        </div>
    )
}
