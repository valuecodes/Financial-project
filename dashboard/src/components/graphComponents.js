import React,{useEffect, useState} from 'react'

export function SetTimePeriod({options,setOptions,type='full', yearsFrom=2020, yearsTo=2020, all=true}) {

    const [timePeriods, setTimePeriods] = useState([])

    useEffect(() => {
        
        if(type==='full'){
            changeTimePeriod('1.years')
            setTimePeriods(['3.month-months', '6.months-months','1.years-years','3.years-years','5.years-years','10.years-years','20.years-years'])
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

    function changeTimePeriod(timeValue){
        const number = timeValue.split('.')[0]
        const period = timeValue.split('-')[1]
        let timeStart=new Date()
        let timeEnd=new Date()
        switch(period){
            case 'months':
                timeStart.setMonth(timeStart.getMonth()- number);
                break 
            case 'years':
                timeStart.setFullYear(timeStart.getFullYear() - number);   
                break  
            case 'fyears':
                timeStart = new Date(number, 0, 1);
                timeEnd = new Date(number, 12, 0);   
                break
            case 'all':
                timeStart = new Date(yearsFrom, 0, 1);
                break
            default: timeStart.setFullYear(timeStart.getFullYear() - 1);   
        }
        setOptions({
            ...options,
            time:{
                timeValue,
                timeStart,
                timeEnd                
            }
        })
    }

    return (
        <div>
            {timePeriods.map(period =>
                <button  
                key={period}
                style={{backgroundColor:options.time.timeValue===period&&'lightgreen'}}
                onClick={()=>changeTimePeriod(period)}>{period.replace('.',' ').split('-')[0]}</button>
            )}
        </div>
    )
}
